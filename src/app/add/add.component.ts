import {Component, OnInit, ViewChild} from '@angular/core';
import {EntryEditorComponent} from "../entry-editor/entry-editor.component";
import {EntryService} from "../entry.service";

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
		return this.entryEditor.clear();
	}

	submit() {
		//TODO: show a progress indicator
		this.entryService.create(this.entryEditor.entryData)
			.then(() => {
				//TODO: show a success indicator (with link to new entry? or show new entry under add form?)
				this.clear();
			}, () => {
				//TODO: show a failure indicator?
			});
	}
}