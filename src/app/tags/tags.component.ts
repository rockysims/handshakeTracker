import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete} from '@angular/material';
import {Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, startWith, tap} from 'rxjs/operators';

@Component({
	selector: 'app-tags',
	templateUrl: './tags.component.html',
	styleUrls: ['./tags.component.less']
})
export class TagsComponent {
	selectable = true;
	removable = true;
	addOnBlur = true;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	tagCtrl = new FormControl();
	filteredTags: Observable<string[]>;
	chosenTags: string[] = [];
	knownTags: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

	@ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;
	private changeEvent = new Subject<string[]>();
	@Output() change = new EventEmitter<string[]>();

	constructor() {
		this.filteredTags = this.tagCtrl.valueChanges.pipe(
			startWith(null),
			map((tag: string | null) => tag ? this._filter(tag) : this.knownTags.slice()));

		//emit change events
		this.changeEvent.pipe(
			startWith([]),
			distinctUntilChanged((a, b) => {
				return a.length === b.length
					&& JSON.stringify(a) === JSON.stringify(b);
			})
		).subscribe(tags => this.change.emit(tags));
	}

	add(event: MatChipInputEvent): void {
		// Add tag only when MatAutocomplete is not open
		// To make sure this does not conflict with OptionSelected Event
		if (!this.matAutocomplete.isOpen) {
			const input = event.input;
			const value = event.value;

			// Add our tag
			if ((value || '').trim()) {
				this.chosenTags.push(value.trim());

				this.changeEvent.next(this.chosenTags)
			}

			// Reset the input value
			if (input) {
				input.value = '';
			}

			this.tagCtrl.setValue(null);
		}
	}

	remove(tag: string): void {
		const index = this.chosenTags.indexOf(tag);

		if (index >= 0) {
			this.chosenTags.splice(index, 1);

			this.changeEvent.next(this.chosenTags);
		}
	}

	set(tags: string[]): void {
		this.chosenTags = tags;
		this.changeEvent.next(this.chosenTags);
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		this.chosenTags.push(event.option.viewValue);
		this.changeEvent.next(this.chosenTags);

		this.tagInput.nativeElement.value = '';
		this.tagCtrl.setValue(null);
	}

	private _filter(value: string): string[] {
		const filterValue = value.toLowerCase();

		return this.knownTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
	}
}