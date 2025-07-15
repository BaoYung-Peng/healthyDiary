import { Component, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';
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
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './mood-diary.component.html',
  styleUrls: ['./mood-diary.component.scss'],
  providers: [DatePipe]
})
export class MoodDiaryComponent implements AfterViewInit, OnInit {
  @ViewChild('leftPageRef', { static: false }) leftPageRef!: ElementRef;
  @ViewChild('rightPageRef', { static: false }) rightPageRef!: ElementRef;
  @ViewChild('weatherCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

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
  fireworksIntervalId: ReturnType<typeof setInterval> | null = null;

  daysInMonth: number = 0; // 新增，用來記錄當月天數

  // 在組件類中添加這些屬性和方法
  queryResults: any[] = [];
  // 在組件類中保持現有屬性，並添加以下內容
  queriedDates: number[] = [];
  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();

  // queriedDates: number[] = [];
  // currentMonth: number = new Date().getMonth() + 1;

  private ctx!: CanvasRenderingContext2D;
  private width!: number;
  private height!: number;
  private animationFrameId: number = 0;

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
      const monthParam = params.get('monthId');  // 改成 'monthId'
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
      this.currentMonth = +this.monthId;  // **加這行，確保畫面初始月份正確**
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
      console.log('✅ 完整回應:', res); // 先確認完整回應結構

      // 確保 moodlist 是陣列
      const moodlist = Array.isArray(res?.moodlist) ? res.moodlist : [];
      console.log('✅ moodlist:', moodlist);

      // 清空現有資料
      this.moodData = [];

      moodlist.forEach((entry: any) => {
        // 將資料存入 moodData
        const moodEntry: MoodEntry = {
          date: entry.date,
          userId: entry.userId,
          mood: entry.mood,
          diary: entry.diary
        };
        this.moodData.push(moodEntry);

        // 更新 pagesData
        const day = new Date(entry.date).getDate();
        console.log(`處理 ${entry.date}，日期: ${day}`);

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
      this.cdr.detectChanges(); // 手動觸發變更檢測
    }, (error) => {
      console.error('❌ 獲取資料失敗:', error);
      this.isLoading = false;
    });
  }

