import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {MatAutocompleteTrigger} from "@angular/material";

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
	styleUrls: ['./autocomplete.component.less']
})
export class AutocompleteComponent implements OnInit {
	ctrl = new FormControl();
	options: string[] = [];
	filteredOptions: Observable<string[]>;

	@ViewChild('inputElement', { read: MatAutocompleteTrigger }) autocomplete: MatAutocompleteTrigger;
	@ViewChild('inputElement') inputElem: ElementRef;
	@Input() placeholder: string = '';
	@Input() autofocus: boolean = false;
	@Input() private optionsOrPromise: string[]|Promise<string[]>;
	@Output() private change = new EventEmitter<EntryData>();

	ngOnInit() {
		Promise.resolve(this.optionsOrPromise).then(options => {
			this.options = options || this.options;

			this.filteredOptions = this.ctrl.valueChanges.pipe(
				startWith(''),
				map( inputText => {
					const inputTextLowerCase = inputText.toLowerCase();
					return this.options.filter(option =>
						option.toLowerCase().includes(inputTextLowerCase)
					);
				})
			);
		});

		this.ctrl.valueChanges.pipe(
			distinctUntilChanged()
		).subscribe(inputText => {
			this.change.emit(inputText);
		});
	}

	set(inputText) {
		this.ctrl.setValue(inputText);
	}

	focusAndOpen() {
		window.setTimeout(() => {
			this.inputElem.nativeElement.focus();
		});
		this.autocomplete.openPanel();
	}
}