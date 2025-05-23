import { Component, OnInit } from '@angular/core';
import { HttpService } from '../@services/http.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-write-mood',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './write-mood.component.html',
  styleUrl: './write-mood.component.scss'
})
export class WriteMoodComponent {
  inputData: string = '';
  currentMoodScore: number = 5;
  queryDate: string = '';
  maxDate: string = ''; // 新增這個屬性

  submitSuccess = false;
  submitError = false;

  constructor(private httpService: HttpService, private router: Router) { }

  ngOnInit(): void {
    this.setMaxDate();
    this.setDefaultDate(); // 設定預設日期為今天
  }

  // 設定最大可選日期為今天
  private setMaxDate() {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  // 設定預設日期為今天
  private setDefaultDate() {
    const today = new Date();
    this.queryDate = today.toISOString().split('T')[0];
  }

  submitInputData() {
    if (!this.inputData || !this.queryDate || !this.currentMoodScore) {
      alert('請完整填寫心情分數、日期與日記內容');
      return;
    }

    const token = localStorage.getItem('token');
    const moodData = {
      mood: this.currentMoodScore,
      date: this.queryDate,
      token,
      diary: this.inputData
    };

    this.httpService.fillInMood(moodData).subscribe({
      next: (res) => {
        console.log('提交成功:', res);
        this.submitSuccess = true;
        this.submitError = false;

        // 3秒後自動跳轉
        setTimeout(() => {
          this.router.navigate(['/bookcase']);
        }, 3000);
      },
      error: (err) => {
        console.error('提交失敗:', err);
        this.submitSuccess = false;
        this.submitError = true;
      }
    });
  }

  back() {
    this.router.navigate(['/bookcase']);
  }
}
