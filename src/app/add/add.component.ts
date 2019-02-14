import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {EntryService} from "../entry.service";
import {Observable, Subject} from "rxjs";
import {debounceTime, publishReplay, take, takeUntil} from "rxjs/operators";
import {EntryDraftService} from "../entry-draft.service";
import {EntryEditorComponent} from "../entry-editor/entry-editor.component";

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.less']
})
export class AddComponent implements OnInit, OnDestroy {
	private readonly ngUnsubscribe = new Subject();
	public entryData$: Observable<EntryData>;

	@ViewChild(EntryEditorComponent) entryEditor: EntryEditorComponent;

	constructor(private afs: AngularFirestore,
				private entryService: EntryService,
				private entryDraftService: EntryDraftService) {}

	ngOnInit() {
		this.entryData$ = this.entryDraftService.entryDraft$;

		//setup saving
		this.entryEditor.change.pipe(
			takeUntil(this.ngUnsubscribe),
			debounceTime(500)
		).subscribe(this.entryDraftService.save);
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	clear() {
		this.entryDraftService.clear();
	}

	submit() {
		this.entryData$.pipe(
			publishReplay(1),
			take(1)
		).subscribe(entryData => {
			this.entryService.create(entryData)
				.then(() => {
					//TODO: show a success indicator (with link to new entry?)
					this.clear();
				});
		});
	}
}