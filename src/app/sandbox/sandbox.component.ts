import {Component, OnInit} from '@angular/core';

@Component({
	selector: 'app-sandbox',
	templateUrl: './sandbox.component.html',
	styleUrls: ['./sandbox.component.less']
})
export class SandboxComponent implements OnInit {
	guess = {
		names: ['Alice', 'Angela', 'Bob', 'Bill']
	};

	constructor() {}

	ngOnInit() {

	}

}
