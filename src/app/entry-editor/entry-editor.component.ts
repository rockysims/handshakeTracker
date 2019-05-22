import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TagsComponent} from "../tags/tags.component";
import {debounceTime} from "rxjs/operators";
import {Subject} from "rxjs";
import {AutocompleteComponent} from "../autocomplete/autocomplete.component";
import {FormControl} from "@angular/forms";
import {Moment} from "moment";
import * as moment from "moment";
import {GeoService} from "../geo.service";
import {MapLocationComponent} from "../map-location/map-location.component";

@Component({
	selector: 'app-entry-editor',
	templateUrl: './entry-editor.component.html',
	styleUrls: ['./entry-editor.component.less']
})
export class EntryEditorComponent implements OnInit {
	private _entryData: EntryData = EntryEditorComponent.buildFreshEntryData(this.geoService.getDefaultLocation());
	private locationOrDefaultPromise: Promise<LatLong> = this.geoService.getLocationOrDefault();
	noteCtrl = new FormControl();
	dateMoment: Moment;
	guess = {
		names: [],
		tags: []
	};
	loadedPromise: Promise<{}>;
	isLoading = true;

	@ViewChild(AutocompleteComponent) private nameComp: AutocompleteComponent;
	@ViewChild(TagsComponent) private tagsComp: TagsComponent;
	@ViewChild(MapLocationComponent) private mapComp: MapLocationComponent;
	@Input() private entryDataOrPromise: EntryData|Promise<EntryData>;
	private changeEvent = new Subject();
	@Output() private change = new EventEmitter<EntryData>();

	constructor(private geoService: GeoService) {}

	ngOnInit() {
		const loadPromises = [];

		//TODO: load guesses dynamically
		this.guess.names = ['Yona', 'Rocky', 'Yoda', 'Ronny'];
		this.guess.tags = ['Apple', 'Lemon', 'Lime', 'Mango', 'Strawberry'];

		loadPromises.push(Promise.resolve(this.entryDataOrPromise).then(entryData => {
			if (entryData) this.update(entryData);
			else {
				this.locationOrDefaultPromise.then(loc => {
					this.update(EntryEditorComponent.buildFreshEntryData(loc));
				});
			}

			const nameExactMatch = this.guess.names.includes(this._entryData.name);
			if (!nameExactMatch) {
				this.loadedPromise.then(() => {
					this.nameComp.focus().then(() => {
						if (this._entryData.name.length === 0) {
							this.nameComp.close();
						}
					});
				});
			}

			//emit change events (with debounce)
			this.changeEvent.pipe(
				debounceTime(500)
			).subscribe(() => this.change.emit(this._entryData));
		}));

		this.loadedPromise = Promise.all(loadPromises)
			.finally(() => this.isLoading = false)
			.then(() => {
				return new Promise(resolve => {
					setTimeout(resolve, 0); //delay to give template time to respond to this.isLoading = false
				});
			});
	}

	onNameChange(name) {
		this.update({name});
	}

	onTagsChange(tags) {
		this.update({tags});
	}

	onNoteChange(note) {
		this.update({note});
	}

	onDateChange(dateMoment: Moment) {
		this.update({
			unixTimestamp: dateMoment.startOf('day').unix()
		});
	}

	onLocationChange(location: LatLong) {
		console.log('onLocationChange: ', location); //TODO: delete this line
		this.update({location}, true);
	}

	async clear() {
		this.update(EntryEditorComponent.buildFreshEntryData(await this.locationOrDefaultPromise));
		this.mapComp.centerAndZoom();
	}

	get entryData(): EntryData {
		return this._entryData;
	}

	private ignoreUpdates = false;
	private update(data: Partial<EntryData>, suppressDisplayUpdates = false) {
		if (this.ignoreUpdates) return;
		this.ignoreUpdates = true;

		Object.assign(this._entryData, data);
		if (!suppressDisplayUpdates) {
			this.loadedPromise.then(() => {
				this.nameComp.set(this._entryData.name);
				this.tagsComp.set(this._entryData.tags);
				this.noteCtrl.setValue(this._entryData.note);
				this.dateMoment = moment.unix(this._entryData.unixTimestamp);
				this.mapComp.set(this._entryData.location);
			});
		}
		this.changeEvent.next();

		this.ignoreUpdates = false;
	}

	static buildFreshEntryData(loc: LatLong): EntryData {
		return {
			name: '',
			tags: [],
			note: '',
			unixTimestamp: moment().startOf('day').unix(),
			location: loc
		};
	}
}