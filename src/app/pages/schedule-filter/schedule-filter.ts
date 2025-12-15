import { LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Config,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
  ModalController,
  NavParams,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  call,
  cog,
  colorPalette,
  compass,
  construct,
  document,
  hammer,
  logoAngular,
  logoIonic,
  restaurant,
} from 'ionicons/icons';
import { ConferenceService } from '../../providers/conference.service';

@Component({
    selector: 'page-schedule-filter',
    templateUrl: 'schedule-filter.html',
    styleUrls: ['./schedule-filter.scss'],
    imports: [
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonTitle,
        IonContent,
        IonList,
        IonListHeader,
        IonCheckbox,
        IonFooter,
        IonItem,
        FormsModule,
        LowerCasePipe,
        IonIcon,
    ],
    providers: [ModalController]
})
export class ScheduleFilterPage {
  private config = inject(Config);
  private modalCtrl = inject(ModalController);
  private navParams = inject(NavParams);
  private confService = inject(ConferenceService);

  ios: boolean;

  tracks: { name: string; icon: string; isChecked: boolean }[] = [];

  constructor() {
    addIcons({
      logoAngular,
      document,
      restaurant,
      logoIonic,
      hammer,
      colorPalette,
      cog,
      construct,
      call,
      compass,
    });
  }

  ionViewWillEnter() {
    this.ios = this.config.get('mode') === 'ios';

    const excludedTrackNames = this.navParams.get('excludedTracks');

    this.confService.getTracks().subscribe(tracks => {
      tracks.forEach(track => {
        this.tracks.push({
          name: track.name,
          icon: track.icon,
          isChecked: excludedTrackNames.indexOf(track.name) === -1,
        });
      });
      this.tracks.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  selectAll(check: boolean) {
    this.tracks.forEach(track => {
      track.isChecked = check;
    });
  }

  applyFilters() {
    const excludedTrackNames = this.tracks
      .filter(c => !c.isChecked)
      .map(c => c.name);
    this.dismiss(excludedTrackNames);
  }

  dismiss(data?: string[]) {
    this.modalCtrl.dismiss(data);
  }
}
