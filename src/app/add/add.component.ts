import {Component, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {EntryService} from "../entry.service";
import {EntryEditorComponent} from "../entry-editor/entry-editor.component";
import {EndpointService} from "../endpoint.service";

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.less']
})
export class AddComponent implements OnInit {
	private entryDraftDoc: AngularFirestoreDocument<EntryData>;
	entryDataPromise: Promise<EntryData>;
	isLoading = true; //TODO: use in view to disable fields until loaded

	@ViewChild(EntryEditorComponent) entryEditor: EntryEditorComponent;

	constructor(private afs: AngularFirestore,
				private entryService: EntryService,
				private endpointService: EndpointService) {
		this.entryDraftDoc = this.afs.doc(this.endpointService.entryDraft());
		this.entryDataPromise = this.entryDraftDoc.get().toPromise()
			.then(doc => (doc.exists)
				? doc.data() as EntryData
				: null
			);
	}

	ngOnInit() {
		this.entryDataPromise.then(() => {
			this.isLoading = false;
		});
	}

	onChange(entryData: EntryData) {
		console.log('saving draft: ', entryData);
		this.entryDraftDoc.set(entryData);
	}

	clear() {
		this.entryEditor.clear();
	}

	submit() {
		this.entryService.create(this.entryEditor.data)
			.then(() => {
				//TODO: show a success indicator (with link to new entry?)
				this.clear();
			});
	}
}