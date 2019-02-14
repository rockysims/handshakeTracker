import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {Observable} from "rxjs";
import {map, share} from "rxjs/operators";
import {GuestService} from "./guest.service";

@Injectable({
	providedIn: 'root'
})
export class EndpointService {
	private userId$: Observable<string|null>;

	constructor(private afAuth: AngularFireAuth,
				private guestService: GuestService
	) {
		this.userId$ = afAuth.authState.pipe(
			map(user => (user)
				? user.uid
				: null
			),
			share()
		);
	}

	entries = () => this.build('entries');
	entry = (entryId: string) => this.build(`entries/${entryId}`);
	entryDraft = () => this.build('persist/entryDraft');

	private build(path: string): Observable<string|null> {
		return this.userId$.pipe(
			map(userId => {
				return (userId !== null)
					? `users/${userId}/${path}`
					: `guests/${this.guestService.id}/${path}`;
			}),
			share()
		);
	}
}
