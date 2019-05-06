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
import * as moment from "moment";
import {DateRangeSliderComponent} from "../date-range-slider/date-range-slider.component";

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
		mapBounds$: new BehaviorSubject<MapBounds|null>(null),
		dateBounds$: new BehaviorSubject<DateBounds|null>(null),
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
	dateBounds: DateBounds;

	@ViewChild(MapBrowseComponent) private mapComp: MapBrowseComponent;
	@ViewChild(DateRangeSliderComponent) private dateRangeSliderComp: DateRangeSliderComponent;

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

		db.collection(endpointService.entries()).ref
			.orderBy('unixTimestamp', 'asc')
			.limit(1)
			.get()
			.then(snap => {
				const min = (snap.docs.length > 0)
					? moment.unix(snap.docs[0].data().unixTimestamp).toDate()
					: moment().toDate();
				const max = moment().toDate();
				this.dateBounds = {min, max};
				this.filters.dateBounds$.next(this.dateBounds);
			});



		//TODO: use this version so it'll update immediately when entries are deleted
		// db.doc(endpointService.allEntryUnixTimestamps()).valueChanges().pipe(
		// 	takeUntil(this.ngUnsubscribe)
		// ).subscribe(allEntryUnixTimestamps => {
		// 	const unixTimestamps = Object.keys(allEntryUnixTimestamps).map(k => +k) as number[];
		// 	this.dateRangeSliderComp.setEntryMarks(unixTimestamps);
		// });

		db.doc(endpointService.allEntryUnixTimestamps()).ref
			.get()
			.then(snap => {
				if (snap.exists) {
					const unixTimestamps = Object.keys(snap.data()).map(k => +k) as number[];
					this.dateRangeSliderComp.setEntryMarks(unixTimestamps);
				}
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
			this.filters.dateBounds$,
			this.filters.refresh$
		).pipe(
			filter(() => {
				const ignore = justChangedMapBounds && this.mapMode !== 'filter';
				justChangedMapBounds = false;
				return !ignore;
			})
		).subscribe(([latestSearchText, latestMapBounds, latestDateBounds]) => {
			const mapBounds = (this.mapMode === 'filter') ? latestMapBounds : null;
			this.runSearch(latestSearchText, mapBounds, latestDateBounds)
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

	runSearch(searchText: string, mapBoundsOrNull: MapBounds|null, dateBoundsOrNull: DateBounds|null): Promise<Entry[]> {
		const searchFilters = [];
		searchFilters.push(...this.recentlyDeletedEntryIds.map(id =>
			`NOT objectID:${id}`
		));
		if (mapBoundsOrNull) {
			searchFilters.push(...[
				'data.location.latitude >= ' + mapBoundsOrNull.min.latitude,
				'data.location.latitude <= ' + mapBoundsOrNull.max.latitude,
				'data.location.longitude >= ' + mapBoundsOrNull.min.longitude,
				'data.location.longitude <= ' + mapBoundsOrNull.max.longitude
			]);
		}
		if (dateBoundsOrNull) {
			searchFilters.push(...[
				'data.unixTimestamp >= ' + moment(dateBoundsOrNull.min).unix(),
				'data.unixTimestamp <= ' + moment(dateBoundsOrNull.max).unix()
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

	onMapBoundsChange(mapBounds: MapBounds) {
		this.filters.mapBounds$.next(mapBounds);
	}

	onMapModeChange() {
		this.filters.refresh$.next(); //in case switching to/from 'filter' mapMode
		if (this.mapMode === 'fit') this.mapComp.fit();
	}

	onDateBoundsChange(dateBounds: DateBounds) {
		this.filters.dateBounds$.next(dateBounds);
	}
}

