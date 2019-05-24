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
	let staleCount = 0;
	let deleteCount = 0;

	//update stale entries
	const staleEntriesRef = admin.firestore().collection(`users/${userId}/entries`)
		.where('lastChangeGreaterThanLastIndex', '==', true); //lastChangeTimestamp > lastIndexTimestamp
	const stalePromise: Promise<void> = staleEntriesRef.get()
		.then(snap => {
			allOutputs.push('staleEntries: ' + snap.docs.length);
			if (!snap.empty) {
				const algoliaPromises: Promise<void>[] = [];
				const batch = admin.firestore().batch();
				const entriesIndex = algoliaClient.initIndex(`users_${userId}_entries`);
				snap.forEach(doc => {
					const entry: any = {
						objectID: doc.id,
						id: doc.id,
						data: doc.data()
					};
					delete entry['lastChangeGreaterThanLastIndex'];
					delete entry['lastChangeTimestamp'];
					delete entry['lastIndexTimestamp'];

					algoliaPromises.push(new Promise(resolve => {
						entriesIndex.saveObject(entry, function(err, content) {
							if (err) allErrors.push('entriesIndex.addObject() failed with err: ' + err);
							else {
								batch.update(doc.ref, {lastIndexTimestamp: doc.data().lastChangeTimestamp});
								staleCount++;
							}
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
				const entriesIndex = algoliaClient.initIndex(`users_${userId}_entries`);
				snap.forEach(doc => {
					algoliaPromises.push(new Promise(resolve => {
						entriesIndex.deleteObject(doc.id, function(err, content) {
							if (err) allErrors.push('entriesIndex.deleteObject() failed with err: ' + err);
							else {
								batch.delete(doc.ref);
								deleteCount++;
							}
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
		function waitForActualAlgoliaUpdate(): Promise<void> {
			//update latest timestamp in algolia
			const latestTimestamp = Date.now();
			const latestIndex = algoliaClient.initIndex(`users_${userId}_latest`);
			const updateLatestTimestampPromise = latestIndex.saveObject({
				objectID: 'timestamp',
				value: latestTimestamp
			});

			//poll algolia until latest timestamp actually updates
			return updateLatestTimestampPromise.then(() => {
				return new Promise<void>((resolve, reject) => {
					let pollingLimit = 10;
					pollAlgolia();
					function pollAlgolia() {
						if (pollingLimit-- > 0) {
							latestIndex.clearCache();
							latestIndex.search('').then(results => {
								const hit = results.hits[0];
								const algoliaActuallyUpdated = hit && hit.value >= latestTimestamp;
								console.log('algoliaActuallyUpdated: ', algoliaActuallyUpdated); //TODO: delete this line
								if (algoliaActuallyUpdated) resolve();
								else setTimeout(pollAlgolia, 500);
							}, reject);
						} else reject('Polling limit exhausted.');
					}
				});
			});
		}

		if (staleCount + deleteCount > 0) {
			waitForActualAlgoliaUpdate().then(() => {
				admin.firestore().doc(`users/${userId}/latest/index`).set({
					timestamp: Date.now()
				});
			}, reason => {
				const errMsg = `waitForActualAlgoliaUpdate() failed because: ${reason}`;
				console.error(errMsg);
				allErrors.push(errMsg);
			});
		}
		else console.log('staleCount + deleteCount not > 0'); //TODO: delete this line

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

app.listen(port);



