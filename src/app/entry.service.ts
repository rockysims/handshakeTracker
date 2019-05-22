import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {EndpointService} from "./endpoint.service";

@Injectable({
	providedIn: 'root'
})
export class EntryService {
	private entriesCol: AngularFirestoreCollection<EntryData>;

	constructor(private db: AngularFirestore,
				private endpointService: EndpointService) {
		this.entriesCol = this.db.collection<EntryData>(this.endpointService.entries());
	}

	get(entryId: string): Promise<Entry> {
		return this.entryDocFor(entryId)
			.get()
			.toPromise()
			.then(doc => {
				return {
					id: doc.id,
					data: doc.data() as EntryData
				} as Entry;
			});
	}

	create(entry: EntryData) {
		console.log('EntryService.create() called with ', entry); //TODO: delete this line
		return this.entriesCol.add(entry);
	}

	update(entry: Entry) {
		console.log('EntryService.update() called with ', entry); //TODO: delete this line
		return this.entryDocFor(entry.id).update(entry.data);
	}

	delete(entry: Entry) {
		console.log('EntryService.delete() called with ', entry); //TODO: delete this line
		return this.entryDocFor(entry.id).delete();
	}

	private entryDocFor(entryId: string) {
		return this.db.doc<EntryData>(this.endpointService.entry(entryId));
	}
}

//see https://medium.com/@coderonfleek/firebase-firestore-and-angular-todo-list-application-d0fe760f6bca