import {Component, Input} from '@angular/core';

@Component({
	selector: 'app-button-icon',
	templateUrl: './button-icon.component.html',
	styleUrls: ['./button-icon.component.less']
})
export class ButtonIconComponent {
	@Input() private icon: string;
	@Input() private inProgress: boolean;

	constructor() {}
}
