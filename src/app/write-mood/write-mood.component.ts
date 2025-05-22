import { Component } from '@angular/core';
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
  inputData: string = ''; // ✅ 預設空字串
  currentMoodScore: number = 5; // ✅ 預設分數中間值
  queryDate: string = ''; // ✅ 可預設為今天的日期（可加）

  submitSuccess = false;
  submitError = false;

  constructor(private httpService: HttpService, private router: Router) { }

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
        console.log('✅ 完整回應:', res);
        this.submitSuccess = true;
        this.submitError = false;
      },
      error: (err) => {
        console.error('❌ 發送失敗:', err);
        this.submitSuccess = false;
        this.submitError = true;
      }
    });
  }

  back() {
    this.router.navigate(['/bookcase']);
  }
}



