import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';

import {PeopleService} from './people/people.service';
import {PeopleComponent} from "./people/people.component";
import {AppComponent} from './app.component';
import { NavbarComponent } from './navbar/navbar.component';


@NgModule({
  declarations: [
    PeopleComponent,
    AppComponent,
    NavbarComponent
  ],
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    BrowserAnimationsModule,
    BrowserModule,
    NgbModule.forRoot(),
    HttpClientModule
  ],
  providers: [PeopleService],
  bootstrap: [AppComponent]
})

export class AppModule {
}
