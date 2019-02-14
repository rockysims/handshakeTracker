import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {map, publishReplay, startWith, switchMap, take} from "rxjs/operators";
import {EndpointService} from "./endpoint.service";

@Injectable({
	providedIn: 'root'
})
export class EntryDraftService {
	private readonly entryDraftDoc$: Observable<AngularFirestoreDocument<EntryData>>;
	public entryDraft$: Observable<EntryData>;

	constructor(private afs: AngularFirestore,
				private endpointService: EndpointService
	) {
		this.entryDraftDoc$ = endpointService.entryDraft().pipe(
			map(entryDraftEndpoint => afs.doc<EntryData>(entryDraftEndpoint))
		);

		this.entryDraft$ = this.entryDraftDoc$.pipe(
			switchMap(entryDraftDoc => entryDraftDoc.valueChanges()),
			startWith(EntryDraftService.buildBlankEntryData())
		);
	}

	save(entryData: EntryData) {
		return new Promise<void>((resolve, reject) => {
			this.entryDraftDoc$.pipe(
				publishReplay(1),
				take(1)
			).subscribe(doc => {
				doc.set(entryData).then(resolve, reject);
			}, reject);
		});
	}

	clear() {
		return this.save(EntryDraftService.buildBlankEntryData());
	}

	static buildBlankEntryData(): EntryData {
		return {
			name: '',
			tags: []
		};
	}
}