import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete} from '@angular/material';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
	selector: 'app-tags',
	templateUrl: './tags.component.html',
	styleUrls: ['./tags.component.less']
})
export class TagsComponent {
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	tagCtrl = new FormControl();
	filteredTags: Observable<string[]>;
	tags: string[] = ['Lemon'];
	allTags: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

	@ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	@Output() change = new EventEmitter();

	constructor() {
		this.filteredTags = this.tagCtrl.valueChanges.pipe(
			startWith(null),
			map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice()));
	}

	add(event: MatChipInputEvent): void {
		// Add tag only when MatAutocomplete is not open
		// To make sure this does not conflict with OptionSelected Event
		if (!this.matAutocomplete.isOpen) {
			const input = event.input;
			const value = event.value;

			// Add our tag
			if ((value || '').trim()) {
				this.tags.push(value.trim());

				this.change.emit()
			}

			// Reset the input value
			if (input) {
				input.value = '';
			}

			this.tagCtrl.setValue(null);
		}
	}

	remove(tag: string): void {
		const index = this.tags.indexOf(tag);

		if (index >= 0) {
			this.tags.splice(index, 1);

			this.change.emit()
		}
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		this.tags.push(event.option.viewValue);
		this.change.emit();

		this.tagInput.nativeElement.value = '';
		this.tagCtrl.setValue(null);
	}

	private _filter(value: string): string[] {
		const filterValue = value.toLowerCase();

		return this.allTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
	}
}