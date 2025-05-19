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
import { SpeedDial } from 'primeng/speeddial';
import { ToastModule } from 'primeng/toast';

interface MenuItem {
  icon: string;
  command: any;
  label: string;
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
    ToastModule,
    SpeedDial
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  token: any = localStorage.getItem('token');

  loading$!: any;
  showMessage: boolean = false;
  user!: any;

  selectedWeekOffset: number = 0; //選擇週數 0為本周
  today: Date = new Date(); //今天
  weekStartDate!: Date; //每周開始日期
  weekEndDate!: Date; //每周結束日期

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
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.items = [
      {
        label: '',
        icon: 'pi pi-pencil',
        command: () => {
          // this.messageService.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
        }
      },
      {
        label: '',
        icon: 'pi pi-refresh',
        command: () => {
          // this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
        }
      }
    ];

    const req = {
      token: this.token
    }
    this.http.getUserByTokenApi(req).subscribe((res: any) => {
      this.user = res.user;
    });
    this.getData();
  }

  // 取的該天飲食、睡眠、運動資料
  getData() {
    const req = {
      token: this.token,
      date: this.selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    }
    this.getAiResData(req);
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

  // 取得該天AI回應資料
  getAiResData(req: any) {
    this.http.getDailyReportApi(req).subscribe({
      next: (res: any) => {
        console.log(res);
        this.report = res.dailyFeedback ? res.dailyFeedback.feedback : null;
      }
    });
  }
}
