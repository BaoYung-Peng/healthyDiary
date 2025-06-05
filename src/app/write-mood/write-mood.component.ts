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

  moodOptions = [
    { value: 1, emoji: '😭', label: '非常沮喪' },
    { value: 2, emoji: '😢', label: '沮喪' },
    { value: 3, emoji: '😔', label: '難過' },
    { value: 4, emoji: '😐', label: '普通偏差' },
    { value: 5, emoji: '🙂', label: '普通' },
    { value: 6, emoji: '😊', label: '平靜愉快' },
    { value: 7, emoji: '😄', label: '開心' },
    { value: 8, emoji: '😁', label: '非常開心' },
    { value: 9, emoji: '🤩', label: '興奮' },
    { value: 10, emoji: '🌟', label: '超棒！' }
  ];

  ngOnInit(): void {
    this.setMaxDate();
    this.setDefaultDate(); // 設定預設日期為今天
  }

  getMoodLabel(): string {
    const mood = this.moodOptions.find(m => m.value === this.currentMoodScore);
    return mood ? mood.label : '';
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
