import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.less']
})
export class AddComponent {
	public myControl = new FormControl();
	public names = ['abc', 'abd', 'aec'];
}