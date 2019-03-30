import {Component} from "@angular/core";
import {AngularFirestore} from "@angular/fire/firestore";
import {EndpointService} from "./endpoint.service";
import {UserService} from "./user.service";
import {HttpClient} from "@angular/common/http";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.less"]
})
export class AppComponent {
	constructor(
		db: AngularFirestore,
		endpointService: EndpointService,
		userService: UserService,
		http: HttpClient
	) {
		let updateQueued = false;
		let updateInProgress = false;
		let latestChangeSub = null;
		userService.userUid$().subscribe(userUid => {
			if (latestChangeSub) latestChangeSub.unsubscribe();
			if (userUid) {
				const updateAlgoliaIndex = () => {
					updateInProgress = true;
					http.get(`https://handshake-tracker-algolia.herokuapp.com/update-algolia-index-for/${userUid}`)
						.toPromise()
						.then(() => {
							console.log('algolia indexing via heroku succeeded'); //TODO: delete this line?
						}, (errors: string[]) => {
							console.log('algolia indexing failed because: ', errors);
						}).finally(() => {
							updateInProgress = false;
							if (updateQueued) {
								updateQueued = false;
								updateAlgoliaIndex();
							}
						});
				};

				latestChangeSub = db.doc(endpointService.latestChange()).valueChanges().subscribe(() => {
					if (updateInProgress) updateQueued = true;
					else updateAlgoliaIndex();
					console.log('latest change updated'); //TODO: delete this line
				});
			}
		});
	}
}
