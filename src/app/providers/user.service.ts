import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { UserOptions, UserData } from '../interfaces/user-options';

import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  storage = inject(Storage);
  http = inject(HttpClient);

  favorites: string[] = [];
  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
  LOGIN_ATTEMPTS = 'loginAttempts';
  LOCKOUT_TIMESTAMP = 'lockoutTimestamp';
  MAX_LOGIN_ATTEMPTS = 5;
  LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes

  data: UserData | null = null;

  constructor(
  ) {
    this.getUsers().subscribe(() => {
      console.log(this.data);
    })
  }

  load() {
    console.log('load');
    if (this.data) {
      return of(this.data);
    } else {
      return this.http
        .get<UserData>('assets/data/user.json')
        .pipe(map(this.processData, this));
    }
  }

  processData(data: UserData): UserData {
    console.log('processData');
    this.data = data;
    return this.data;
  }


  hasFavorite(sessionName: string): boolean {
    return this.favorites.indexOf(sessionName) > -1;
  }

  addFavorite(sessionName: string): void {
    this.favorites.push(sessionName);
  }

  removeFavorite(sessionName: string): void {
    const index = this.favorites.indexOf(sessionName);
    if (index > -1) {
      this.favorites.splice(index, 1);
    }
  }

  async login(login: UserOptions): Promise<boolean> {
    console.log('login');

    const lockoutTimestamp = await this.storage.get(this.LOCKOUT_TIMESTAMP);
    if (lockoutTimestamp) {
      if (Date.now() < lockoutTimestamp) {
        window.dispatchEvent(new CustomEvent('user:lockedOut'));
        return false;
      }
      await this.storage.remove(this.LOCKOUT_TIMESTAMP);
      await this.storage.remove(this.LOGIN_ATTEMPTS);
    }

    var hasLoggedIn = false;

    for (var i = 0; i < this.data.users.length; i++) {
      if (this.data.users[i].username == login.username && this.data.users[i].password == login.password) {
        hasLoggedIn = true;
        break;
      }
    }

    if (hasLoggedIn) {
      await this.storage.remove(this.LOGIN_ATTEMPTS);
      await this.storage.remove(this.LOCKOUT_TIMESTAMP);
      return this.storage.set(this.HAS_LOGGED_IN, true).then(() => {
        this.setUsername(login.username);
        return window.dispatchEvent(new CustomEvent('user:login'));
      });
    } else {
      let attempts = (await this.storage.get(this.LOGIN_ATTEMPTS)) || 0;
      attempts++;
      await this.storage.set(this.LOGIN_ATTEMPTS, attempts);

      if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
        await this.storage.set(this.LOCKOUT_TIMESTAMP, Date.now() + this.LOCKOUT_DURATION);
        window.dispatchEvent(new CustomEvent('user:lockedOut'));
      } else {
        return this.storage.set(this.HAS_LOGGED_IN, false).then(() => {
          return window.dispatchEvent(new CustomEvent('user:loginError'));
        });
      }
      return false;
    }
  }
  signup(username: string): Promise<boolean> {
    return this.storage.set(this.HAS_LOGGED_IN, true).then(() => {
      this.setUsername(username);
      return window.dispatchEvent(new CustomEvent('user:signup'));
    });
  }

  logout(): Promise<any> {
    return this.storage
      .remove(this.HAS_LOGGED_IN)
      .then(() => {
        return this.storage.remove('username');
      })
      .then(() => {
        window.dispatchEvent(new CustomEvent('user:logout'));
      });
  }

  setUsername(username: string): Promise<any> {
    return this.storage.set('username', username);
  }

  getUsername(): Promise<string> {
    return this.storage.get('username').then(value => {
      return value;
    });
  }

  isLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN).then(value => {
      return value === true;
    });
  }

  getUsers() {
    console.log('getUsers');
    return this.load().pipe(map((data: UserData) => data));
  }
}
