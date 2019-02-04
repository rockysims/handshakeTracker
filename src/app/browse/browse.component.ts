import {Component, OnInit} from '@angular/core';
import {EntryService} from "../entry.service";
import {Observable} from "rxjs";

@Component({
	selector: 'app-browse',
	templateUrl: './browse.component.html',
	styleUrls: ['./browse.component.less']
})
export class BrowseComponent implements OnInit {
	public entriesOb: Observable<Entry[]>;

	constructor(private entryService: EntryService) {}

	ngOnInit() {
		this.entriesOb = this.entryService.entriesOb;
	}

	delete(entry: Entry) {
		this.entryService.delete(entry);
	}
}
