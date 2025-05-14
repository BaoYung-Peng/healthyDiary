import { HttpService } from './../../@services/http.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReportDialogComponent } from '../../components/report-dialog/report-dialog.component';
import { Dialog } from 'primeng/dialog';
import { GptService } from '../../@services/gpt.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-report',
  imports: [
    FormsModule,
    CommonModule,

    DatePicker,
    ButtonModule,
    Dialog
  ],
  providers: [DialogService],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  dateList: string[] = [
    "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"
  ];

  ref: DynamicDialogRef | undefined;

  // 一周吃了什麼? ...
  mealList!: any;
  sleepList!: any;
  // 今天吃了什麼? ...
  todayMeals!: any;

  yesterdaySleepData!: any;
  yesterdaySleepHours!: number;
  // 報告
  report!: any;

  // dialog 顯示
  visible: boolean = false;

  // 報告回應
  reportDetail!: string;

  req!: any;

  constructor(
    private http: HttpService,
    private dialogService: DialogService,
    private gptService: GptService
  ) { }

  weekDays = [
    { label: '星期日', value: 0 },
    { label: '星期一', value: 1 },
    { label: '星期二', value: 2 },
    { label: '星期三', value: 3 },
    { label: '星期四', value: 4 },
    { label: '星期五', value: 5 },
    { label: '星期六', value: 6 },
  ];


  selectedDate!: Date;
  todayIndex = new Date().getDay(); // 取得今天是星期幾


  res!: any;
  ngOnInit(): void {
    this.req = {
      token: localStorage.getItem('token')
    }
  }

  isToday(dayIndex: number): boolean {
    return dayIndex === this.todayIndex; // 如果索引與今天匹配，返回 true
  }

  selectDay(dayIndex: number) {
    const today = new Date();
    const difference = dayIndex - (today.getDay() === 0 ? 7 : today.getDay());
    this.selectedDate = new Date(today.setDate(today.getDate() + difference));
    console.log("選擇的日期:", this.selectedDate);
  }

  showDialog() {
    this.visible = true;
  }
  confirm() {
    this.visible = false;
    this.getTodayMeals();
    this.getTodaySleep();
  }

  getTodayMeals() {
    this.http.getMealApi(this.req).subscribe({
      next: (res: any) => {
        this.mealList = res.meals;
        const today = new Date().toISOString().split('T')[0];
        // 篩選當天的餐點
        this.todayMeals = this.mealList.filter((meal: any) => meal.eatTime.startsWith(today))
          .map((meal: any) => JSON.parse(meal.mealsName)).flat();
      },
      error: (err: any) => {
        console.log('API回應', err);
      }
    });
  }

  getTodaySleep() {
    this.http.getTodaySleepApi(this.req).subscribe({
      next: (res: any) => {
        this.sleepList = res.sleeplist || []; // 確保不是 undefined

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        this.yesterdaySleepData = this.sleepList.filter((item: any) => {
          console.log("檢查時間:", item.sleepTime); // 先檢查時間格式
          return item.sleepTime?.startsWith(yesterdayStr);
        });
        this.yesterdaySleepHours = this.yesterdaySleepData.reduce((sum: any, sleep: any) => sum + sleep.hours, 0);
        console.log("昨天的睡眠資料:", this.yesterdaySleepData);
        console.log(this.yesterdaySleepHours);

      }
    });
  }


  generateReport() {
    const req = "";
    this.gptService.sendMessage(req);
  }
}
