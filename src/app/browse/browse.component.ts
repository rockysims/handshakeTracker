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
	recentlyDeletedEntryIds = [];

	constructor(
		private db: AngularFirestore,
		private endpointService: EndpointService
	) {
		this.entriesIndex = algoliasearch(environment.algolia.appId, environment.algolia.searchKey)
			.initIndex('entries');

		db.doc(endpointService.latestIndex()).valueChanges().pipe(
			takeUntil(this.ngUnsubscribe)
		).subscribe(() => {
			//update search results (since algolia's index was updated)
			console.log('algolia index was updated');
			this.entriesIndex.clearCache();
			this.updateSearchResults();
		});
	}

	ngOnInit() {
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
		const searchText = this.searchTextCtrl.value || '';
		const searchFilter = this.recentlyDeletedEntryIds.map(id => {
			return `NOT objectID:${id}`;
		}).join(' AND ');

		const self = this;
		this.entriesIndex.search({
			query: searchText,
			filters: searchFilter
		}).then(results => {
			self.entries$.next(results.hits);
		}, err => {
			console.error(err);
		}).finally(() => console.log('searched'));
	}

	onDelete(entry) {
		this.recentlyDeletedEntryIds.push(entry.id);
		this.updateSearchResults();
	}
}

