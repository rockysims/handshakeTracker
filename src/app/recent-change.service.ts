import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class RecentChangeService {
	deletedEntryIds: string[] = [];
	editedEntryById: {[entryId: string]: Entry} = {};

	constructor() {}
}
