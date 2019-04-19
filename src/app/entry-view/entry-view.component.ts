import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as moment from "moment";
import {EntryService} from "../entry.service";

@Component({
	selector: 'app-entry-view',
	templateUrl: './entry-view.component.html',
	styleUrls: ['./entry-view.component.less']
})
export class EntryViewComponent implements OnInit {
	moment = moment;

	@Input() private entry: Entry;
	@Output() private delete = new EventEmitter<Entry>();

	constructor(private entryService: EntryService) {}

	ngOnInit() {}

	deleteClicked(entry: Entry) {
		this.entryService.delete(entry);
		this.delete.emit(entry);
	}
}
