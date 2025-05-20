import { HttpService } from './../../@services/http.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Dialog } from 'primeng/dialog';
import { GptService } from '../../@services/gpt.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LoadingService } from '../../@services/loading.service';
import { Message } from 'primeng/message';


@Component({
  selector: 'app-report',
  imports: [
    FormsModule,
    CommonModule,

    ButtonModule,
    Dialog,
    ProgressSpinner,
    Message
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  dateList: string[] = [
    "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"
  ];

  ref: DynamicDialogRef | undefined;
  loading$!: any;
  showMessage: boolean = false;
  user!: any;
  mealList!: any; // 所有飲食資料
  sleepList!: any; // 所有睡眠資料
  exerciseList!: any;  // 所有運動資料
  reportList!: any; // 所有報告資料

  selectedDayMeals!: any; // 該天飲食資料
  selectedDayExercise!: any; // 該天運動資料
  previousDaySleepData!: any; // 昨晚睡眠資料
  previousDaySleepHours!: number; //昨晚睡眠時數
  selectedDayReport!: any;  // 該天報告
  exerciseSummary!: string;  // 該天運動紀錄概述(給AI用)

  aiRes!: any; // AI回應內容

  visible: boolean = false;   // dialog 顯示

  summary!: string;   // 當天所有紀錄概述

  constructor(
    private http: HttpService,
    private gptService: GptService,
    private loadingService: LoadingService
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

  // 預設為當天
  selectedDate: Date = new Date();
  selectedDateIndex = new Date().getDay(); // 取得今天是星期幾

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
    this.fetchAllData();
  }

  // 取得所有資料
  fetchAllData() {
    const req = {
      token: localStorage.getItem('token')
    }
    // 取得使用者資料
    this.http.getUserByTokenApi(req).subscribe({
      next: (res: any) => {
        this.user = res.user;
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    });
    // 取得所有飲食資料
    this.http.getMealApi(req).subscribe({
      next: (res: any) => {
        this.mealList = res.meals || [];
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    });
    // 取得所有睡眠資料
    this.http.getSleepApi(req).subscribe({
      next: (res: any) => {
        this.sleepList = res.sleeplist || [];
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    });
    // 取得所有運動資料
    this.http.getExerciseApi(req).subscribe({
      next: (res: any) => {
        this.exerciseList = res.exerciseList || [];
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    });
  }

  // ngClass用，當天是日期按鈕顏色會和其他不同
  isToday(dayIndex: number): boolean {
    return dayIndex === this.selectedDateIndex; // 如果索引與今天匹配，返回 true
  }

  // 選擇日期
  selectDay(dayIndex: number) {
    const today = new Date();
    const difference = dayIndex - (today.getDay() === 0 ? 7 : today.getDay());
    this.selectedDate = new Date(today.setDate(today.getDate() + difference));
    this.selectedDateIndex = dayIndex;
    console.log("選擇的日期:", this.selectedDate);

    this.getMealDataForSelectedDay();
    this.getSleepDataForSelectedDay();
    this.getExerciseDataForSelectedDay();

    const exerciseSummary = this.selectedDayExercise.map((exercise: any) => `${exercise.exerciseName} ${exercise.duration}分鐘`).join('、');
    this.summary = `我這天吃了${this.selectedDayMeals.join(', ')}， 做了${exerciseSummary}，昨天睡了${this.previousDaySleepHours}小時。`

    const req = {
      token: localStorage.getItem('token'),
      date: this.selectedDate.toISOString().split('T')[0]
    }
    console.log(req);
    this.http.getDailyReportApi(req).subscribe({
      next: (res: any) => {
        console.log(res);
        this.selectedDayReport = res.dailyFeedback
      }
    })
  }

  // 判斷是否大於今天，若大於disable按鈕
  isFutureDate(dayIndex: number): boolean {
    const todayIndex = new Date().getDay(); // 取得今天是星期幾
    return dayIndex > todayIndex; // 如果選擇的日期比今天晚，則禁用按鈕
  }
  showDialog() {
    this.visible = true;
  }

  // 確認產生報告
  confirm() {
    this.loadingService.showLoading();
    this.visible = false;

    this.selectedDate = new Date();

    this.selectedDayReport = null; // 選擇日期的 AI 回應
    this.aiRes = null; // 當日 AI 回應

    this.getMealDataForSelectedDay();
    this.getSleepDataForSelectedDay();
    this.getExerciseDataForSelectedDay();
    this.sendMgsToAi();
  }

  // 篩出所選日期的飲食資料
  getMealDataForSelectedDay() {
    this.selectedDayMeals = this.mealList.filter((meal: any) => meal.eatTime?.startsWith(this.selectedDate.toISOString().split('T')[0]))
      .map((meal: any) => JSON.parse(meal.mealsName)).flat();
  }

  // 篩出所選日期的睡眠資料
  getSleepDataForSelectedDay() {
    const previousDay = new Date(this.selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayStr = previousDay.toISOString().split('T')[0];

    this.previousDaySleepData = this.sleepList.filter((item: any) => item.sleepTime?.startsWith(previousDayStr));
    this.previousDaySleepHours = this.previousDaySleepData.reduce((sum: any, sleep: any) => sum + sleep.hours, 0);
  }

  // 篩出所選日期的運動資料
  getExerciseDataForSelectedDay() {
    this.selectedDayExercise = this.exerciseList.filter((exercise: any) => exercise.date?.startsWith(this.selectedDate.toISOString().split('T')[0]));
    console.log(this.selectedDayExercise);
  }

  // 傳資料給AI
  sendMgsToAi() {
    const exerciseSummary = this.selectedDayExercise.map((exercise: any) => `${exercise.exerciseName} ${exercise.duration}分鐘`).join('、');

    this.summary = `我這天吃了${this.selectedDayMeals.join(', ')}， 做了${exerciseSummary}，昨天睡了${this.previousDaySleepHours}小時。`

    const req = `你是一位健康建議師，我給你使用者資訊和繼康資料，你給我建議和評價，字數約100字。
    我的身高${this.user.height}公分，
    體重${this.user.weight}公斤，
    性別為${this.user.gender}，
    工作型態為${this.user.workType}。
    我這天吃了${this.selectedDayMeals.join(', ')}，
    做了${exerciseSummary}，
    昨天睡了${this.previousDaySleepHours}小時。
    `.replace(/\s+/g, ' ').trim();

    console.log(req);
    this.gptService.sendMessage(req).subscribe({
      next: (res) => {
        this.aiRes = res;
        if (this.aiRes) {
          this.save();
        }
      },
      error: err => {
        console.log('API錯誤', err);
      }
    });
  }

  // 儲存
  save() {
    const req = {
      token: localStorage.getItem('token'),
      date: new Date().toISOString().split('T')[0],
      feedback: this.aiRes
    }
    console.log(req);
    this.http.fillInTodayReportApi(req).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.code == 200) {
          this.loadingService.hideLoading();
          this.showMessage = true;
          setTimeout(() => {
            this.showMessage = false
          }, 2000);
        } else {
          setTimeout(() => {
            this.loadingService.hideLoading();
          }, 2000);
        }
      },
      error: (err: any) => {
        console.log('API回應', err);
        setTimeout(() => {
          this.loadingService.hideLoading();
        }, 2000);
      }
    });
  }
}
