import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class UserService {
	constructor(private afAuth: AngularFireAuth) {}

	get currentUser() {
		return this.afAuth.auth.currentUser;
	}

	userUid$(): Observable<string> {
		return this.afAuth.authState.pipe(
			map(user => (user)?user.uid:null)
		);
	}

	isLoggedIn(): boolean {
		return !!this.currentUser;
	}
}
