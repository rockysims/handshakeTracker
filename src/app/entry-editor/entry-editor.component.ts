import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {TagsComponent} from "../tags/tags.component";
import {distinctUntilChanged, publishReplay, takeUntil} from "rxjs/operators";
import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {MatAutocompleteTrigger} from "@angular/material";

@Component({
	selector: 'app-entry-editor',
	templateUrl: './entry-editor.component.html',
	styleUrls: ['./entry-editor.component.less']
})
export class EntryEditorComponent implements OnInit, OnDestroy {
	private ngUnsubscribe = new Subject();
	public nameCtrl = new FormControl();
	public guess = {
		names: []
	};
	private entryDataReal$ = new BehaviorSubject<EntryData>();

	@Input() entryData$: Observable<EntryData>;
	@ViewChild(TagsComponent) tagsComp: TagsComponent;
	@ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
	@Output() change = new EventEmitter<EntryData>();

	constructor() {}

	ngOnInit() {


		console.log('EntryEditorComponent typeof this.entryData$: ', typeof(this.entryData$));


		this.entryData$.subscribe(this.entryDataReal$);

		this.entryData$.pipe(
			takeUntil(this.ngUnsubscribe)
		).subscribe(entryData => {
			this.nameCtrl.setValue(entryData.name);
			this.tagsComp.tags = entryData.tags;
		});

		this.entryDataReal$.pipe(
			takeUntil(this.ngUnsubscribe),
			distinctUntilChanged((a, b) => {
				return a.name === b.name
					&& a.tags.length === b.tags.length
					&& JSON.stringify(a.tags) === JSON.stringify(b.tags);
			})
		).subscribe(this.change.emit);





		// this.entryDataReal$.pipe(
		// 	takeUntil(this.ngUnsubscribe),
		// 	distinctUntilChanged((a, b) => {
		// 		return a.name === b.name
		// 			&& a.tags.length === b.tags.length
		// 			&& JSON.stringify(a.tags) === JSON.stringify(b.tags);
		// 	})
		// ).subscribe(entryData => {
		// 	this.nameCtrl.setValue(entryData.name);
		// 	this.tagsComp.tags = entryData.tags;
		// });

		this.nameCtrl.valueChanges.pipe(
				takeUntil(this.ngUnsubscribe)
			).subscribe(name => {
				//open/close name auto complete
				if (name === '') this.autocomplete.openPanel();
				else this.autocomplete.closePanel();

				//update name
				const entryData = {...this.entryDataReal$.value};
				entryData.name = name;
				this.entryDataReal$.next(entryData);
			});

		this.tagsComp.change.pipe(
			takeUntil(this.ngUnsubscribe)
		).subscribe(tags => {
			const entryData = {...this.entryDataReal$.value};
			entryData.tags = tags;
			this.entryDataReal$.next(entryData);
		});

		//TODO: load guess.names dynamically
		this.guess.names = ['Yona', 'Rocky', 'Yoda', 'Ronny'];
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}