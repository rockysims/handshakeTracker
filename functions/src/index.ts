import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

const entryDoc = functions.firestore.document('/users/{userId}/entries/{entryId}');
exports.onEntryCreate = entryDoc.onCreate((snap, context) => {
	return snap.ref.update({
		lastChangeTimestamp: Date.now(),
		lastIndexTimestamp: 0
	}).then(() => {
		return updateLatestChangeTimestamp(context.params.userId);
	});
});
exports.onEntryUpdate = entryDoc.onUpdate((change, context) => {
	const before: any = change.before!.data();
	const after: any = change.after!.data();
	delete before['lastChangeTimestamp'];
	delete after['lastChangeTimestamp'];
	const reallyChanged = JSON.stringify(before) !== JSON.stringify(after);

	if (reallyChanged) {
		return change.after!.ref.update({
			lastChangeTimestamp: Date.now()
		}).then(() => {
			return updateLatestChangeTimestamp(context.params.userId);
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
			return updateLatestChangeTimestamp(userId);
		});
});

function updateLatestChangeTimestamp(userId: string) {
	return admin.firestore().collection(`/users/${userId}/latest`).doc('change').set({
		timestamp: Date.now()
	});
}