// import * as functions from 'firebase-functions';
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