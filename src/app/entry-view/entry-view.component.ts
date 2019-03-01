import {Component, Input, OnInit} from '@angular/core';
import {EntryService} from "../entry.service";

@Component({
	selector: 'app-entry-view',
	templateUrl: './entry-view.component.html',
	styleUrls: ['./entry-view.component.less']
})
export class EntryViewComponent implements OnInit {
	@Input() entry: Entry;

	constructor(private entryService: EntryService) {}

	ngOnInit() {

	}

	delete(entry: Entry) {
		this.entryService.delete(entry);
	}
}
