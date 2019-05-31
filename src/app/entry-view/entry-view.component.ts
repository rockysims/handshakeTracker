import {Component, Input, OnInit} from '@angular/core';
import * as moment from "moment";
import {Router} from "@angular/router";

@Component({
	selector: 'app-entry-view',
	templateUrl: './entry-view.component.html',
	styleUrls: ['./entry-view.component.less']
})
export class EntryViewComponent implements OnInit {
	moment = moment;

	@Input() entry: Entry;

	constructor(private router: Router) {}

	ngOnInit() {}

	editClicked(entry: Entry) {
		this.router.navigateByUrl(`/entry/${entry.id}`);
	}
}
