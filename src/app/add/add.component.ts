import {Component, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument, DocumentSnapshot} from "@angular/fire/firestore";
import {EntryService} from "../entry.service";
import {BehaviorSubject} from "rxjs";
import {MatAutocomplete} from "@angular/material";
import {EntryEditorComponent} from "../entry-editor/entry-editor.component";

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.less']
})
export class AddComponent implements OnInit {
	public readonly newEntrySavePath: string = 'persist/newEntry';
	private newEntryDoc: AngularFirestoreDocument<EntryData>;
	public entryData: EntryData|null = null;
	public loading: boolean = true;
	public loadError: string = '';
	@ViewChild(EntryEditorComponent) entryEditor;

	constructor(private afs: AngularFirestore,
				private entryService: EntryService) {}

	ngOnInit() {
		this.newEntryDoc = this.afs.doc(this.newEntrySavePath);

		//load (or create) new entry
		const self = this;
		this.newEntryDoc.get()
			.toPromise()
			.then((doc) => {
				if (doc.exists) {
					return doc.data() as EntryData;
				} else {
					const newEntryData = AddComponent.buildBlankEntryData();
					return self.newEntryDoc.set(newEntryData)
						.then(() => newEntryData);
				}
			})
			.then(entryData => this.entryData = entryData)
			.catch(reason => {
				this.loadError = 'AddComponent failed to get/create newEntry because: ' + reason;
			})
			.finally(() => this.loading = false);
	}

	static buildBlankEntryData(): EntryData {
		return {
			name: '',
			tags: []
		};
	}

	clear() {
		this.entryData = AddComponent.buildBlankEntryData();
		this.saveDraft(this.entryData);
	}

	saveDraft(entryData) {
		this.afs.doc(this.newEntrySavePath)
			.update(entryData)
			.catch(reason => {
				console.error('AddComponent failed to save newEntry because: ', reason);
			});
	}

	submit() {
		this.entryService.create(this.entryEditor.entryData)
			.then(() => {
				//TODO: show a success indicator (with link to new entry?)
				this.clear();
			})
			.catch(reason => {
				console.error('AddComponent failed to save entry because: ', reason);
			});
	}
}

//TODO: on new entry submitted, clear fields ready for another new entry
//TODO: save new entry not yet submitted and load it again when 'add' page is shown later