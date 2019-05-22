import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {EntryService} from "../entry.service";
import {EntryEditorComponent} from "../entry-editor/entry-editor.component";
import {entryIdParam} from "../routing-params";
import {RecentChangeService} from "../recent-change.service";

@Component({
	selector: 'app-entry',
	templateUrl: './entry.component.html',
	styleUrls: ['./entry.component.less']
})
export class EntryComponent implements OnInit {
	entryDataPromise: Promise<EntryData>;
	entryId: string;
	deleteInProgress = false;
	saveInProgress = false;

	@ViewChild(EntryEditorComponent) entryEditor: EntryEditorComponent;

	constructor(private route: ActivatedRoute,
				private router: Router,
				private recentChangeService: RecentChangeService,
				private entryService: EntryService) {}

	ngOnInit() {
		this.entryId = this.route.snapshot.paramMap.get(entryIdParam);
		this.entryDataPromise = this.entryService.get(this.entryId)
			.then(entry => entry.data);
	}

	delete() {
		const entry: Entry = {
			id: this.entryId,
			data: this.entryEditor.entryData
		};
		this.recentChangeService.deletedEntryIds.push(entry.id);

		this.deleteInProgress = true;
		this.entryService.delete(entry).then(() => {
			this.router.navigateByUrl('/browse');
		}).finally(() =>
			this.deleteInProgress = false
		);
	}

	cancel() {
		this.router.navigateByUrl('/browse');
	}

	save() {
		const entry: Entry = {
			id: this.entryId,
			data: this.entryEditor.entryData
		};
		this.recentChangeService.editedEntryById[entry.id] = entry;

		this.saveInProgress = true;
		this.entryService.update(entry).then(() => {
			this.router.navigateByUrl('/browse');
		}).finally(() =>
			this.saveInProgress = false
		);
	}
}
