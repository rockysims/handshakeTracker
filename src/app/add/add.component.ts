import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TagsComponent} from "../tags/tags.component";
import {debounceTime} from "rxjs/operators";
import {EntryService} from "../entry.service";

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.less']
})
export class AddComponent implements OnInit {
	public nameCtrl = new FormControl();
	public guess = {
		names: ['Yona', 'Rocky', 'Yoda', 'Ronny']
	};
	public entryIdPromise: Promise<string>|null = null;
	public entryData: EntryData = {
		name: '',
		tags: []
	};
	@ViewChild(TagsComponent) tagsComp: TagsComponent;

	constructor(private entryService: EntryService) {}

	ngOnInit() {
		this.nameCtrl.valueChanges
			.pipe(debounceTime(500))
			.subscribe(name => {
				this.entryData.name = this.nameCtrl.value;
				this.save();
			});
	}

	public onTagsChanged() {
		this.entryData.tags = this.tagsComp.tags;
		this.save();
	}

	public save() {
		if (this.entryIdPromise === null) {
			this.entryIdPromise = this.entryService
				.create(this.entryData)
				.then(it => it.id);
		} else {
			this.entryIdPromise.then(id => {
				this.entryService.update({id, ...this.entryData} as Entry);
			}).catch(reason => {
				console.error('AddComponent failed to resolve entryIdPromise because: ', reason);
			});
		}
	}
}