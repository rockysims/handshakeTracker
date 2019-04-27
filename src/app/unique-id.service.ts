import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class UniqueIdService {
	nextId = 0;

	constructor() {}

	next() {
		return this.nextId++;
	}
}
