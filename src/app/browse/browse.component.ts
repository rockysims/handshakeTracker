import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as algoliasearch from 'algoliasearch/dist/algoliasearchLite.min.js';
import {environment} from "../../environments/environment";
import {FormControl} from "@angular/forms";
import {
	debounceTime,
	distinctUntilChanged,
	filter,
	map,
	switchMap,
	takeUntil,
	tap
} from "rxjs/operators";
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
		searchText$: new BehaviorSubject<string>(''),
		mapBounds$: new BehaviorSubject<Bounds|null>(null),
		refresh$: new Subject<void>()
	};
	private mapSelectedEntryId$ = new BehaviorSubject<string|null>(null);
	private recentlyDeletedEntryIds = [];
	private resultEntries$ = new BehaviorSubject<Entry[]>([]);
	displayEntries$: Observable<Entry[]>;
	searchTextCtrl = new FormControl();
	mapModeOptions = [{
		key: 'fit',
		name: 'Fit map bounds to results.'
	}, {
		key: 'filter',
		name: 'Filter results by map bounds.'
	}, {
		key: 'manual',
		name: 'Manual.'
	}];
	mapMode = 'fit';

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
		this.displayEntries$ = this.mapSelectedEntryId$.pipe(
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
		let justChangedMapBounds = false;
		combineLatest(
			this.filters.searchText$,
			this.filters.mapBounds$.pipe(
				tap(() => justChangedMapBounds = true)
			),
			this.filters.refresh$
		).pipe(
			filter(() => {
				const ignore = justChangedMapBounds && this.mapMode !== 'filter';
				justChangedMapBounds = false;
				return !ignore;
			})
		).subscribe(([searchText, mapBounds]) => {
			const bounds = (this.mapMode === 'filter') ? mapBounds : null;
			this.runSearch(searchText, bounds)
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
			this.mapComp.set(entries, this.mapMode === 'fit');
		});

		this.filters.refresh$.next();
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	runSearch(searchText: string, bounds: Bounds|null): Promise<Entry[]> {
		const searchFilters = [];
		searchFilters.push(...this.recentlyDeletedEntryIds.map(id =>
			`NOT objectID:${id}`
		));
		if (bounds) {
			searchFilters.push(...[
				'data.location.latitude >= ' + bounds.min.latitude,
				'data.location.latitude <= ' + bounds.max.latitude,
				'data.location.longitude >= ' + bounds.min.longitude,
				'data.location.longitude <= ' + bounds.max.longitude
			]);
		}

		return this.entriesIndex.search({
			query: searchText,
			filters: searchFilters.join(' AND ')
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
		this.mapSelectedEntryId$.next(entryId);
	}

	onMapBoundsChange(bounds: Bounds) {
		this.filters.mapBounds$.next(bounds);
	}

	onMapModeChange() {
		this.filters.refresh$.next(); //in case switching to/from 'filter' mapMode
		if (this.mapMode === 'fit') this.mapComp.fit();
	}
}

