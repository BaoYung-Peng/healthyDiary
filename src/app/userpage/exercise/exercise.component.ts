import { LocalstorageService } from './../../@services/localstorage.service';
import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Lenis from '@studio-freight/lenis'; // 引入平滑滾動函式庫
import { gsap } from 'gsap'; // 引入 GSAP 動畫庫
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../@services/http.service';
import { signal } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule } from '@angular/forms';

import { Message } from 'primeng/message';

// 定義時鐘數字結構
interface ClockNumber {
  value: number;
  angle: number;
}

// 定義運動記錄的接口
interface ExerciseRecord {
  exerciseId: string;
  email: string;
  exerciseName: string;
  sports_name?: string;
  duration: number;
  date: string;
}

interface ExerciseResponse {
  code: number;
  message: string;
  exerciselist: any[];
}

@Component({
  selector: 'app-exercise',
  imports: [
    FormsModule,
    CommonModule,
    CalendarModule,
    ReactiveFormsModule,
    Message
  ],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.scss'
})
export class ExerciseComponent implements AfterViewInit, OnInit {
  selectedCard: any = null;              // 儲存被選中的卡片
  activeType: string = '';               // 對應卡片的運動類型（light/aerobic/training）
  selectedImageName: string = '';        // 被選中的圖片名稱
  count = signal(0);  // 建立一個 Signal
  showMessage: boolean = false; // 提示訊息



  token: string | null = null;
  weekDays: Date[] = [];
  groupedRecords: { [date: string]: ExerciseRecord[] } = {};

  increment() {
    this.count.set(this.count() + 1);  // 更新值
  }

  constructor(
    private router: Router,
    private httpservice: HttpService,
    private zone: NgZone,
    private localStorageService: LocalstorageService
  ) {
    this.token = localStorage.getItem('token');
  }

  // 運動強度卡片資料
  cards = [
    {
      title: '輕度運動',
      description: '輕度：適合新手或恢復期的簡單活動。',
      note: '如伸展、瑜珈、輕鬆散步',
      backgroundImage: '/imgs/light.png'
    },
    {
      title: '有氧',
      description: '有氧：中等強度，助於提升心肺功能。',
      note: '如慢跑、有氧舞蹈、快走',
      backgroundImage: '/imgs/aerobic.png'
    },
    {
      title: '重訓',
      description: '重訓：高強度，增加肌肉與力量。',
      note: '如舉重、阻力訓練、自重訓練',
      backgroundImage: '/imgs/training.jpeg'
    }
  ];

  // 各類型運動圖片列表
  imageList = [
    {
      type: '輕度運動',
      data: [
        { name: '散步', src: '/imgs/Walk.jpeg' },
        { name: '瑜珈', src: '/imgs/Yoga.jpeg' },
        { name: '太極拳', src: '/imgs/TaiChi.jpeg' },
        { name: '皮拉提斯', src: '/imgs/Pilates.jpeg' },
        { name: '騎自行車', src: '/imgs/Bike.jpeg' },
      ],
    },
    {
      type: '有氧運動',
      data: [
        { name: '網球', src: '/imgs/Tennis.jpeg' },
        { name: '游泳', src: '/imgs/Swim.jpeg' },
        { name: '跳繩', src: '/imgs/Jump-rope.jpeg' },
        { name: '階梯有氧', src: '/imgs/Climb-stairs.jpeg' },
        { name: '划船', src: '/imgs/Rowing-machine.jpg' },
      ],
    },
    {
      type: '重訓',
      data: [
        { name: '深蹲', src: '/imgs/Squat.jpeg' },
        { name: '臥推', src: '/imgs/Bench-press.jpeg' },
        { name: '舉重', src: '/imgs/Weightlifting.jpeg' },
        { name: '引體向上', src: '/imgs/Pull-ups.jpeg' },
        { name: '伏地挺身', src: '/imgs/Push-up.jpeg' },
      ],
    },
  ];

  // 選擇卡片：處理點擊後動畫與資料更新
  selectCard(card: any, event: Event) {
    this.selectedCard = card;                          // 記錄選擇的卡片
    this.activeType = this.mapCardTitleToType(card.title);  // 根據卡片標題設定運動類型

    const clickedCard = event.currentTarget as HTMLElement;

    // 清除所有動畫與樣式
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(c => {
      gsap.killTweensOf(c);                // 停止正在進行的動畫
      gsap.set(c, {
        clearProps: "transform,opacity,backgroundColor" // 明確指定要清除的屬性
      });
    });

    // 移除其他卡片的 selected 樣式，再設定目前的為 selected
    allCards.forEach(c => c.classList.remove('selected'));
    clickedCard.classList.add('selected');

    // 2️⃣ 對點擊卡片進行一次性動畫（放大並改變背景顏色）
    gsap.to(clickedCard, {
      scale: 1.1,
      backgroundColor: "rgba(76, 166, 255, 0.3)",
      duration: 0.4,
      ease: 'power1.inOut',
      yoyo: true,   // 回彈（放大後再回來）
      repeat: 1     // 重複一次（即來回一趟）
    });
  }

