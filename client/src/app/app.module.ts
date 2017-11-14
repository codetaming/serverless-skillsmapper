import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import {PeopleComponent} from "./people.component";


@NgModule({
  declarations: [
    PeopleComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [PeopleComponent]
})
export class AppModule {
}
