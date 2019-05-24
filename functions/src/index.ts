import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

type Handler = () => Promise<boolean>;

const genericEntryDoc = functions.firestore.document('/users/{userId}/entries/{entryId}');
exports.onEntryCreate = genericEntryDoc.onCreate((snap, context) => {
	const handlers: Handler[] = [];
	const userId = context.params.userId;

	handlers.push(() => {
		return snap.ref.update({
			lastChangeGreaterThanLastIndex: true,
			lastChangeTimestamp: Date.now(),
			lastIndexTimestamp: 0
		}).then(() => true); //request update of overall latest change timestamp
	});

	handlers.push(() =>
		saveUnixTimestamp(snap.get('unixTimestamp'), snap.id, userId)
	);

	return runHandlers(handlers, userId);
});
exports.onEntryUpdate = genericEntryDoc.onUpdate((change, context) => {
	const handlers: Handler[] = [];
	const userId = context.params.userId;
	const dataBefore: any = change.before!.data();
	const dataAfter: any = change.after!.data();

	handlers.push(async () => {
		const dataBeforeMinusExceptions: any = change.before!.data();
		const dataAfterMinusExceptions: any = change.after!.data();
		[
			'lastIndexTimestamp', //when entry was last saved to algolia index
			'lastChangeTimestamp', //when entry was last edited (excluding these 3 fields)
			'lastChangeGreaterThanLastIndex' //derived boolean (lastChangeTimestamp > lastIndexTimestamp)
		].forEach(field => {
			delete dataBeforeMinusExceptions[field];
			delete dataAfterMinusExceptions[field];
		});
		const reallyChanged = JSON.stringify(dataBeforeMinusExceptions) !== JSON.stringify(dataAfterMinusExceptions);

		const lastChangeTimestamp = (reallyChanged)
			? Date.now()
			: dataAfter.lastChangeTimestamp;
		const lastChangeGreaterThanLastIndex = lastChangeTimestamp > dataAfter.lastIndexTimestamp;
		const updateNeeded =
			   dataAfter.lastChangeTimestamp !== lastChangeTimestamp
			|| dataAfter.lastChangeGreaterThanLastIndex !== lastChangeGreaterThanLastIndex;
		if (updateNeeded) {
			return change.after!.ref.update({
				lastChangeTimestamp,
				lastChangeGreaterThanLastIndex
			}).then(() =>
				reallyChanged //request update of overall latest change timestamp if reallyChanged
			);
		} else return false;
	});

	if (dataBefore['unixTimestamp'] !== dataAfter['unixTimestamp']) {
		handlers.push(() =>
			saveUnixTimestamp(dataAfter['unixTimestamp'], change.after!.id, userId)
		);
	}

	return runHandlers(handlers, userId);
});
exports.onEntryDelete = genericEntryDoc.onDelete((snap, context) => {
	const handlers: Handler[] = [];
	const userId = context.params.userId;
	const entryId = context.params.entryId;

	handlers.push(() => {
		return admin.firestore()
			.collection(`/users/${userId}/deletedEntryIds`)
			.doc(entryId) //doc will be deleted by heroku after algolia is updated
			.set({})
			.then(() => true); //request update of overall latest change timestamp
	});

	handlers.push(() => {
		return deletingUnixTimestamp(snap.get('unixTimestamp'), entryId, userId);
	});

	return runHandlers(handlers, userId);
});

function runHandlers(handlers: Handler[], userId: string) {
	return Promise.all(
		handlers.map(handler => handler())
	).then(results => {
		if (results.some(r => r === true)) {
			return updateOverallLatestChangeTimestamp(userId);
		} else return null;
	});
}

function saveUnixTimestamp(unixTs: number, entryId: string, userId: string): Promise<boolean> {
	const doc = admin.firestore()
		.collection(`/users/${userId}/derived`)
		.doc('unixTimestampByEntryId');
	return doc
		.update({[entryId]: unixTs})
		.then(() => false); //don't request update of overall latest change timestamp
}
function deletingUnixTimestamp(unixTs: number, entryId: string, userId: string): Promise<boolean> {
	const doc = admin.firestore()
		.collection(`/users/${userId}/derived`)
		.doc('unixTimestampByEntryId');
	return doc
		.get()
		.then(snap => {
			const unixTimestampByEntryId = snap.data() || {};
			delete unixTimestampByEntryId[entryId];
			return doc
				.set(unixTimestampByEntryId)
				.then(() => false); //don't request update of overall latest change timestamp
		});
}

function updateOverallLatestChangeTimestamp(userId: string) {
	return admin.firestore().collection(`/users/${userId}/latest`).doc('change').set({
		timestamp: Date.now()
	}).then(() => null);
}