  private initializePagesData() {
    this.pagesData = [
      createPage('', '', false, PageType.Cover), // 封面內容現在在HTML中
      ...Array.from({ length: this.daysInMonth }, (_, i) =>
        createPage('', '', true, PageType.Day) // 日期內容現在在HTML中
      ),
      ...Array.from({ length: this.daysInMonth }, () =>
        createPage('', '', true, PageType.Day) // 日記內容現在在HTML中
      ),
      createPage('', '', true, PageType.BackCover) // 封底內容現在在HTML中
    ];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updatePages();
    });
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
    this.startAnimation();
  }

  // 新增這個方法來取得日記內容
  getDiaryContent(day: number): string {
    if (!this.moodData || this.moodData.length === 0) {
      return '尚未填寫';
    }

    // 確保日期格式一致
    const formattedDate = `${this.today.getFullYear()}-${this.monthId.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    const entry = this.moodData.find(item => {
      // 比對完整日期或僅比對日
      return item.date === formattedDate ||
        new Date(item.date).getDate() === day;
    });

    return entry?.diary || '尚未填寫';
  }

  // 修改 updatePages 方法，主要處理背面內容
  updatePages() {
    const rightPageEl = this.rightPageRef?.nativeElement;
    const leftPageEl = this.leftPageRef?.nativeElement;

    if (!rightPageEl || !leftPageEl) return;

    rightPageEl.classList.remove('cover', 'backCover');
    leftPageEl.classList.remove('cover', 'backCover');

    if (this.currentPageIndex === 0) {
      // 封面
      this.leftPageFront = '';
      this.rightPageBack = '';
    } else if (this.currentPageIndex <= this.daysInMonth) {
      const day = this.currentPageIndex;
      const leftPage = this.pagesData[day];
      const rightPage = this.pagesData[day + this.daysInMonth];

      this.leftPageFront = `${day} 日`;
      this.rightPageBack = rightPage.back;
    } else {
      // 封底
      this.leftPageFront = '';
      this.rightPageBack = '';
    }

    this.cdr.detectChanges();
  }

  async goToNextPage() {
    if (this.isAnimating) return;
    if (this.currentPageIndex >= this.daysInMonth + 1) return;
    this.currentPageIndex++;
    this.startAnimation(); // 翻頁後重啟動畫


    this.isAnimating = true;

    const rightPageEl = this.rightPageRef.nativeElement;

    // 右頁翻到左側 (Y軸旋轉180度)
    await gsap.to(rightPageEl, {
      duration: 0.6,
      rotationY: -180,
      ease: 'power2.inOut'
    });


    this.updatePages();

    // 立刻把右頁角度重置為0，下一頁顯示正常
    gsap.set(rightPageEl, { rotationY: 0 });

    this.isAnimating = false;
  }

  async goToPrevPage() {
    if (this.isAnimating) return;
    if (this.currentPageIndex <= 0) return;
    this.currentPageIndex--;
    this.startAnimation(); // 翻頁後重啟動畫


    this.isAnimating = true;

    const rightPageEl = this.rightPageRef.nativeElement;

    // 右頁從背面旋轉回正面 (Y軸旋轉回0度)
    await gsap.fromTo(rightPageEl,
      { rotationY: -180 },
      { rotationY: 0, duration: 0.6, ease: 'power2.inOut' }
    );

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

  getMoodScore(dayIndex: number): number | null {
    if (dayIndex <= 0 || dayIndex > this.daysInMonth) return null;

    // 先取得當天的日期字串 YYYY-MM-DD
    const dayStr = dayIndex.toString().padStart(2, '0');
    const targetDate = `${this.today.getFullYear()}-${this.monthId.padStart(2, '0')}-${dayStr}`;

    // 從 moodData 找日期相符的項目
    const entry = this.moodData.find(item => item.date === targetDate);

    if (entry) {
      return entry.mood;
    }

    return null; // 找不到
  }


  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = this.width;
    canvas.height = this.height;
  }

  private particles: any[] = [];

  // 動畫邏輯主控
  startAnimation() {
    const score = this.getMoodScore(this.currentPageIndex);
    this.stopAnimations();

    if (score === null || this.currentPageIndex === 0 || this.currentPageIndex > this.daysInMonth) {
      return;
    }

    if (score === 1) {
      this.snowAnimation();
    } else if (score >= 2 && score <= 4) {
      this.rainAnimation();
    } else if (score >= 5 && score <= 7) {
      this.sunAnimation();
    } else if (score > 7 && score <= 10) {
      this.fireworksAnimation();
    } else {
      this.clearCanvas();
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // 雪花動畫
  snowAnimation() {
    this.particles = [];
    // 初始化雪花粒子
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3 + 1,
        speedY: Math.random() * 1 + 0.5,
        speedX: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.5
      });
    }

    const drawSnow = () => {
      // 畫背景色（青藍色）
      this.ctx.fillStyle = '#1E3F66'; // 青藍色，可以自由換成你喜歡的
      this.ctx.fillRect(0, 0, this.width, this.height);

      // 畫雪花
      this.ctx.fillStyle = 'white';
      this.particles.forEach(p => {
        this.ctx.globalAlpha = p.opacity;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y > this.height) p.y = 0;
        if (p.x > this.width) p.x = 0;
        if (p.x < 0) p.x = this.width;
      });
      this.ctx.globalAlpha = 1;
      this.animationFrameId = requestAnimationFrame(drawSnow);
    };
    drawSnow();
  }

  // 下雨動畫
  rainAnimation() {
    this.particles = [];
    for (let i = 0; i < 200; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        length: Math.random() * 20 + 10,
        speedY: Math.random() * 4 + 4,
        opacity: Math.random() * 0.5 + 0.5
      });
    }
    const drawRain = () => {
      // 背景色
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // 雨滴
      this.ctx.strokeStyle = 'rgba(174,194,224,0.5)';
      this.ctx.lineWidth = 1;
      this.particles.forEach(p => {
        this.ctx.globalAlpha = p.opacity;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x, p.y + p.length);
        this.ctx.stroke();

        p.y += p.speedY;
        if (p.y > this.height) p.y = 0;
      });
      this.ctx.globalAlpha = 1;

      this.animationFrameId = requestAnimationFrame(drawRain);
    }
    drawRain();
  }

  // 晴天動畫
  sunAnimation() {
    gsap.killTweensOf(this);
    this.clearCanvas();
    const pulse = { alpha: 0.7 };

    gsap.to(pulse, {
      alpha: 1,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      onUpdate: () => {
        // 背景
        this.ctx.fillStyle = '#CDFCF6'; // 淡青藍背景
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 放射光線效果（右上到中心）
        const gradient = this.ctx.createRadialGradient(
          this.width, 0, 100, // 光源中心
          this.width / 2, this.height / 2, this.width / 1.5 // 擴散半徑
        );
        gradient.addColorStop(0, `rgba(255, 255, 153, ${pulse.alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 153, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 太陽本體（右上）
        const sunX = this.width - 100;
        const sunY = 100;
        const sunRadius = 40;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 223, 0, ${pulse.alpha})`; // 黃色太陽
        this.ctx.fill();
      }
    });
  }

  // 煙火動畫
  fireworksAnimation() {
    this.clearCanvas();
    this.particles = [];

    const colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C'];

    // 每次呼叫會放一個煙火
    const launchFirework = () => {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height * 0.5; // 上半部
      const color = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;

        this.particles.push({
          x,
          y,
          radius: Math.random() * 2 + 1,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          life: 100,
          color,
        });
      }
    };

    this.fireworksIntervalId = setInterval(() => {
      launchFirework();
    }, 800);

    const drawFireworks = () => {
      // 使用透明黑畫布當夜空背景 + 拖尾效果
      this.ctx.fillStyle = 'rgba(0, 0, 30, 0.2)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.particles.forEach((p, i) => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 1;

        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      });

      this.animationFrameId = requestAnimationFrame(drawFireworks);
    };

    drawFireworks();
  }

  stopAnimations() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
    if (this.fireworksIntervalId !== null) {
      clearInterval(this.fireworksIntervalId);
      this.fireworksIntervalId = null;
    }
    gsap.killTweensOf(this);
    this.particles = [];
    this.clearCanvas();
  }

  // 新增方法：查詢整個月份日期
  queryEntireMonth(): void {
    const year = this.currentYear;
    const month = this.currentMonth - 1; // JavaScript月份是0-11

    // 獲取該月天數
    this.daysInMonth = new Date(year, month + 1, 0).getDate();

    // 生成1到天數的陣列
    this.queriedDates = Array.from({ length: this.daysInMonth }, (_, i) => i + 1);
  }

  queryDates(offset: number): void {
    this.queriedDates = [];

    const step = offset > 0 ? 1 : -1;
    for (let i = 1; i <= Math.abs(offset); i++) {
      const day = this.currentPageIndex + i * step;
      if (day >= 1 && day <= this.daysInMonth) {
        this.queriedDates.push(day);
      }
    }

    // 若是往前查詢，讓日期正序顯示
    if (offset < 0) {
      this.queriedDates.reverse();
    }
  }

  goToPage(targetDay: number): void {
    if (targetDay < 1 || targetDay > this.daysInMonth) return;

    this.currentPageIndex = targetDay;

    // 確保月份變數是正確的
    this.currentMonth = this.monthId ? +this.monthId : new Date().getMonth() + 1;

    // 立即更新頁面內容（文字、日記）
    this.updatePages();

    // 啟動對應的動畫（根據當天的 mood score）
    this.startAnimation();
  }


  getMoodImagePath(score: number): string {
    if (score === 1) {
      return 'imgs/snow.jpeg';
    } else if (score >= 2 && score <= 4) {
      return 'imgs/rainny.jpeg';
    } else if (score >= 5 && score <= 7) {
      return 'imgs/sunny.jpeg';
    } else {
      return 'imgs/firework.jpeg';
    }
  }
}

