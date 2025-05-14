// bookcase.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from '../@services/http.service';

@Component({
  selector: 'app-bookcase',
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './bookcase.component.html',
  styleUrl: './bookcase.component.scss'
})
export class BookcaseComponent implements OnInit {
  // 請求狀態
  isLoading: boolean = false;

  // 預設月份與顏色
  months = [
    { id: 1, name: '一月', color: '#4a6ea9' },
    { id: 2, name: '二月', color: '#a94a6e' },
    { id: 3, name: '三月', color: '#6ea94a' },
    { id: 4, name: '四月', color: '#a96e4a' },
    { id: 5, name: '五月', color: '#4aa96e' },
    { id: 6, name: '六月', color: '#6e4aa9' },
    { id: 7, name: '七月', color: '#8e44ad' },
    { id: 8, name: '八月', color: '#3498db' },
    { id: 9, name: '九月', color: '#e74c3c' },
    { id: 10, name: '十月', color: '#2ecc71' },
    { id: 11, name: '十一月', color: '#f39c12' },
    { id: 12, name: '十二月', color: '#1abc9c' }
  ];

  constructor(
    private router: Router,
    private httpService: HttpService
  ) { }

  ngOnInit(): void {
    // 初始化可擴充
  }

  onBookClick(monthId: number): void {  // Change to number
    const selectedMonth = this.months.find(m => m.id === monthId);

    if (!selectedMonth) {
      console.error('無效的月份 ID:', monthId);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入以查看心情日記');
      this.router.navigate(['/login']);
      return;
    }

    const requestData = {
      token: token,
      month: monthId // This is now a number
    };

    this.isLoading = true;

    this.httpService.getMonthMood(requestData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('成功取得心情日記:', res);

        this.router.navigate(['/mood-diary', monthId], {
          state: {
            month: monthId,
            monthName: selectedMonth.name,
            moodData: res.data || [],
            success: true
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('取得心情日記失敗:', err);

        this.router.navigate(['/mood-diary', monthId], {
          state: {
            month: monthId,
            monthName: selectedMonth.name,
            moodData: null,
            error: err.message || '取得日記資料時發生錯誤'
          }
        });
      }
    });
  }
}
