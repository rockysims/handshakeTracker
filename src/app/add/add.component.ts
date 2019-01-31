import {Component, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TagsComponent} from "../tags/tags.component";
import {debounceTime} from "rxjs/operators";

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.less']
})
export class AddComponent {
	public nameCtrl = new FormControl();
	public names = ['Yona', 'Rocky', 'Yoda', 'Ronny'];
	@ViewChild(TagsComponent) tagsComp: TagsComponent;

	constructor() {
		this.nameCtrl.valueChanges.pipe(debounceTime(500)).subscribe(name => {
			this.newEntry.name = this.nameCtrl.value;
			this.save();
		});
	}

	public newEntry: Entry = {
		id: null,
		name: '',
		tags: []
	};

	public onTagsChanged() {
		this.newEntry.tags = this.tagsComp.tags;
		this.save();
	}

	public save() {

		console.log('//TODO: save entry to firebase', Math.random());
	}
}