  // 點選運動圖片，記錄名稱
  selectImage(item: { name: string; src: string }) {
    this.selectedImageName = item.name;
    // this.exercise_name = item.name; // ✅ 這行新增，選擇圖片時直接更新 exercise_name
    console.log('選到的圖片名稱：', this.selectedImageName);
  }

  // 元件載入後初始化動畫與滑動效果
  ngAfterViewInit(): void {
    // 初始化 Lenis 並明確設定選項
    const lenis = new Lenis({
      wrapper: document.body, // 或你的滾動容器
      content: document.documentElement,
      smoothWheel: true,
      // 其他選項...
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 🟩 卡片初次進場動畫
    gsap.from(".card", {
      y: 100,                    // 從下方進場
      opacity: 0,                // 透明度從 0 到 1
      rotation: -5,              // 帶有一點旋轉角度
      stagger: 0.2,              // 每張卡片間隔進場
      duration: 0.8,
      ease: "elastic.out(1, 0.5)", // 有彈性的進場效果
      delay: 0.5
    });

    // 滑鼠 hover 彈跳動畫
    const cards = document.querySelectorAll('.cards-container .card');
    cards.forEach((card) => {
      let pulseTween: gsap.core.Tween | null = null;

      // 滑鼠進入 → 不斷放大縮小
      card.addEventListener('mouseenter', () => {
        pulseTween = gsap.to(card, {
          scale: 1.05,
          duration: 0.6,
          ease: 'power1.inOut',
          repeat: -1,  // 無限次
          yoyo: true   // 回彈
        });
      });

      // 滑鼠離開 → 停止動畫並恢復原狀
      card.addEventListener('mouseleave', () => {
        pulseTween?.kill();
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: 'power1.out'
        });
      });
    });
  }

  // 將卡片標題轉換為對應的類型名稱
  private mapCardTitleToType(title: string): string {
    switch (title) {
      case '輕度運動': return '輕度運動';
      case '有氧': return '有氧運動';
      case '重訓': return '重訓';
      default: return '';
    }
  }

  //================== 時鐘與時間輸入邏輯 ==================//
  minutesInput = 0; // 使用者輸入的分鐘數
  frequency: number = 0;      // 重訓輸入的次數
  endTime: string = ''; // 顯示的結束時間
  isTimeSet: boolean = false; // 是否已設定時間
  date: Date | undefined;
  minDate: string = ''; // 設定日期輸入框的最小值
  maxDate: string = ''; // 設定日期輸入框的最大值
  today = new Date().toISOString().split('T')[0]; // 今日日期（字串）

  numbers: ClockNumber[] = []; // 時鐘上的數字與角度
  currentImage = 0;
  hourDeg = 0;
  minuteDeg = 0;
  secondDeg = 0
  startMinuteAngle: number | null = null;
  exercise_name: string = '';
  duration: number = 0;
  email: string = '';

  weightInput = 0; // 使用者輸入體重

  // 新增：計算結束時間的方法
  calculateEndTime(minutesToAdd: number): void {
    const now = new Date();
    const end = new Date(now.getTime() + minutesToAdd * 60000);

    // 轉換為台灣時間 (UTC+8)
    const utc = end.getTime() + (end.getTimezoneOffset() * 60000);
    const taiwanTime = new Date(utc + (3600000 * 8));

    // 格式化結束時間
    this.endTime = taiwanTime.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace('24:', '00:');
  }

  // 按下確認時間按鈕時觸發
  setStartMinutes() {
    this.calculateEndTime(this.minutesInput); // 保留計算結束時間
    this.isTimeSet = true;
  }

  // 初始化元件：設定日期限制與初始化時鐘
  ngOnInit() {
    const today = new Date();
    this.token = localStorage.getItem('token');
    this.fetchExerciseRecords(); // 載入資料

    // 計算本週的週一日期
    const dayOfWeek = today.getDay(); // 0 是星期天, 1 是星期一, ... 6 是星期六
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 若今天是星期天，要往前推6天
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    // 計算本週的週日日期
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // 計算從週一到週日的日期
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      this.weekDays.push(date);
    }

