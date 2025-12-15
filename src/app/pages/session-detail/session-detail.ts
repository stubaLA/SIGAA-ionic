import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudDownload,
  share,
  shareOutline,
  star,
  starOutline,
} from 'ionicons/icons';

import { Session } from '../../interfaces/conference.interfaces';
import { ConferenceService } from '../../providers/conference.service';
import { UserService } from '../../providers/user.service';
import { Matricula } from '../../interfaces/matricula';
import { MatriculaService } from '../../providers/matricula.service';

@Component({
    selector: 'page-session-detail',
    styleUrls: ['./session-detail.scss'],
    templateUrl: 'session-detail.html',
    imports: [
        IonHeader,
        IonToolbar,
        IonButtons,
        IonBackButton,
        IonContent,
        IonButton,
        IonIcon,
        IonList,
        IonItem,
        IonLabel,
        IonText,
    ]
})
export class SessionDetailPage {
  private matriculaService = inject(MatriculaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  matricula: Matricula;
  isFavorite = false;
  defaultHref = '';

  constructor() {
    addIcons({ shareOutline, starOutline, star, cloudDownload, share });
  }

  ionViewWillEnter() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    this.matricula = this.matriculaService.detail(sessionId);
    console.log(this.matricula);
  }

  ionViewDidEnter() {
    this.defaultHref = '/app/tabs/schedule';
  }
  verificarMatriculaConfirmada() {
    return this.matriculaService.matriculaConfirmada;
  }

  alterarStatus(status) {
    this.matriculaService.patchStatus(this.matricula.id,status);
    this.router.navigateByUrl(this.defaultHref);

  }

  excluir() {
    this.matriculaService.delete(this.matricula.id);
    this.router.navigateByUrl(this.defaultHref);
  }
}
