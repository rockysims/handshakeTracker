import {Component, OnDestroy, OnInit} from '@angular/core';
import {auth} from "firebase";
import {AngularFireAuth} from "@angular/fire/auth";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {Router} from "@angular/router";

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit, OnDestroy {
	private ngUnsubscribe = new Subject();
	pendingUser = true;

	constructor(private router: Router,
				private afAuth: AngularFireAuth) {}

	ngOnInit() {
		this.afAuth.authState.pipe(
			takeUntil(this.ngUnsubscribe)
		).subscribe(user => {
			this.pendingUser = false;
			if (user) this.router.navigateByUrl('/add');
		});
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	login() {
		this.afAuth.auth.signInWithRedirect(new auth.FacebookAuthProvider());
	}
}
