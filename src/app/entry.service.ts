import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const ENTRIES_ENDPOINT = 'entries';

@Injectable({
	providedIn: 'root'
})
export class EntryService {
	public entriesOb: Observable<Entry[]>;
	private entriesCol: AngularFirestoreCollection<EntryData>;
	private entryDoc: AngularFirestoreDocument<EntryData>;

	constructor(private db: AngularFirestore) {
		this.entriesCol = db.collection<EntryData>(ENTRIES_ENDPOINT);

		this.entriesOb = this.entriesCol
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
		return this.entriesCol.add(entry)
			.catch(reason => {
				console.error('EntryService failed to add entry because: ', reason);
				throw reason;
			});
	}

	update(entry: Entry) {
		return this.updateReal(entry.id, entry.data);
	}

	private updateReal(id: string, entryData: EntryData) {
		console.log('EntryService.update() called with ', [id, entryData]); //TODO: delete this line
		this.entryDoc = this.db.doc<EntryData>(`${ENTRIES_ENDPOINT}/${id}`);
		return this.entryDoc.update(entryData)
			.catch(reason => {
				console.error('EntryService failed to update entry ' + id + ' because: ', reason);
				throw reason;
			});
	}

	delete(entry: Entry) {
		console.log('EntryService.delete() called with ', entry); //TODO: delete this line
		this.entryDoc = this.db.doc<EntryData>(`${ENTRIES_ENDPOINT}/${entry.id}`);
		return this.entryDoc.delete()
			.catch(reason => {
				console.error('EntryService failed to delete entry ' + entry.id + ' because: ', reason);
				throw reason;
			});
	}
}

//see https://medium.com/@coderonfleek/firebase-firestore-and-angular-todo-list-application-d0fe760f6bca