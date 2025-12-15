import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ConferenceData,
  Group,
  ScheduleDay,
  Session,
  Speaker,
} from '../interfaces/conference.interfaces';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ConferenceService {
  http = inject(HttpClient);
  user = inject(UserService);
  data: ConferenceData | null = null;

  load() {
    if (this.data) {
      return of(this.data);
    } else {
      return this.http
        .get<ConferenceData>('assets/data/data.json')
        .pipe(map(this.processData, this));
    }
  }

  processData(data: ConferenceData): ConferenceData {
    this.data = data;

    this.data.schedule.forEach((day: ScheduleDay) => {
      day.groups.forEach((group: Group) => {
        group.sessions.forEach((session: Session) => {
          session.speakers = [];
          if (session.speakerNames) {
            session.speakerNames.forEach((speakerName: string) => {
              const speaker = this.data.speakers.find(
                (s: Speaker) => s.name === speakerName
              );
              if (speaker) {
                session.speakers.push(speaker);
                speaker.sessions = speaker.sessions || [];
                speaker.sessions.push(session);
              }
            });
          }
        });
      });
    });

    return this.data;
  }

  getTimeline(
    dayIndex: number,
    queryText = '',
    excludeTracks: string[] = [],
    segment = 'all'
  ) {
    return this.load().pipe(
      map((data: ConferenceData) => {
        const day = data.schedule[dayIndex];
        day.shownSessions = 0;

        queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
        const queryWords = queryText
          .split(' ')
          .filter(w => !!w.trim().length);

        day.groups.forEach((group: Group) => {
          group.hide = true;

          group.sessions.sort((a, b) => {
            const timeA = new Date('1970/01/01 ' + a.timeStart).getTime();
            const timeB = new Date('1970/01/01 ' + b.timeStart).getTime();
            return timeA - timeB;
          });

          group.sessions.forEach((session: Session) => {
            this.filterSession(session, queryWords, excludeTracks, segment);

            if (!session.hide) {
              group.hide = false;
              day.shownSessions++;
            }
          });
        });

        return day;
      })
    );
  }

  filterSession(
    session: Session,
    queryWords: string[],
    excludeTracks: string[],
    segment: string
  ) {
    let matchesQueryText = false;
    if (queryWords.length) {
      queryWords.forEach((queryWord: string) => {
        if (session.name.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      matchesQueryText = true;
    }

    let matchesTracks = false;
    session.tracks.forEach((trackName: string) => {
      if (excludeTracks.indexOf(trackName) === -1) {
        matchesTracks = true;
      }
    });

    let matchesSegment = false;
    if (segment === 'favorites') {
      if (this.user.hasFavorite(session.name)) {
        matchesSegment = true;
      }
    } else {
      matchesSegment = true;
    }

    session.hide = !(matchesQueryText && matchesTracks && matchesSegment);
  }

  getSpeakers() {
    return this.load().pipe(map((data: ConferenceData) => data.speakers));
  }

  getTracks() {
    return this.load().pipe(map((data: ConferenceData) => data.tracks));
  }

  getMap() {
    return this.load().pipe(map((data: ConferenceData) => data.map));
  }
}
