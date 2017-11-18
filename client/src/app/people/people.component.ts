import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {PeopleService} from './people.service';
import {Person} from './person';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})

export class PeopleComponent implements OnInit {

  people$: Observable<Person[]>;

  constructor(private peopleService: PeopleService) {
  }

  ngOnInit() {
    this.people$ = this.peopleService.getAllPeople();
  }
}
