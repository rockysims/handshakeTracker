import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {map, share, switchMap} from "rxjs/operators";
import {EndpointService} from "./endpoint.service";

@Injectable({
	providedIn: 'root'
})
export class EntryService {
	private entriesCol$: Observable<AngularFirestoreCollection<EntryData>>;
	public entries$: Observable<Entry[]>;

	constructor(private afs: AngularFirestore,
				private endpointService: EndpointService
	) {
		//keep this.entriesCol$ up to date
		this.entriesCol$ = endpointService.entries().pipe(
			map(entriesEndpoint => {
				return afs.collection<EntryData>(entriesEndpoint);
			}),
			share()
		);

		//keep this.entries$ up to date
		this.entries$ = this.entriesCol$.pipe(
			switchMap(entriesCol => {
				return entriesCol.snapshotChanges()
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
			}),
			share()
		);

		// //keep this.entriesReal$ up to date
		// let entriesColSubscription: Subscription|null = null;
		// this.entriesCol$.subscribe(entriesCol => {
		// 	entriesColSubscription?.unsubscribe();
		// 	entriesColSubscription = entriesCol.snapshotChanges()
		// 		.pipe(
		// 			map(actions =>
		// 				actions.map(a => {
		// 					return {
		// 						id: a.payload.doc.id,
		// 						data: a.payload.doc.data() as EntryData
		// 					} as Entry;
		// 				})
		// 			)
		// 		).subscribe(this.entriesReal$.next);
		// });
	}

	create(entry: EntryData) {
		console.log('EntryService.create() called with ', entry); //TODO: delete this line
		return this.entriesCol$.toPromise()
			.then(entriesCol => {
				return entriesCol.add(entry);
			});
	}

	update(entry: Entry) {
		console.log('EntryService.update() called with ', entry); //TODO: delete this line
		return this.getEntryDoc(entry.id)
			.then(entryDoc => entryDoc.update(entry.data));
	}

	delete(entry: Entry) {
		console.log('EntryService.delete() called with ', entry); //TODO: delete this line
		return this.getEntryDoc(entry.id)
			.then(entryDoc => entryDoc.delete());
	}

	private getEntryDoc(id: string): Promise<AngularFirestoreDocument<EntryData>> {
		return this.endpointService.entry(id).toPromise()
			.then(entryEndpoint => {
				return this.afs.doc<EntryData>(entryEndpoint);
			});
	}
}

//see https://medium.com/@coderonfleek/firebase-firestore-and-angular-todo-list-application-d0fe760f6bca