import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {EndpointService} from "./endpoint.service";

@Injectable({
	providedIn: 'root'
})
export class EntryService {
	public entries$: Observable<Entry[]>;
	private entriesCol: AngularFirestoreCollection<EntryData>;

	constructor(private db: AngularFirestore,
				private endpointService: EndpointService) {
		this.entriesCol = this.db.collection<EntryData>(this.endpointService.entries());

		this.entries$ = this.entriesCol
			.snapshotChanges()
			.pipe(
				map(actions =>
					actions.map(a => {
						return {
							id: a.payload.doc.id,
							data: a.payload.doc.data() as EntryData
						} as Entry;
					})
				)
			);
	}

	create(entry: EntryData) {
		console.log('EntryService.create() called with ', entry); //TODO: delete this line
		return this.entriesCol.add(entry);
	}

	update(entry: Entry) {
		console.log('EntryService.update() called with ', entry); //TODO: delete this line
		return this.entryDocFor(entry).update(entry.data);
	}

	delete(entry: Entry) {
		console.log('EntryService.delete() called with ', entry); //TODO: delete this line
		return this.entryDocFor(entry).delete();
	}

	private entryDocFor(entry: Entry) {
		return this.db.doc<EntryData>(this.endpointService.entry(entry.id));
	}
}

//see https://medium.com/@coderonfleek/firebase-firestore-and-angular-todo-list-application-d0fe760f6bca