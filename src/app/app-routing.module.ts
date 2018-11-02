import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AddComponent} from "./add/add.component";
import {BrowseComponent} from "./browse/browse.component";

const routes: Routes = [
	{path: 'add', component: AddComponent},
	{path: 'browse', component: BrowseComponent},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
