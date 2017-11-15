import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {PeopleService} from './people.service';
import {Person} from './person';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

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

  constructor(private peopleService: PeopleService) {
  }

  ngOnInit() {
    this.people$ = this.peopleService.getAllPeople();
  }
}
