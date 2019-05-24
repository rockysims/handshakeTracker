import {Injectable} from '@angular/core';
import {UserService} from "./user.service";

@Injectable({
	providedIn: 'root'
})
export class EndpointService {
	constructor(private userService: UserService) {}

	entries = () => this.build('entries');
	entry = (entryId: string) => this.build(`entries/${entryId}`);
	latestChange = () => this.build('latest/change');
	latestIndex = () => this.build('latest/index');
	unixTimestampByEntryId = () => this.build('derived/unixTimestampByEntryId');

	private build(path: string): string {
		const user = this.userService.currentUser;
		if (user) {
			return `users/${user.uid}/${path}`;
		} else throw "EndpointService::build() failed because user is not logged in!";
	}
}