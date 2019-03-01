import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";

@Injectable({
	providedIn: 'root'
})
export class UserService {
	constructor(private afAuth: AngularFireAuth) {}

	get currentUser() {
		return this.afAuth.auth.currentUser;
	}

	isLoggedIn(): boolean {
		return !!this.currentUser;
	}
}
