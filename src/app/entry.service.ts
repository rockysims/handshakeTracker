import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from "@angular/fire/firestore";

const ENTRIES_ENDPOINT = 'entries';

@Injectable({
	providedIn: 'root'
})
export class EntryService {
	private entries: AngularFirestoreCollection<Entry>;
	private entryDoc: AngularFirestoreDocument<Entry>;


	constructor(private db: AngularFirestore) {
		this.entries = db.collection<Entry>(ENTRIES_ENDPOINT);
	}

	addEntry(entry) {
		this.entries.add(entry);
	}

	updateEntry(id, update) {
		this.entryDoc = this.db.doc<Entry>(`${ENTRIES_ENDPOINT}/${id}`);
		this.entryDoc.update(update);
	}

	deleteEntry(id) {
		this.entryDoc = this.db.doc<Entry>(`${ENTRIES_ENDPOINT}/${id}`);
		this.entryDoc.delete();
	}
}

//see https://medium.com/@coderonfleek/firebase-firestore-and-angular-todo-list-application-d0fe760f6bca