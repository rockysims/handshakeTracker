import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TagsComponent} from "../tags/tags.component";
import {debounceTime} from "rxjs/operators";
import {Subject} from "rxjs";
import {AutocompleteComponent} from "../autocomplete/autocomplete.component";

@Component({
	selector: 'app-entry-editor',
	templateUrl: './entry-editor.component.html',
	styleUrls: ['./entry-editor.component.less']
})
export class EntryEditorComponent implements OnInit {
	private entryData: EntryData = EntryEditorComponent.buildBlankEntryData();
	guess = {
		names: [],
		tags: []
	};

	@ViewChild(AutocompleteComponent) private nameComp: AutocompleteComponent;
	@ViewChild(TagsComponent) private tagsComp: TagsComponent;
	@Input() private entryDataOrPromise: EntryData|Promise<EntryData>;
	private changeEvent = new Subject();
	@Output() private change = new EventEmitter<EntryData>();

	constructor() {}

	ngOnInit() {
		//TODO: load guesses dynamically
		this.guess.names = ['Yona', 'Rocky', 'Yoda', 'Ronny'];
		this.guess.tags = ['Apple', 'Lemon', 'Lime', 'Mango', 'Strawberry'];

		Promise.resolve(this.entryDataOrPromise).then(entryData => {
			if (entryData) this.update(entryData);

			const nameExactMatch = this.guess.names.includes(this.entryData.name);
			if (!nameExactMatch) this.nameComp.focusAndOpen();

			//emit change events (with debounce)
			this.changeEvent.pipe(
				debounceTime(500)
			).subscribe(() => this.change.emit(this.entryData));
		});
	}

	onNameChange(name) {
		this.update({name});
	}

	onTagsChange(tags) {
		this.update({tags});
	}

	clear() {
		this.update(EntryEditorComponent.buildBlankEntryData());
	}

	get data() {
		return this.entryData;
	}

	private update(data) {
		Object.assign(this.entryData, data);
		this.nameComp.set(this.entryData.name);
		this.tagsComp.set(this.entryData.tags);
		this.changeEvent.next();
	}

	static buildBlankEntryData(): EntryData {
		return {
			name: '',
			tags: []
		};
	}
}