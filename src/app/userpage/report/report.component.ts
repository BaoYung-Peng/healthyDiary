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
    DatePicker
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
  mealsList!: any; // 飲食紀錄
  report!: any;  // 該天報告

  aiRes!: any; // AI回應內容

  visible: boolean = false;   // dialog 顯示

  summary!: string;   // 當天所有紀錄概述

  constructor(
    private http: HttpService,
    private gptService: GptService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    const req = {
      token: this.token
    }
    this.http.getUserByTokenApi(req).subscribe((res: any) => {
      this.user = res.user;
    })
  }
  getData() {
    const req = {
      token: this.token,
      date: this.selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    }
    console.log(req);

    this.http.getReportByDateApi(req).subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (err: any) => {
        console.log('API回應', err);
      }
    })
  }

}
