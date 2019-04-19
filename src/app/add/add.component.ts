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
	@ViewChild(EntryEditorComponent) entryEditor: EntryEditorComponent;

	constructor(private entryService: EntryService) {}

	ngOnInit() {}

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