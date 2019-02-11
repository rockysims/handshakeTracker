import {Component, Input, OnInit} from '@angular/core';

@Component({
	selector: 'app-entry',
	templateUrl: './entry.component.html',
	styleUrls: ['./entry.component.less']
})
export class EntryComponent implements OnInit {
	@Input() entry: Entry;
	editMode: boolean = false;

	constructor() {}

	ngOnInit() {

	}
}
