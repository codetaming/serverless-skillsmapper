import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import * as _ from 'lodash';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

interface Person {
  name: string;
  hash: string;
  imageUrl: string;
  tagCount: number;
}

@Component({
  selector: 'app-root',
  styleUrls: ['./people.component.css'],
  template: `
    <ul *ngIf="people$ | async as people else noData">
      <div class="person" *ngFor="let person of people">
        <div>
          <img class="person-photo" src="{{person.imageUrl}}" title="{{person.name}}">
        </div>
        <div class="person-name">
          <a href="http://profile.skillsmapper.site?hash={{person.hash}}">{{person.name}}</a>
        </div>
      </div>
    </ul>
    <ng-template #noData>No Data Available</ng-template>
  `
})

export class PeopleComponent implements OnInit {

  people$: Observable<Person[]>;

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.people$ = this.http
      .get<Person[]>('https://api.skillsmapper.org/profiles')
      .map(data => _.values(data))
      .do(console.log);
  }
}
