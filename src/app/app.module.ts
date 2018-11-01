import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { MatButtonModule, MatCheckboxModule } from "@angular/material";
import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { environment } from "../environments/environment";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";

const FIREBASE_IMPORTS = [
	AngularFireModule.initializeApp(environment.firebase),
	AngularFirestoreModule,
	AngularFireAuthModule,
];

const MATERIAL_IMPORTS = [
	MatButtonModule,
	MatCheckboxModule,
];

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		...FIREBASE_IMPORTS,
		...MATERIAL_IMPORTS,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}
