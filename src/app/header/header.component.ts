import {Component} from '@angular/core';
import {auth} from "firebase";
import {AngularFireAuth} from "@angular/fire/auth";

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.less'],
})
export class HeaderComponent {
	constructor(
		public afAuth: AngularFireAuth,
	) {}

	get currentUser() {
		return this.afAuth.auth.currentUser;
	}

	login() {
		this.afAuth.auth.signInWithRedirect(new auth.FacebookAuthProvider());
	}

	logout() {
		this.afAuth.auth.signOut();
	}

}
