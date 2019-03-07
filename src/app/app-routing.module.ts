import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AddComponent} from "./add/add.component";
import {BrowseComponent} from "./browse/browse.component";
import {LoginComponent} from "./login/login.component";
import {LoginRouteGuard} from "./login-route.guard";
import {SandboxComponent} from "./sandbox/sandbox.component";

const routes: Routes = [
	{path: 'login', component: LoginComponent},
	{path: '', component: AddComponent, canActivate: [LoginRouteGuard]},
	{path: 'add', component: AddComponent, canActivate: [LoginRouteGuard]},
	{path: 'browse', component: BrowseComponent, canActivate: [LoginRouteGuard]},
	{path: 'sandbox', component: SandboxComponent, canActivate: [LoginRouteGuard]},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
