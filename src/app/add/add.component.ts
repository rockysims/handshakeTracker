import {Component, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TagsComponent} from "../tags/tags.component";

interface Entry {
	id: number|null,
	name: string,
	tags: string[]
}

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.less']
})
export class AddComponent {
	public myControl = new FormControl();
	public names = ['Yona', 'Rocky', 'Yoda', 'Ronny'];
	@ViewChild(TagsComponent) tagsComp: TagsComponent;

	public newEntry: Entry = {
		id: null,
		name: '',
		tags: []
	};

	public onNameBlur() {
		this.newEntry.name = this.myControl.value;
		this.save();
	}

	public onTagsChanged() {
		this.newEntry.tags = this.tagsComp.tags;
		this.save();
	}

	public save() {
		console.log('//TODO: save entry to firebase');
	}
}