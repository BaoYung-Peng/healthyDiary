import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../@services/http.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-mood-diary',
  imports: [
    CommonModule
  ],
  templateUrl: './mood-diary.component.html',
  styleUrl: './mood-diary.component.scss'
})
export class MoodDiaryComponent {
  month: string = ''; // 例如 '02' (二月)
  mood: number = 0;   // 默認值 0，根據需求設定
  diary: string = ''; // 默認空字符串
  isLoading: boolean = true;
  moodData: any[] = []; // 默認空數組
  monthName: string = ''; // 默認空字符串

  constructor(
    private router: Router,
    private httpService: HttpService,
    private datepipe: DatePipe
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.month = navigation.extras.state['month'];
      this.moodData = navigation.extras.state['moodData'] || [];
      this.monthName = this.getMonthName(this.month);

      if (!this.moodData || this.moodData.length === 0) {
        this.fetchMoodData();
      } else {
        this.isLoading = false;
      }
    } else {
      this.router.navigate(['/bookcase']);
    }
  }

  private getMonthName(monthStr: string): string {
    const month = parseInt(monthStr, 10);
    const months = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return months[month - 1] || '';
  }

  private fetchMoodData(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入');
      this.router.navigate(['/login']);
      return;
    }

    const formattedMonth = this.formatMonth(this.month); // 格式化月份為 yyyyMM 格式

    const postData = {
      token: token,
      month: formattedMonth,   // 例如 '202302'
      mood: this.mood,         // 假設有 mood
      diary: this.diary,       // 假設有 diary
      date: this.datepipe.transform(new Date(), 'yyyy-MM-dd') // 使用當前日期
    };

    // 呼叫 httpService，並訂閱回應
    this.httpService.getMonthMood(postData).subscribe((res: any) => {
      console.log(res);
    });
  }

  // 格式化月份為 'yyyyMM' 格式
  private formatMonth(month: string): string {
    const year = new Date().getFullYear();  // 假設使用當前年
    return `${year}${month.padStart(2, '0')}`;  // 確保是兩位數，例: '02' -> '202302'
  }

  goBack(): void {
    this.router.navigate(['/bookcase']);
  }
}
