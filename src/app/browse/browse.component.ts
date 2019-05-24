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
import {RecentChangeService} from "../recent-change.service";
import {UserService} from "../user.service";

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
		dateRange$: new BehaviorSubject<DateRange|null>(null),
		refresh$: new Subject<void>()
	};
	private mapSelectedEntryId$ = new BehaviorSubject<string|null>(null);
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
	@ViewChild(DateRangeSliderComponent) private dateRangeSliderComp: DateRangeSliderComponent;

	constructor(
		private db: AngularFirestore,
		private recentChangeService: RecentChangeService,
		private endpointService: EndpointService,
		private userService: UserService
	) {
		this.entriesIndex = algoliasearch(environment.algolia.appId, environment.algolia.searchKey)
			.initIndex(`users_${userService.currentUser.uid}_entries`);

		//refresh results when algolia index is updated
		db.doc(endpointService.latestIndex()).valueChanges().pipe(
			takeUntil(this.ngUnsubscribe)
		).subscribe(() => {
			//update search results (since algolia's index was updated)
			console.log('algolia index was updated');
			this.entriesIndex.clearCache();
			this.filters.refresh$.next();
		});

		//set date range slider bounds = earliestEntry to now
		//and set selected date range equal to bounds
		db.collection(endpointService.entries()).ref
			.orderBy('unixTimestamp', 'asc')
			.limit(1)
			.get()
			.then(snap => {
				const min = (snap.docs.length > 0)
					? moment.unix(snap.docs[0].data().unixTimestamp).toDate()
					: moment().toDate();
				const max = moment().toDate();
				const dateRange = {min, max};
				this.dateRangeSliderComp.setBounds(dateRange, true);
				this.filters.dateRange$.next(dateRange);
			});

		//show entry marks on date range slider (and keep marks updated)
		db.doc(endpointService.unixTimestampByEntryId()).valueChanges().pipe(
			takeUntil(this.ngUnsubscribe)
		).subscribe((unixTimestampByEntryId = {}) => {
			const entryExistsByUnixTimestamp = {};
			Object.keys(unixTimestampByEntryId).forEach(entryId => {
				const unixTs = (this.recentChangeService.editedEntryById[entryId] || {})['unixTimestamp']
					|| unixTimestampByEntryId[entryId];
				entryExistsByUnixTimestamp[unixTs] = true;
			});
			const unixTimestamps = Object.keys(entryExistsByUnixTimestamp).map(k => +k) as number[];
			this.dateRangeSliderComp.setEntryMarks(unixTimestamps);
		});
	}

	ngOnInit() {
		//feed displayEntries$ from mapSelectedEntryId$, resultEntries$
		this.displayEntries$ = this.mapSelectedEntryId$.pipe(
			switchMap(mapSelectedEntryId => {
				return this.resultEntries$.pipe(
					//if entry select on map, move to top of list
					map(entries => [...entries].sort((a, b) => {
						if (a.id === mapSelectedEntryId) return -1; //a before b
						else if (b.id === mapSelectedEntryId) return 1; //b before a
						else return 0;
					}))
				);
			})
		);

		//feed resultEntries$ from searchText$, mapBounds$, dateRange$, refresh$
		let justChangedMapBounds = false;
		combineLatest(
			this.filters.searchText$,
			this.filters.mapBounds$.pipe(
				tap(() => justChangedMapBounds = true)
			),
			this.filters.dateRange$,
			this.filters.refresh$
		).pipe(
			//ignore mapBounds$ changes unless mapMode is 'filter'
			filter(() => {
				const ignore = justChangedMapBounds && this.mapMode !== 'filter';
				justChangedMapBounds = false;
				return !ignore;
			}),
			debounceTime(100) //prevent multiple searches during init
		).subscribe(([searchText, mapBounds, dateRange]) => {
			this.runSearch(
				searchText,
				(this.mapMode === 'filter') ? mapBounds : null,
				dateRange
			).then(resultEntries =>
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
			const fitToEntries = this.mapMode === 'fit';
			this.mapComp.setEntries(entries, fitToEntries);
		});

		this.filters.refresh$.next();
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	runSearch(searchText: string, mapBoundsOrNull: MapBounds|null, dateRangeOrNull: DateRange|null): Promise<Entry[]> {
		const searchFilters = [];
		searchFilters.push(...this.recentChangeService.deletedEntryIds.map(id =>
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
		if (dateRangeOrNull) {
			searchFilters.push(...[
				'data.unixTimestamp >= ' + moment(dateRangeOrNull.min).unix(),
				'data.unixTimestamp <= ' + moment(dateRangeOrNull.max).unix()
			]);
		}

		return this.entriesIndex.search({
			query: searchText,
			filters: searchFilters.join(' AND ')
		}).then(results => {
			return (results.hits as Entry[]).map(entry => {
				return this.recentChangeService.editedEntryById[entry.id] || entry;
			});
		}, err => {
			console.error(err);
			throw err;
		}).finally(() => console.log('searched'));
	}

	onMapSelect(entryId) {
		this.mapSelectedEntryId$.next(entryId);
	}

	onMapBoundsChange(mapBounds: MapBounds) {
		this.filters.mapBounds$.next(mapBounds);
	}

	onMapModeChange() {
		this.filters.refresh$.next(); //in case switching to/from 'filter' mapMode
		if (this.mapMode === 'fit') this.mapComp.fitMapToEntries();
	}

	onDateRangeChange(dateRange: DateRange) {
		this.filters.dateRange$.next(dateRange);
	}
}

