import { HttpService } from './../../@services/http.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Message } from 'primeng/message';


@Component({
  selector: 'app-sleep',
  imports: [
    FormsModule,

    DatePicker,
    FloatLabel,
    ButtonModule,
    InputNumber,
    SelectButtonModule,
    Message,
  ],
  templateUrl: './sleep.component.html',
  styleUrl: './sleep.component.scss'
})
export class SleepComponent {
  userEmail!: string;

  today!: Date;
  tomorrow!: Date;
  theDayBeforeYesterDay!: Date;

  sleepTime!: Date;
  awakeTime!: Date;
  sleepHours: number = 8;

  usePhone: boolean = false;
  insomnia: boolean = false;
  sleepLatency: boolean = false;

  phoneOpts: any[] = [
    { label: '有', value: true },
    { label: '沒有', value: false },
  ];

  InsomniaOpts: any[] = [
    { label: '有', value: true },
    { label: '沒有', value: false },
  ];

  sleepLatencyOpts: any[] = [
    { label: '睡得好', value: true },
    { label: '睡不好', value: false },
  ]

  showMessage: boolean = false;

  constructor(
    private http: HttpService
  ) { }

  ngOnInit(): void {

    this.userEmail = localStorage.getItem('userEmail') || '';

    this.today = new Date();

    this.tomorrow = new Date();
    this.tomorrow.setDate(this.today.getDate() + 1);
    this.tomorrow.setHours(23, 59, 59, 999);

    this.theDayBeforeYesterDay = new Date();
    this.theDayBeforeYesterDay.setDate(this.today.getDate() - 1);
    this.theDayBeforeYesterDay.setHours(0, 0, 0, 0);
  }

  calculateSleepHours() {
    if (this.sleepTime && this.awakeTime) {
      if (this.awakeTime <= this.sleepTime) {
        this.awakeTime.setDate(this.awakeTime.getDate() + 1);
      }
      this.sleepHours = (this.awakeTime.getTime() - this.sleepTime.getTime()) / (1000 * 60 * 60); // 轉換為小時
    }
  }

  save() {
    const req = {
      email: this.userEmail,
      sleepTime: this.sleepTime,
      awakeTime: this.awakeTime,
      phone: this.usePhone,
      insomnia: this.insomnia,
      sleepLatency: this.sleepLatency
    }

    console.log(req);

    this.http.fillinSleepApi(req).subscribe({
      next: (res: any) => {
        console.log('API回應', res);
        if (res.code == 200) {
          this.showMessage = true;
          setTimeout(() => {
            this.showMessage = false
          }, 2000);
        }
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    })

  }


}
