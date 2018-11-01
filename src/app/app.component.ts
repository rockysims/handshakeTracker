import { Component } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { auth } from "firebase";
import { Observable } from "rxjs";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: [ "./app.component.less" ]
})
export class AppComponent {
	title = "handshakeTracker";

	items: Observable<any[]>;

	constructor(
		public db: AngularFirestore,
		public afAuth: AngularFireAuth
	) {
		this.items = db.collection("items").valueChanges();
	}

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
