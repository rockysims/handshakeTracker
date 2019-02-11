import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {TagsComponent} from "../tags/tags.component";
import {distinctUntilChanged, takeUntil} from "rxjs/operators";
import {BehaviorSubject, Subject} from "rxjs";
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
	@Input() entryData$: BehaviorSubject<EntryData>;
	@ViewChild(TagsComponent) tagsComp: TagsComponent;
	@ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

	constructor() {}

	ngOnInit() {
		this.entryData$.pipe(
			takeUntil(this.ngUnsubscribe),
			distinctUntilChanged((a, b) => {
				return a.name === b.name
					&& a.tags.length == b.tags.length
					&& JSON.stringify(a.tags) === JSON.stringify(b.tags);
			})
		).subscribe(entryData => {
			this.nameCtrl.setValue(entryData.name);
			this.tagsComp.tags = entryData.tags;
		});

		this.nameCtrl.valueChanges.pipe(
				takeUntil(this.ngUnsubscribe)
			).subscribe(name => {
				//open/close name auto complete
				if (name === '') this.autocomplete.openPanel();
				else this.autocomplete.closePanel();

				//update name
				const entryData = {...this.entryData$.value};
				entryData.name = name;
				this.entryData$.next(entryData);
			});

		this.tagsComp.change.pipe(
			takeUntil(this.ngUnsubscribe)
		).subscribe(tags => {
			const entryData = {...this.entryData$.value};
			entryData.tags = tags;
			this.entryData$.next(entryData);
		});

		//TODO: load guess.names dynamically
		this.guess.names = ['Yona', 'Rocky', 'Yoda', 'Ronny'];
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}