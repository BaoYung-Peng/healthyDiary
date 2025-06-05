// bookcase.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpService } from '../@services/http.service';

@Component({
  selector: 'app-bookcase',
  imports: [
    FormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './bookcase.component.html',
  styleUrl: './bookcase.component.scss',
  providers: [DatePipe]
})
export class BookcaseComponent implements OnInit {
  // 請求狀態
  isLoading: boolean = false;
  currentMonth: number = new Date().getMonth() + 1;


  // 預設月份與顏色
  months = [
    { id: 1, name: '一月', color: '#727D73' },
    { id: 2, name: '二月', color: '#727D73' },
    { id: 3, name: '三月', color: '#727D73' },
    { id: 4, name: '四月', color: '#727D73' },
    { id: 5, name: '五月', color: '#727D73' },
    { id: 6, name: '六月', color: '#727D73' },
    { id: 7, name: '七月', color: '#727D73' },
    { id: 8, name: '八月', color: '#727D73' },
    { id: 9, name: '九月', color: '#727D73' },
    { id: 10, name: '十月', color: '#727D73' },
    { id: 11, name: '十一月', color: '#727D73' },
    { id: 12, name: '十二月', color: '#727D73' }
  ];

  constructor(
    private router: Router,
    private httpService: HttpService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.createPetals(30); // 可調整數量
  }

  createPetals(count: number) {
    const container = document.getElementById('petalContainer');
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.classList.add('petal');

      // 隨機位置與延遲
      petal.style.left = `${Math.random() * 100}vw`;
      petal.style.animationDelay = `${Math.random() * 10}s`;

      container.appendChild(petal);
    }
  }

  onBookClick(monthId: number): void {
    console.log('clicked month:', monthId);
    const currentMonth = new Date().getMonth() +1; // getMonth() 回傳 0-11，所以加 1

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
      month: monthId
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


  wirte() {
    this.router.navigate(['/writemood']);
  }



}
