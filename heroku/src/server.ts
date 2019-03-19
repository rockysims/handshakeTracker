import express from 'express';
import algoliasearch from 'algoliasearch';

const ALGOLIA_APP_ID = 'S8U8I3Q7WF';
const ALGOLIA_ADMIN_API_KEY = '9e068758f92c38fb0e5057f7aaab6f5f';

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
	const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
	const index = client.initIndex('test_index_name');
	const testJson = {
		objectID: 42,
		name: 'testJsonName'
	};

	index.addObject(testJson, function(err, content) {
		if (err) console.error(err);
		console.log('addObject() done');
		res.write('addObject() done');
		res.end();
	});

	res.write('Hello world from typescript express!');
});

app.listen(port);