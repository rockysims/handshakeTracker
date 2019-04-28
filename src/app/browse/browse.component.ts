import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as algoliasearch from 'algoliasearch/dist/algoliasearchLite.min.js';
import {environment} from "../../environments/environment";
import {FormControl} from "@angular/forms";
import {debounceTime, distinctUntilChanged, map, switchMap, takeUntil} from "rxjs/operators";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {Index} from "algoliasearch";
import {AngularFirestore} from "@angular/fire/firestore";
import {EndpointService} from "../endpoint.service";
import {MapBrowseComponent} from "../map-browse/map-browse.component";

@Component({
	selector: 'app-browse',
	templateUrl: './browse.component.html',
	styleUrls: ['./browse.component.less']
})
export class BrowseComponent implements OnInit, OnDestroy {
	private ngUnsubscribe = new Subject();
	private entriesIndex: Index;
	private filters = {
		refresh$: new Subject<void>(),
		searchText$: new BehaviorSubject<string>(''),
		mapSelectedEntryId$: new BehaviorSubject<string|null>(null)
	};
	private recentlyDeletedEntryIds = [];
	private resultEntries$ = new BehaviorSubject<Entry[]>([]);
	displayEntries$: Observable<Entry[]>;
	searchTextCtrl = new FormControl();

	@ViewChild(MapBrowseComponent) private mapComp: MapBrowseComponent;

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
			this.filters.refresh$.next();
		});
	}

	ngOnInit() {
		//feed displayEntries$ from mapSelectedEntryId$, resultEntries$
		this.displayEntries$ = this.filters.mapSelectedEntryId$.pipe(
			switchMap(mapSelectedEntryId => {
				return this.resultEntries$.pipe(
					map(entries => [...entries].sort((a, b) => {
						if (a.id === mapSelectedEntryId) return -1; //a before b
						else if (b.id === mapSelectedEntryId) return 1; //b before a
						else return 0;
					}))
				);
			})
		);

		//feed resultEntries$ from searchText$, refresh$
		combineLatest(
			this.filters.searchText$,
			this.filters.refresh$
		).subscribe(([searchText]) => {
			this.runSearch(searchText)
				.then(resultEntries =>
					this.resultEntries$.next(resultEntries)
				);
		});

		//feed searchText$
		this.searchTextCtrl.valueChanges.pipe(
			debounceTime(500)
		).subscribe(() =>
			this.filters.searchText$.next(this.searchTextCtrl.value || '')
		);

		//show displayEntries$ on map
		this.displayEntries$.pipe(
			distinctUntilChanged((a, b) => {
				const aIds = a.map(it => it.id).sort().join(',');
				const bIds = b.map(it => it.id).sort().join(',');
				return aIds === bIds;
			})
		).subscribe(entries => {
			this.mapComp.set(entries);
		});
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	runSearch(searchText): Promise<Entry[]> {
		const searchFilter = this.recentlyDeletedEntryIds.map(id => {
			return `NOT objectID:${id}`;
		}).join(' AND ');

		return this.entriesIndex.search({
			query: searchText,
			filters: searchFilter
		}).then(results => {
			return results.hits as Entry[];
		}, err => {
			console.error(err);
			throw err;
		}).finally(() => console.log('searched'));
	}

	onDelete(entry) {
		this.recentlyDeletedEntryIds.push(entry.id);
		this.filters.refresh$.next();
	}

	onMapSelect(entryId) {
		this.filters.mapSelectedEntryId$.next(entryId);
	}
}

