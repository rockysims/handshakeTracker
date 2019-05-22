import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {EntryService} from "../entry.service";
import {EntryEditorComponent} from "../entry-editor/entry-editor.component";
import {entryIdParam} from "../routing-params";

@Component({
	selector: 'app-entry',
	templateUrl: './entry.component.html',
	styleUrls: ['./entry.component.less']
})
export class EntryComponent implements OnInit {
	entryDataPromise: Promise<EntryData>;
	entryId: string;
	saveInProgress = false;

	@ViewChild(EntryEditorComponent) entryEditor: EntryEditorComponent;

	constructor(private route: ActivatedRoute,
				private router: Router,
				private entryService: EntryService) {}

	ngOnInit() {
		this.entryId = this.route.snapshot.paramMap.get(entryIdParam);
		this.entryDataPromise = this.entryService.get(this.entryId)
			.then(entry => entry.data);
	}

	cancel() {
		this.router.navigateByUrl('/browse');
	}

	save() {
		const entry: Entry = {
			id: this.entryId,
			data: this.entryEditor.entryData
		};
		this.saveInProgress = true;
		this.entryService.update(entry).then(() => {
			this.saveInProgress = false;
			this.router.navigateByUrl('/browse');
		});
	}
}
