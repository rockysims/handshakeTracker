import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {TagsComponent} from "../tags/tags.component";
import {debounceTime, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

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
	@Input() entryData: EntryData;
	@ViewChild(TagsComponent) tagsComp: TagsComponent;
	@Output() change = new EventEmitter();

	constructor() {}

	ngOnInit() {
		this.nameCtrl.valueChanges
			.pipe(
				takeUntil(this.ngUnsubscribe),
				debounceTime(500)
			)
			.subscribe(name => {
				this.entryData.name = this.nameCtrl.value;
				this.change.emit(this.entryData);
			});

		//TODO: load guess.names dynamically
		this.guess.names = ['Yona', 'Rocky', 'Yoda', 'Ronny'];
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public onTagsChanged() {
		this.entryData.tags = this.tagsComp.tags;
		this.change.emit(this.entryData);
	}
}