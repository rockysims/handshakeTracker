import {Injectable} from '@angular/core';
import {UserService} from "./user.service";

@Injectable({
	providedIn: 'root'
})
export class EndpointService {
	constructor(private userService: UserService) {}

	entries = () => this.build('entries');
	entry = (entryId: string) => this.build(`entries/${entryId}`);
	entryDraft = () => this.build('persist/entryDraft');
	latestChange = () => this.build('latest/change');
	latestIndex = () => this.build('latest/index');

	private build(path: string): string {
		const user = this.userService.currentUser;
		if (user) {
			return `users/${user.uid}/${path}`;
		} else throw "EndpointService::build() failed because user is not logged in!";
	}
}