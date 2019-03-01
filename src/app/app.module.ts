import { NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import {
	MatButtonModule,
	MatCheckboxModule,
	MatDividerModule,
	MatAutocompleteModule,
	MatFormFieldModule,
	MatInputModule,
	MatChipsModule,
	MatIconModule,
} from "@angular/material";
import {
	FormsModule,
	ReactiveFormsModule
} from '@angular/forms';
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { environment } from "../environments/environment";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HeaderComponent } from './header/header.component';
import { AddComponent } from './add/add.component';
import { BrowseComponent } from './browse/browse.component';
import { TagsComponent } from './tags/tags.component';
import { AutofocusDirective } from './autofocus.directive';
import { EntryEditorComponent } from './entry-editor/entry-editor.component';
import { EntryComponent } from './entry/entry.component';
import { EntryViewComponent } from './entry-view/entry-view.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { LoginComponent } from './login/login.component';
import {LoginRouteGuard} from "./login-route.guard";

const FIREBASE_IMPORTS = [
	AngularFireModule.initializeApp(environment.firebase),
	AngularFirestoreModule,
	AngularFireAuthModule,
];

const MATERIAL_IMPORTS = [
	MatButtonModule,
	MatCheckboxModule,
	MatDividerModule,
	MatAutocompleteModule,
	MatFormFieldModule,
	MatInputModule,
	MatChipsModule,
	MatIconModule,
];

const FORMS_IMPORTS = [
	FormsModule,
	ReactiveFormsModule,
];

@NgModule({
	declarations: [
		AppComponent,
		HeaderComponent,
		AddComponent,
		BrowseComponent,
		TagsComponent,
		AutofocusDirective,
		EntryEditorComponent,
		EntryComponent,
		EntryViewComponent,
		AutocompleteComponent,
		LoginComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		...FIREBASE_IMPORTS,
		...MATERIAL_IMPORTS,
		...FORMS_IMPORTS,
	],
	providers: [ LoginRouteGuard ],
	bootstrap: [ AppComponent ]
})
export class AppModule {
}
