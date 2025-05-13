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

  report!: any;
  visible: boolean = false;


  constructor(
    private http: HttpService,
    private dialogService: DialogService,
    private gptService: GptService
  ) { }

  weekDays = [
    { label: '星期日', value: 1 },
    { label: '星期一', value: 2 },
    { label: '星期二', value: 3 },
    { label: '星期三', value: 4 },
    { label: '星期四', value: 5 },
    { label: '星期五', value: 6 },
    { label: '星期六', value: 0 }
  ];

  selectedDate!: Date;
  todayIndex = new Date().getDay(); // 取得今天是星期幾


  ngOnInit(): void {

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
  }

  generateReport() {
    const req = "";
    this.gptService.sendMessage(req);
  }
}
