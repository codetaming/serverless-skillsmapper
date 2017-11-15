import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Person} from './person';
import * as _ from 'lodash';

@Injectable()
export class PeopleService {

  constructor(private http: HttpClient) {
  }

  getAllPeople(): Observable<Person[]> {
    return this.http
      .get<Person[]>('https://api.skillsmapper.org/profiles')
      .map(data => _.values(data))
  }

}