    // 2. 初始化時鐘
    this.numbers = Array.from({ length: 12 }, (_, i) => ({
      value: i === 0 ? 12 : i,
      angle: i * 30
    }));
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // 格式化成 input type="date" 需要的字串 'yyyy-MM-dd'
    this.maxDate = this.formatDate(today);

    // 初始化時鐘數字 (12在頂部)
    this.numbers = Array.from({ length: 12 }, (_, i) => ({
      value: i === 0 ? 12 : i,
      angle: i * 30
    }));

    // 更新時鐘
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  // 將 Date 轉換成 yyyy-MM-dd 格式
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 更新時鐘的角度
  updateClock() {
    const now = new Date();
    // 轉換為台灣時間 (UTC+8)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const taiwanTime = new Date(utc + (3600000 * 8));
    const hours = taiwanTime.getHours();
    const minutes = taiwanTime.getMinutes();
    const seconds = taiwanTime.getSeconds();

    // 計算指針角度
    this.hourDeg = (hours % 12) * 30 + (minutes / 60) * 30;
    this.minuteDeg = minutes * 6;
    this.secondDeg = seconds * 6;
  }

  // 使用者輸入分鐘時同步更新運動時間
  onMinutesChange(value: number) {
    this.minutesInput = value;
    this.duration = value;
  }

  //============================================================
  // 提交運動紀錄資料至後端 API
  confirm() {
    if (!this.token) {
      console.error('未找到 token，請重新登入');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.selectedImageName || !this.date) {
      alert('請選擇運動項目與日期');
      return;
    }
    if (this.activeType === '重訓') {
      if (!this.frequency || this.frequency <= 0) {
        alert('請輸入有效的訓練次數');
        return;
      }
    } else {
      if (!this.minutesInput || this.minutesInput <= 0) {
        alert('請輸入有效的分鐘數');
        return;
      }
    }

    const exerciseData = {
      token: this.token,
      exerciseName: this.selectedImageName,
      duration: this.minutesInput,
      date: this.date,
      frequency: this.frequency
    };

    console.log('送出資料：', exerciseData);

    this.httpservice.fillInExercise(exerciseData).subscribe({
      next: (res: any) => {
        console.log('API回應', res);
        if (res.code === 200) {
          this.showMessage = true;
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['userpage/exercise']);
          });
          setTimeout(() => {
            this.showMessage = false;
          }, 2000);
        }
      },
      error: (err: any) => {
        console.error('API錯誤', err);
      }
    });
  }

  confirmweight() {
    if (!this.token) {
      console.error('未找到 token，請重新登入');
      this.router.navigate(['/login']);
      return;
    }

    const weightData = {
      token: this.token,
      weight: this.weightInput
    };

    console.log('送出資料:', weightData);

    this.httpservice.updateWeight(weightData).subscribe({
      next: (res: any) => {
        console.log('API回應', res);
        if (res.code == 200) {
          this.showMessage = true;
        }
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    });
  }

  // next: (res) => {
  //   console.log('運動記錄成功', res);
  //   this.fetchExerciseRecords();
  //   alert("儲存成功")
  //   // this.router.navigate(['/userpage/report']);
  // },
  // error: (err) => {
  //   console.error('提交失敗:', err);
  //   if (err.status === 401) { // token 無效
  //     this.localStorageService.removeItem(); // 清除 token
  //     alert("提交失敗")
  //     // this.router.navigate(['/login']);
  //   }
  // }
  //   });
  // }

  fetchExerciseRecords() {
    if (!this.token) {
      console.error('未登入');
      return;
    }

    const postData = {
      token: this.token,
    };

    this.httpservice.getCalendarExercise(postData).subscribe({
      next: (res: any) => {
        this.exerciseRecords = res.exerciseList || []; // 如果 res.exerciselist 是 undefined，就設為 []
        console.log(res);
      },
      error: (err) => {
        console.error('獲取記錄失敗:', err);
        if (err.status === 401) {
          this.localStorageService.removeItem();
          // this.router.navigate(['/login']);
        }
      }
    });
  }

  // 取得本週一到週日的日期
  getCurrentWeekDays(): Date[] {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }
  exerciseRecords: any[] = [];

  // 根據單一天的 Date 物件取出該天所有紀錄
  getRecordsForDate(date: Date) {
    const formattedDate = date.toISOString().split('T')[0];
    return this.exerciseRecords.filter(record => record.date === formattedDate);



  }
}
