import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

const entryDoc = functions.firestore.document('/users/{userId}/entries/{entryId}');
exports.onEntryCreate = entryDoc.onCreate((snap, context) => {
	return snap.ref.update({
		lastChangeGreaterThanLastIndex: true,
		lastChangeTimestamp: Date.now(),
		lastIndexTimestamp: 0
	}).then(() => {
		return updateOverallLatestChangeTimestamp(context.params.userId);
	});
});
exports.onEntryUpdate = entryDoc.onUpdate((change, context) => {
	const dataBeforeMinusExceptions: any = change.before!.data();
	const dataAfterMinusExceptions: any = change.after!.data();
	const dataAfter: any = change.after!.data();
	[
		'lastChangeTimestamp',
		'lastIndexTimestamp',
		'lastChangeGreaterThanLastIndex'
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
		}).then(() => {
			if (reallyChanged) {
				return updateOverallLatestChangeTimestamp(context.params.userId);
			} else return;
		});
	} else return;
});
exports.onEntryDelete = entryDoc.onDelete((snap, context) => {
	const userId = context.params.userId;
	const entryId = context.params.entryId;
	return admin.firestore()
		.collection(`/users/${userId}/deletedEntryIds`)
		.doc(entryId)
		.set({})
		.then(() => {
			return updateOverallLatestChangeTimestamp(userId);
		});
});

function updateOverallLatestChangeTimestamp(userId: string) {
	return admin.firestore().collection(`/users/${userId}/latest`).doc('change').set({
		timestamp: Date.now()
	}).then(() => {});
}