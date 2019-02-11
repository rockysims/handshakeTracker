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

		//TODO: look into what snapshotChanges does and make sure this works as expected
		//	intended to provide access to a list of all the entries except with id added to each entry
		this.entriesOb = this.entriesCol
			.snapshotChanges()
			.pipe(
				map(actions =>
					actions.map(a => {
						const data = a.payload.doc.data() as EntryData;
						const id = a.payload.doc.id;
						return { id, ...data } as Entry;
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
		const entryData = {...entry} as EntryData;
		delete (entryData as Entry).id;
		return this.updateReal(entry.id, entryData);
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