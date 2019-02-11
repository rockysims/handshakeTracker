import {Component, Input, OnInit} from '@angular/core';

@Component({
	selector: 'app-entry-view',
	templateUrl: './entry-view.component.html',
	styleUrls: ['./entry-view.component.less']
})
export class EntryViewComponent implements OnInit {
	@Input() entry: Entry;

	constructor() {}

	ngOnInit() {

	}
}
