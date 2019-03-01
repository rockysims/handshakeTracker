import {Component} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {Router} from "@angular/router";
import {UserService} from "../user.service";

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.less'],
})
export class HeaderComponent {
	constructor(private router: Router,
				private afAuth: AngularFireAuth,
				private userService: UserService) {}

	get currentUser() {
		return this.userService.currentUser;
	}

	logout() {
		this.afAuth.auth.signOut().then(() => this.router.navigateByUrl('/login'));
	}

}
