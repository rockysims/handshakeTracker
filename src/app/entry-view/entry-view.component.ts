import {Component, Input, OnInit} from '@angular/core';
import {EntryService} from "../entry.service";
import {Moment} from "moment";
import * as moment from "moment";

@Component({
	selector: 'app-entry-view',
	templateUrl: './entry-view.component.html',
	styleUrls: ['./entry-view.component.less']
})
export class EntryViewComponent implements OnInit {
	moment = moment;

	@Input() entry: Entry;

	constructor(private entryService: EntryService) {}

	ngOnInit() {

	}

	delete(entry: Entry) {
		this.entryService.delete(entry);
	}
}
