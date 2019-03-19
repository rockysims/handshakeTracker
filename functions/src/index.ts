import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

const entryDoc = functions.firestore.document('/users/{userId}/entries/{entryId}');
exports.onEntryCreate = entryDoc.onCreate((snap, context) => {
	return snap.ref.update({
		algoliaDirty: true
	});
});
exports.onEntryUpdate = entryDoc.onUpdate((change, context) => {
	return change.after!.ref.update({
		algoliaDirty: true
	});
});
exports.onEntryDelete = entryDoc.onDelete((snap, context) => {
	const userId = context.params.userId;
	const entryId = context.params.entryId;
	return admin.firestore()
		.collection(`/users/${userId}/deletedEntryIds`)
		.doc(entryId)
		.set({});
});








// import * as algoliasearch from 'algoliasearch';
//
// const algoliaClient = algoliasearch(
// 	functions.config().algolia.app_id,
// 	functions.config().algolia.api_key
// );
//
// const entryDoc = functions.firestore.document('/users/{userId}/entries/{entryId}');
// exports.onEntryCreate = entryDoc.onCreate((snap, context) => {
// 	return algoliaClient
// 		.initIndex('entries')
// 		.saveObject({
// 			objectID: context.params.entryId,
// 			...snap.data()
// 		});
// });
// exports.onEntryUpdate = entryDoc.onUpdate((change, context) => {
// 	return algoliaClient
// 		.initIndex('entries')
// 		.saveObject({
// 			objectID: context.params.entryId,
// 			...change.after!.data()
// 		});
// });
// exports.onEntryDelete = entryDoc.onDelete((snap, context) => {
// 	return algoliaClient
// 		.initIndex('entries')
// 		.deleteObject(context.params.entryId);
// });