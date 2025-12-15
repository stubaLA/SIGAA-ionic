import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  logoFacebook,
  logoInstagram,
  logoTwitter,
  logoVimeo,
  options,
  search,
  shareSocial,
} from 'ionicons/icons';

import { LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  Config,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItemDivider,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  LoadingController,
  ModalController,
  ToastController,
  IonSegment,
  IonSegmentButton,
  IonItem
} from '@ionic/angular/standalone';
import { Matricula } from '../../interfaces/matricula';
import { ConferenceService } from '../../providers/conference.service';
import { MatriculaService } from '../../providers/matricula.service';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html',
  styleUrls: ['./schedule.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    IonTitle,
    IonButton,
    IonList,
    IonListHeader,
    FormsModule,
    IonItemSliding,
    LowerCasePipe,
    RouterLink,
    IonItemGroup,
    IonItemDivider,
    IonItemOption,
    IonItemOptions,
    IonLabel,
    IonMenuButton,
    IonSegment,
    IonSegmentButton,
    IonItem
  ],
  providers: [
    ModalController,
    AlertController,
    LoadingController,
    ToastController,
    Config,
  ]
})
export class SchedulePage {
  alertCtrl = inject(AlertController);
  loadingCtrl = inject(LoadingController);
  modalCtrl = inject(ModalController);
  router = inject(Router);
  routerOutlet = inject(IonRouterOutlet);
  toastCtrl = inject(ToastController);
  matriculaService = inject(MatriculaService);
  config = inject(Config);
  matriculaConfirmada = false;

  segment = 'list';
  days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
  timeSlots = [
    { start: '08:00', label: '08:00 - 09:50' },
    { start: '10:00', label: '10:00 - 11:50' },
    { start: '12:00', label: '12:00 - 13:50' },
    { start: '14:00', label: '14:00 - 15:50' },
    { start: '16:00', label: '16:00 - 17:50' },
    { start: '18:00', label: '18:00 - 19:50' },
    { start: '20:00', label: '20:00 - 21:50' },
    { start: '22:00', label: '22:00 - 23:50' }
  ];

  dayMap = {
    'SEG': 2, 'TER': 3, 'QUA': 4, 'QUI': 5, 'SEX': 6, 'SAB': 7, 'DOM': 8
  };

  timeMap = {
    '08:00': 2, '10:00': 3, '12:00': 4, '14:00': 5,
    '16:00': 6, '18:00': 7, '20:00': 8, '22:00': 9
  };

  getRowForTime(horaInicio: string): number {
    if (this.timeMap[horaInicio]) {
      return this.timeMap[horaInicio];
    }
    const [hours, minutes] = horaInicio.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    for (const slot of this.timeSlots) {
      const [slotHours, slotMinutes] = slot.start.split(':').map(Number);
      const slotTimeInMinutes = slotHours * 60 + slotMinutes;
      if (Math.abs(timeInMinutes - slotTimeInMinutes) <= 30) {
        return this.timeMap[slot.start];
      }
    }
    return 0;
  }

  gridEvents: any[] = [];


  @ViewChild('scheduleList', { static: false }) scheduleList: IonList;

  matriculas: Matricula[] = [];
  matriculasLidas = false;

  constructor() {
    addIcons({
      search,
      options,
      shareSocial,
      logoVimeo,
      logoInstagram,
      logoTwitter,
      logoFacebook,
    });
  }

  ionViewWillEnter() {
    if (this.matriculasLidas) {
      this.matriculas = this.matriculaService.search();
      this.processSchedule();
    }
    else {
      this.matriculaService.getMatriculas().subscribe(data => {
        this.matriculas = data.matriculas;
        this.processSchedule();
      });
      this.matriculasLidas = true;
    }
    this.matriculaConfirmada = this.matriculaService.verificarMatriculaConfirmada();
  }

  processSchedule() {
    this.gridEvents = [];
    for (const matricula of this.matriculas) {
      if ((matricula.status === 'Matriculado' || matricula.status === 'Confirmado') && matricula.turma && matricula.turma.horario) {
        for (const h of matricula.turma.horario) {
          if (this.dayMap[h.dia]) {
            const row = this.getRowForTime(h.horaInicio);
            if (row > 0) {
              this.gridEvents.push({
                subjectCode: matricula.turma.disciplina.codigo,
                col: this.dayMap[h.dia],
                row: row,
                color: this.getColorForSubject(matricula.turma.disciplina.codigo)
              });
            }
          }
        }
      }
    }
  }

  getColorForSubject(code: string) {
    const colors = ['#e6f7ff', '#f9f0ff', '#fff7e6', '#e6fffa', '#fff0f6', '#f0f5ff'];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  confirmarMatricula() {
    this.matriculaConfirmada = true;
    this.matriculaService.confirmarMatricula();
    this.processSchedule();
  }

  verificarMatricula() {
    this.matriculaConfirmada = this.matriculaService.verificarMatriculaConfirmada();
    for (let matricula of this.matriculas) {
      if (matricula.status == 'PreMatricula') {
        return true;
      }
    }
    return false;
  }

}
