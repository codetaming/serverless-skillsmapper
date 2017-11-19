import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';

import {ROUTES} from './app.routes';

import {PeopleService} from './people/people.service';
import {AuthService} from './auth/auth.service';

import {AppComponent} from './app.component';
import {PeopleComponent} from "./people/people.component";
import {NavbarComponent} from './navbar/navbar.component';
import {HomeComponent} from './home/home.component';
import {CallbackComponent} from './callback/callback.component';
import {ProfileComponent} from './profile/profile.component';

@NgModule({
  declarations: [
    PeopleComponent,
    AppComponent,
    NavbarComponent,
    HomeComponent,
    CallbackComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [AuthService, PeopleService],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(public auth: AuthService) {
    auth.handleAuthentication();
  }

}
