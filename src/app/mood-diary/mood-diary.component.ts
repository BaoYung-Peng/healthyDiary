import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../@services/http.service';
import { CommonModule, DatePipe } from '@angular/common';
import gsap from 'gsap';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

interface MoodEntry {
  date: string;
  userId: number;
  mood: number;
  diary: string;
}

enum PageType {
  Cover = 'cover',
  Day = 'day',
  BackCover = 'backCover'
}

interface Page {
  front: string;
  back: string;
  disabled: boolean;
  type: PageType;
}

function createPage(front: string, back: string, disabled: boolean, type: PageType): Page {
  return { front, back, disabled, type };
}

@Component({
  selector: 'app-mood-diary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-diary.component.html',
  styleUrls: ['./mood-diary.component.scss'],
  providers: [DatePipe]
})
export class MoodDiaryComponent implements AfterViewInit {
  @ViewChild('leftPageRef', { static: false }) leftPageRef!: ElementRef;
  @ViewChild('rightPageRef', { static: false }) rightPageRef!: ElementRef;

  leftPageFront: string = '';
  leftPageBack: string = '';
  rightPageFront: string = '';
  rightPageBack: string = '';

  today: Date = new Date();
  monthId: string = '';
  monthName: string = '';
  moodData: MoodEntry[] = [];
  token: string = '';
  pagesData: Page[] = [];
  isLoading: boolean = true;

  currentPageIndex = 0; // 指向右頁Page索引
  isAnimating = false;

  daysInMonth: number = 0; // 新增，用來記錄當月天數

  constructor(
    private router: Router,
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.monthId = navigation.extras.state['month'];
      this.moodData = navigation.extras.state['moodData'] || [];
      this.monthName = this.getMonthName(this.monthId);
    } else {
      this.router.navigate(['/bookcase']);
    }
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const monthParam = params.get('month');
      if (monthParam) {
        this.monthId = monthParam;
      } else {
        // fallback 用 state
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
          this.monthId = navigation.extras.state['month'] || (new Date().getMonth() + 1).toString();
        } else {
          this.monthId = (new Date().getMonth() + 1).toString();
        }
      }
      console.log('Current monthId:', this.monthId);

      this.monthName = this.getMonthName(this.monthId);
      this.today = new Date(new Date().getFullYear(), +this.monthId - 1, 1);
      const year = this.today.getFullYear();
      const month = this.today.getMonth() + 1;
      this.daysInMonth = new Date(year, month, 0).getDate();

      this.initializePagesData();
      this.token = localStorage.getItem('token') || '';

      this.loadMoodList(this.monthId);
    });
  }

  loadMoodList(month: string): void {
    console.log('🔵 傳送月份給後端：', this.monthId);
    this.httpService.getMonthMood({
      token: this.token,
      month: month
    }).subscribe((res: any) => {
      const moodlist = Array.isArray(res.moodlist) ? res.moodlist : [];
      console.log('✅ moodlist from server:', res.moodlist);

      moodlist.forEach((entry: any) => {
        const day = new Date(entry.date).getDate();

        const leftPageIndex = 1 + (day - 1);
        const rightPageIndex = 1 + this.daysInMonth + (day - 1);

        if (this.pagesData[leftPageIndex]) {
          this.pagesData[leftPageIndex].disabled = false;
        }
        if (this.pagesData[rightPageIndex]) {
          this.pagesData[rightPageIndex].front = entry.diary || '尚未填寫';
          this.pagesData[rightPageIndex].disabled = false;
        }
      });

      this.isLoading = false;
      this.updatePages();
      this.cdr.detectChanges();
    });
  }

  private initializePagesData() {
    this.pagesData = [
      createPage('心情日記本', `月份：${this.monthName}`, false, PageType.Cover),
      ...Array.from({ length: this.daysInMonth }, (_, i) =>
        createPage(`${i + 1} 號`, '', true, PageType.Day)
      ),
      ...Array.from({ length: this.daysInMonth }, () =>
        createPage('尚未填寫', '', true, PageType.Day)
      ),
      createPage('封底', '', true, PageType.BackCover)
    ];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updatePages();
    });
  }

  updatePages() {
    // 用class控制右頁尺寸
    const rightPageEl = this.rightPageRef?.nativeElement;
    const leftPageEl = this.leftPageRef?.nativeElement;

    if (!rightPageEl || !leftPageEl) return;

    // 清除所有封面封底class
    rightPageEl.classList.remove('cover', 'backCover');
    leftPageEl.classList.remove('cover', 'backCover');

    if (this.currentPageIndex === 0) {
      // 封面頁
      this.leftPageFront = '';
      this.leftPageBack = '';
      this.rightPageFront = this.pagesData[0].front;
      this.rightPageBack = this.pagesData[0].back;

      rightPageEl.classList.add('cover');
    } else if (this.currentPageIndex >= 1 && this.currentPageIndex <= this.daysInMonth) {
      // 日期頁
      const leftPage = this.pagesData[this.currentPageIndex];
      const rightPage = this.pagesData[this.currentPageIndex + this.daysInMonth];

      this.leftPageFront = leftPage.front;
      this.leftPageBack = leftPage.back;

      this.rightPageFront = rightPage.front;
      this.rightPageBack = rightPage.back;
    } else if (this.currentPageIndex === this.daysInMonth + 1) {
      // 封底
      const leftPage = this.pagesData[this.daysInMonth];
      const rightPage = this.pagesData[this.pagesData.length - 1];

      this.leftPageFront = leftPage.front;
      this.leftPageBack = leftPage.back;

      this.rightPageFront = rightPage.front;
      this.rightPageBack = rightPage.back;

      rightPageEl.classList.add('backCover');
      leftPageEl.classList.add('backCover');
    } else {
      this.leftPageFront = '';
      this.leftPageBack = '';
      this.rightPageFront = '';
      this.rightPageBack = '';
    }
  }

  async goToNextPage() {
    if (this.isAnimating) return;
    if (this.currentPageIndex >= this.daysInMonth + 1) return;

    this.isAnimating = true;

    const rightPageEl = this.rightPageRef.nativeElement;

    // 右頁翻到左側 (Y軸旋轉180度)
    await gsap.to(rightPageEl, {
      duration: 0.6,
      rotationY: -180,
      ease: 'power2.inOut'
    });

    this.currentPageIndex++;
    this.updatePages();

    // 立刻把右頁角度重置為0，下一頁顯示正常
    gsap.set(rightPageEl, { rotationY: 0 });

    this.isAnimating = false;
  }

  async goToPrevPage() {
    if (this.isAnimating) return;
    if (this.currentPageIndex <= 0) return;

    this.isAnimating = true;

    const rightPageEl = this.rightPageRef.nativeElement;

    // 右頁從背面旋轉回正面 (Y軸旋轉回0度)
    await gsap.fromTo(rightPageEl,
      { rotationY: -180 },
      { rotationY: 0, duration: 0.6, ease: 'power2.inOut' }
    );

    this.currentPageIndex--;
    this.updatePages();

    this.isAnimating = false;
  }
  goBack(): void {
    this.router.navigate(['/bookcase']);
  }

  private getMonthName(monthStr: string): string {
    const month = parseInt(monthStr, 10);
    const months = ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months[month - 1] || '';
  }
}
