import {Component} from "@angular/core";
import {AngularFirestore} from "@angular/fire/firestore";
import {Observable} from "rxjs";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.less"]
})
export class AppComponent {
	title = "handshakeTracker";

	items: Observable<any[]>;

	constructor(
		public db: AngularFirestore
	) {
		this.items = db.collection("items").valueChanges();
	}
}
