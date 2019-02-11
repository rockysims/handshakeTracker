import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument, DocumentSnapshot} from "@angular/fire/firestore";
import {EntryService} from "../entry.service";
import {BehaviorSubject, Subject} from "rxjs";
import {MatAutocomplete} from "@angular/material";
import {EntryEditorComponent} from "../entry-editor/entry-editor.component";
import {debounceTime, takeUntil, takeWhile} from "rxjs/operators";

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.less']
})
export class AddComponent implements OnInit, OnDestroy {
	private readonly ngUnsubscribe = new Subject();
	public readonly entryDraftSavePath: string = 'persist/entryDraft';
	private entryDraftDoc: AngularFirestoreDocument<EntryData>;
	public entryData$: BehaviorSubject<EntryData>;

	constructor(private afs: AngularFirestore,
				private entryService: EntryService) {}

	ngOnInit() {
		this.entryDraftDoc = this.afs.doc(this.entryDraftSavePath);
		this.entryData$ = new BehaviorSubject<EntryData>(AddComponent.buildBlankEntryData());

		//load entryData$ and setup saving
		this.entryDraftDoc.get().toPromise()
			.then(doc => {
				if (doc.exists) {
					this.entryData$.next(doc.data() as EntryData);
				} else {
					return this.entryDraftDoc.set(this.entryData$.value);
				}
			}).then(() => {
				//setup saving
				this.entryData$.pipe(
					takeUntil(this.ngUnsubscribe),
					debounceTime(500)
				).subscribe(entryData => {
					this.entryDraftDoc.update(entryData);
				});
			});
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	static buildBlankEntryData(): EntryData {
		return {
			name: '',
			tags: []
		};
	}

	clear() {
		this.entryData$.next(AddComponent.buildBlankEntryData());
	}

	submit() {
		this.entryService.create(this.entryData$.value)
			.then(() => {
				//TODO: show a success indicator (with link to new entry?)
				this.clear();
			});
	}
}

//TODO: on new entry submitted, clear fields ready for another new entry
//TODO: save new entry not yet submitted and load it again when 'add' page is shown later