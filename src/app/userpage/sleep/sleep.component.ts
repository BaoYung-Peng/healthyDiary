import { HttpService } from './../../@services/http.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Message } from 'primeng/message';


@Component({
  selector: 'app-sleep',
  imports: [
    FormsModule,
    DatePicker,
    FloatLabel,
    ButtonModule,
    SelectButtonModule,
    Message,
  ],
  templateUrl: './sleep.component.html',
  styleUrl: './sleep.component.scss'
})
export class SleepComponent {
  today!: Date;
  yesterDay!: Date;

  sleepTime!: Date;
  awakeTime!: Date;
  sleepHours: number = 0;

  usePhone: boolean = true;
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
    { label: '睡得好', value: false },
    { label: '睡不好', value: true },
  ]

  showMessage: boolean = false;

  constructor(
    private http: HttpService
  ) { }

  ngOnInit(): void {
    this.today = new Date();

    this.yesterDay = new Date();
    this.yesterDay.setDate(this.today.getDate() - 1);
    this.yesterDay.setHours(0, 0, 0, 0);

    const defaultSleepTime = new Date();
    defaultSleepTime.setDate(defaultSleepTime.getDate() - 1); // 設定為昨天
    defaultSleepTime.setHours(21, 0, 0, 0); // 設定時間為 21:00 (9 PM)
    const defaultAwakeTime = new Date();
    defaultAwakeTime.setHours(7, 0, 0, 0); // 設定時間為 07:00 (7 AM)
    this.sleepTime = defaultSleepTime; // 指定預設值
    this.awakeTime = defaultAwakeTime;
    console.log('睡覺', this.sleepTime);
    console.log('起床', this.awakeTime);
    this.calculateSleepHours();

  }

  calculateSleepHours() {
    if (this.sleepTime && this.awakeTime) {
      if (this.awakeTime <= this.sleepTime) {
        this.awakeTime.setDate(this.awakeTime.getDate() + 1);
      }
      this.sleepHours = Number(((this.awakeTime.getTime() - this.sleepTime.getTime()) / (1000 * 60 * 60)).toFixed(1)); // 轉換為小時
    }
  }

  save() {
    const req = {
      token: localStorage.getItem('token'),
      sleepTime: this.sleepTime,
      awakeTime: this.awakeTime,
      hours: this.sleepHours,
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
