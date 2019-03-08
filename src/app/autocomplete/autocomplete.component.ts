import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {combineLatest, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {MatAutocompleteTrigger} from "@angular/material";

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
	styleUrls: ['./autocomplete.component.less']
})
export class AutocompleteComponent implements OnInit {
	private options$ = new Subject<string[]>();
	ctrl = new FormControl();
	filteredOptions: Observable<string[]>;

	@ViewChild('inputElement', { read: MatAutocompleteTrigger }) autocomplete: MatAutocompleteTrigger;
	@ViewChild('inputElement') inputElem: ElementRef;
	@Input() placeholder: string = '';
	@Input() autofocus: boolean = false;
	@Input() private optionsOrPromise: string[]|Promise<string[]>;
	@Output() private change = new EventEmitter<EntryData>();

	ngOnInit() {
		Promise.resolve(this.optionsOrPromise).then(options => {
			if (options) this.options$.next(options);
		});

		this.filteredOptions = combineLatest(
			this.options$,
			this.ctrl.valueChanges.pipe(
				startWith(''),
				distinctUntilChanged()
			)
		).pipe(
			map(([options, inputText]) => {
				const inputTextLowerCase = (inputText as string).toLowerCase();
				// const searchRegex = new RegExp(`(${inputText})`, 'ig');
				// const replaceRegex = `<b>\$1</b>`;
				return options
					.filter(option => option.toLowerCase().includes(inputTextLowerCase));
					// .map(option => option.replace(searchRegex, replaceRegex));
			})
		);

		this.ctrl.valueChanges.pipe(
			distinctUntilChanged()
		).subscribe(inputText => {
			this.change.emit(inputText);
		});
	}

	set(inputText) {
		this.ctrl.setValue(inputText);
	}

	focus(): Promise<void> {
		return new Promise(resolve => {
			window.setTimeout(() => {
				this.inputElem.nativeElement.focus();
				resolve();
			});
		});
	}

	close() {
		this.autocomplete.closePanel();
	}
}