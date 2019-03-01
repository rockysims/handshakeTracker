import {CanActivate, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {UserService} from "./user.service";

@Injectable()
export class LoginRouteGuard implements CanActivate {
	constructor(private router: Router,
				private userService: UserService) {}

	canActivate() {
		return this.userService.isLoggedIn()
			|| this.redirectToLogin();
	}

	redirectToLogin() {
		this.router.navigateByUrl('/login');
		return false;
	}
}
