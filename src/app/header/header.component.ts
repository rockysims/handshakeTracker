import {Component, Input} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {Router} from "@angular/router";

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.less'],
})
export class HeaderComponent {
	@Input() private back: {name: string, path: string};

	constructor(private router: Router,
				private afAuth: AngularFireAuth) {}

	logout() {
		this.afAuth.auth.signOut().then(() => this.router.navigateByUrl('/login'));
	}
}
