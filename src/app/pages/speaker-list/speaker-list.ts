import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonAvatar,
  IonSearchbar,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { DisciplinaService } from '../../providers/disciplina.service';
import { Disciplina } from '../../interfaces/disciplina';

@Component({
    selector: 'page-speaker-list',
    templateUrl: 'speaker-list.html',
    styleUrls: ['./speaker-list.scss'],
    imports: [
        IonHeader,
        IonSearchbar,
        IonToolbar,
        IonButtons,
        IonMenuButton,
        IonTitle,
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
        IonCard,
        IonCardHeader,
        IonItem,
        IonAvatar,
        IonLabel,
        IonCardContent,
        IonList,
        RouterLink,
    ]
})
export class SpeakerListPage {
  private disciplinaService = inject(DisciplinaService);

  disciplinas: Disciplina[] = [];

  ionViewDidEnter() {
    this.disciplinaService.getDisciplinas().subscribe(data => {
    });
  }

  getDisciplinas(event) {
    let val = event.target.value;
    console.log(val);
    if (!val || !val.trim()) {
      this.disciplinas = [];
      return;
    }
    this.disciplinas = this.disciplinaService?.query({
      nome: val,
      codigo: val
    });
    console.log(this.disciplinas);

  }

}
