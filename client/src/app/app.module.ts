import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';

import {PeopleService} from './people.service';
import {PeopleComponent} from "./people.component";


@NgModule({
  declarations: [
    PeopleComponent
  ],
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [PeopleService],
  bootstrap: [PeopleComponent]
})
export class AppModule {
}
