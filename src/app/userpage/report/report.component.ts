import { HttpService } from './../../@services/http.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { GptService } from '../../@services/gpt.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LoadingService } from '../../@services/loading.service';
import { Message } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { DatePicker } from 'primeng/datepicker';
import { DateService } from '../../@services/date.service';

interface MenuItem {
  icon: string;
  command: any;
}

@Component({
  selector: 'app-report',
  imports: [
    FormsModule,
    CommonModule,

    ButtonModule,
    Dialog,
    ProgressSpinner,
    Message,
    DropdownModule,
    DatePicker,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  token: any = localStorage.getItem('token');

  loading$!: any;
  showMessage: boolean = false;
  user!: any;

  today: Date = new Date(); //今天

  selectedDate: Date = new Date(); // 選擇的日期

  exerciseList!: any; // 運動紀錄
  totalConsumed: number = 0; // 消耗的卡路里
  mealsList!: any; // 飲食紀錄
  diet!: any; // 該天三餐紀錄
  sleepList!: any; // 睡眠紀錄
  report!: any;  // 該天AI報告

  aiRes!: any; // AI回應內容
  items: MenuItem[] = []; // 工具欄位內容
  visible: boolean = false;   // dialog 顯示

  constructor(
    private http: HttpService,
    private gptService: GptService,
    private loadingService: LoadingService,
    private dateService: DateService
  ) { }

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
    const req = {
      token: this.token
    }
    this.http.getUserByTokenApi(req).subscribe((res: any) => {
      this.user = res.user;
    });
    this.getData();
  }

  // 取得該天AI回應資料
  getAiResData(req: any) {
    this.http.getDailyReportApi(req).subscribe({
      next: (res: any) => {
        console.log(res);
        this.report = res.dailyFeedback ? res.dailyFeedback.feedback : null;
      }
    });
  }

  // 取的該天飲食、睡眠、運動資料
  getData() {
    console.log(this.selectedDate);

    const req = {
      token: this.token,
      date: this.dateService.changeDateFormat(this.selectedDate)
    }

    this.getAiResData(req); // 取得該天AI回應資料

    // 取得該天健康資料
    this.http.getDataByDateApi(req).subscribe({
      next: (res: any) => {
        this.mealsList = res.mealsList
        this.diet = {
          breakfast: res.mealsList.filter((meal: any) => meal.mealsType === "早餐").map((meal: any) => JSON.parse(meal.mealsName)).flat(),
          lunch: res.mealsList.filter((meal: any) => meal.mealsType === "午餐").map((meal: any) => JSON.parse(meal.mealsName)).flat(),
          dinner: res.mealsList.filter((meal: any) => meal.mealsType === "晚餐").map((meal: any) => JSON.parse(meal.mealsName)).flat()
        };
        console.log(this.diet);

        this.sleepList = res.sleepList;

        this.exerciseList = res.exerciseList ? res.exerciseList : null;
        this.totalConsumed = this.exerciseList.reduce((sum: number, exercise: any) => sum + exercise.totalConsumed, 0);
      },
      error: (err: any) => {
        console.log('API回應', err);
      }
    })
  }

  // 判斷是否為當天
  get isToday(): boolean {
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);
    const selectedTimestamp = new Date(this.selectedDate).setHours(0, 0, 0, 0);
    return todayTimestamp == selectedTimestamp;
  }

  // 產生報告
  generateReport() {
    this.loadingService.showLoading();
    this.visible = false;
    // 飲食
    const mealText = [
      this.diet.breakfast.length > 0 ? `早餐吃了${this.diet.breakfast.join("、")}，` : "",
      this.diet.lunch.length > 0 ? `午餐吃了${this.diet.lunch.join("、")}，` : "",
      this.diet.dinner.length > 0 ? `晚餐吃了${this.diet.dinner.join("、")}`: ""
    ].filter(text => text).join(" ");

    // 運動
    const exerciseText = this.exerciseList.length > 0 ? this.exerciseList.map((exercise: any) => `${exercise.exerciseName} ${exercise.duration}分鐘`).join('、') : '';
    // 睡眠
    const sleepText = this.sleepList.length > 0 ? `我睡了 ${this.sleepList[0].hours} 小時，${this.sleepList[0].insomnia ? "有" : "沒"}失眠，睡前${this.sleepList[0].phone ? "有" : "沒"}用手機` : '';
    // 給 AI 的文字
    const req = `
    你是一位健康分析建議師，我給你使用者資訊，用淺顯易懂的方式產生一份約100字的健康建議。
    我的身高${this.user.height}公分，
    體重${this.user.weight}公斤，
    性別為${this.user.gender}，
    工作型態為${this.user.workType}。
    ${mealText}。${exerciseText}。${sleepText}。`.replace(/\s+/g, ' ').trim();
    console.log(req);

    this.gptService.sendMessage(req).subscribe({
      next: (res: any) => {
        this.aiRes = res;
        if (this.aiRes) {
          this.save();
        }
      },
      error: (err: any) => {
        console.log('API錯誤', err);
        setTimeout(() => {
          this.loadingService.hideLoading();
        }, 2000);
      }
    });
  }

  save() {
    const req = {
      token: this.token,
      date: this.dateService.changeDateFormat(new Date()),
      feedback: this.aiRes
    }
    console.log(req);
    this.http.fillInTodayReportApi(req).subscribe((res: any) => {
      if (res.code == 200) {
        this.loadingService.hideLoading();
        this.aiRes = null;
        this.getData();
      } else {
        setTimeout(() => {
          this.loadingService.hideLoading();
        }, 2000);
      }
    });

  }
}
