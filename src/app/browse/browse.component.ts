import {Component, OnDestroy, OnInit} from '@angular/core';
import * as algoliasearch from 'algoliasearch/dist/algoliasearchLite.min.js';
import {environment} from "../../environments/environment";
import {FormControl} from "@angular/forms";
import {debounceTime, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {Index} from "algoliasearch";
import {AngularFirestore} from "@angular/fire/firestore";
import {EndpointService} from "../endpoint.service";

@Component({
	selector: 'app-browse',
	templateUrl: './browse.component.html',
	styleUrls: ['./browse.component.less']
})
export class BrowseComponent implements OnInit, OnDestroy {
	private ngUnsubscribe = new Subject();
	private entriesIndex: Index;
	entries$ = new Subject<Entry[]>();
	searchTextCtrl = new FormControl();

	constructor(
		db: AngularFirestore,
		endpointService: EndpointService
	) {
		this.entriesIndex = algoliasearch(environment.algolia.appId, environment.algolia.searchKey)
			.initIndex('entries');

		db.doc(endpointService.latestIndex()).valueChanges().pipe(
			takeUntil(this.ngUnsubscribe)
		).subscribe(() => {
			console.log('latest index updated');
			setTimeout(() => {
				this.entriesIndex.clearCache();
				this.updateSearchResults();
			}, 0);
		});
	}

	ngOnInit() {

		//TODO: instead of showing results from algolia, get ids from algolia then query firebase
		//	this is mostly to allow optimistic updating/deleting of firebase documents to work
		//	can still rerun search (if algolia index changes after search but while still viewing results)
		//			ALTERNATIVE: just show most recent entries until user types in search (no auto rerun of search)
		//		add any entries missing from original search
		//		delete any entries not in new search (provided user is not editing it?)
		//			make editing an entry it's own page (redirect back to Browse page (remember search) when done)

		this.updateSearchResults();
		this.searchTextCtrl.valueChanges.pipe(
			debounceTime(500)
		).subscribe(() => this.updateSearchResults());
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	updateSearchResults() {
		const searchText = this.searchTextCtrl.value;

		const self = this;
		this.entriesIndex.search(searchText).then(results => {
			self.entries$.next(results.hits);
		}, err => {
			console.error(err);
		}).finally(() => console.log('searched'));
	}
}
