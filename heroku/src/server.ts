import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';
import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
});

app.get('/', (req, res) => {
	res.send('working');
});

// app.get('/algolia', (req, res) => {
// 	const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
// 	const index = client.initIndex('test_index_name');
// 	const testJson = {
// 		objectID: 42,
// 		name: 'testJsonName'
// 	};
//
// 	index.addObject(testJson, function(err, content) {
// 		if (err) console.error(err);
// 		console.log('addObject() done');
// 		res.write('addObject() done');
// 		res.end();
// 	});
//
// 	res.write('Hello world from typescript express!');
// });

admin.initializeApp({
	credential: admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY
	}),
	databaseURL: process.env.FIREBASE_DATABASE_URL
});

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);

app.get('/update-algolia-index-for/:userId', (req, res) => {
	const userId = req.params.userId;
	const allOutputs: string[] = [];
	const allErrors: string[] = [];

	//update stale entries
	const staleEntriesRef = admin.firestore().collection(`users/${userId}/entries`)
		.where('lastChangeGreaterThanLastIndex', '==', true); //lastChangeTimestamp > lastIndexTimestamp
	const stalePromise: Promise<void> = staleEntriesRef.get()
		.then(snap => {
			allOutputs.push('staleEntries: ' + snap.docs.length);
			if (!snap.empty) {
				const algoliaPromises: Promise<void>[] = [];
				const batch = admin.firestore().batch();
				const entriesIndex = algoliaClient.initIndex('entries');
				snap.forEach(doc => {
					const entry: any = {
						objectID: doc.id,
						...doc.data()
					};
					delete entry['lastChangeGreaterThanLastIndex'];
					delete entry['lastChangeTimestamp'];
					delete entry['lastIndexTimestamp'];

					algoliaPromises.push(new Promise(resolve => {
						entriesIndex.addObject(entry, function(err, content) {
							if (err) allErrors.push('entriesIndex.addObject() failed with err: ' + err);
							else batch.update(doc.ref, {lastIndexTimestamp: doc.data().lastChangeTimestamp});
							resolve();
						});
					}));
				});

				return Promise.all(algoliaPromises).then(() => {
					allOutputs.push('stale batch.commit() called');
					return batch.commit()
						.then(() => {})
						.catch(reason => {
							allErrors.push('stale batch.commit() failed because: ' + reason)
						});
				});
			}
		});

	//remove deleted entries
	const deletedEntryIdsRef = admin.firestore().collection(`users/${userId}/deletedEntryIds`);
	const deletePromise: Promise<void> = deletedEntryIdsRef.get()
		.then(snap => {
			allOutputs.push('deletedEntry: ' + snap.docs.length);
			if (!snap.empty) {
				const algoliaPromises: Promise<void>[] = [];
				const batch = admin.firestore().batch();
				const entriesIndex = algoliaClient.initIndex('entries');
				snap.forEach(doc => {
					algoliaPromises.push(new Promise(resolve => {
						entriesIndex.deleteObject(doc.id, function(err, content) {
							if (err) allErrors.push('entriesIndex.deleteObject() failed with err: ' + err);
							else batch.delete(doc.ref);
							resolve();
						});
					}));
				});

				return Promise.all(algoliaPromises).then(() => {
					allOutputs.push('deleted batch.commit() called');
					return batch.commit()
						.then(() => {})
						.catch(reason => {
						allErrors.push('delete batch.commit() failed because: ' + reason)
					});
				});
			}
		});

	Promise.all([stalePromise, deletePromise] as Promise<void>[]).then(() => {
		if (allErrors.length > 0) {
			res.status(500).json({
				allOutputs,
				allErrors
			});
		} else {
			res.json({
				allOutputs,
				allErrors
			});
		}
	});
});

// app.get('/fire', (req, res) => {
// 	res.write('Started /fire handler<br/>');
//
// 	admin.firestore().collection('heroku').doc('fire').set({
// 		worked: true,
// 		now: Date.now()
// 	}).then(() => {
// 		res.write('success write to firebase<br/>');
// 	}, () => {
// 		res.write('failed write to firebase<br/>');
// 	}).finally(() => {
// 		res.end();
// 	});
// });

app.listen(port);



