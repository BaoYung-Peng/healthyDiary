import { LocalstorageService } from './../../@services/localstorage.service';
import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Lenis from '@studio-freight/lenis'; // 引入平滑滾動函式庫
import { gsap } from 'gsap'; // 引入 GSAP 動畫庫
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../@services/http.service';
import { signal } from '@angular/core';

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
  date: string; // 格式: YYYY-MM-DD
  completed: boolean; // 新增完成狀態
  xpEarned: boolean; // 是否已獲得經驗值
}

interface XpSystem {
  totalXp: number;
  currentLevel: number;
  expToNextLevel: number;
  dailyProgress: number;
  weeklyProgress: number;
}

@Component({
  selector: 'app-exercise',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.scss'
})
export class ExerciseComponent implements AfterViewInit, OnInit {
  selectedCard: any = null;              // 儲存被選中的卡片
  activeType: string = '';               // 對應卡片的運動類型（light/aerobic/training）
  selectedImageName: string = '';        // 被選中的圖片名稱
  count = signal(0);  // 建立一個 Signal
  // 新增這部分定義
  lastSevenDaysWithRecords: {
    date: Date;
    records: ExerciseRecord[];
  }[] = [];

  increment() {
    this.count.set(this.count() + 1);  // 更新值
  }

  constructor(
    private router: Router,
    private httpservice: HttpService,
    private zone: NgZone,
  ) { }

  // 運動強度卡片資料
  cards = [
    {
      title: '輕度',
      description: '適合新手或恢復期的簡單活動。',
      note: '如伸展、瑜伽、輕鬆散步',
      backgroundImage: '/imgs/light.jpeg'
    },
    {
      title: '有氧',
      description: '中等強度，有助於提升心肺功能。',
      note: '如慢跑、有氧舞蹈、快走',
      backgroundImage: '/imgs/aerobic.jpg'
    },
    {
      title: '重訓',
      description: '高強度，增加肌肉與力量。',
      note: '如舉重、阻力訓練、自重訓練',
      backgroundImage: '/imgs/training.jpg'
    }
  ];

  // 各類型運動圖片列表
  imageList = [
    {
      type: 'light',
      data: [
        { name: '散步', src: '/imgs/Walk.jpeg' },
        { name: '瑜伽', src: '/imgs/Yoga.jpeg' },
        { name: '太極拳', src: '/imgs/TaiChi.jpeg' },
        { name: '皮拉提斯', src: '/imgs/Pilates.jpeg' },
        { name: '騎自行車', src: '/imgs/Bike.jpeg' },
      ],
    },
    {
      type: 'aerobic',
      data: [
        { name: '網球', src: '/imgs/Tennis.jpeg' },
        { name: '游泳', src: '/imgs/Swim.jpeg' },
        { name: '跳繩', src: '/imgs/Jump-rope.jpeg' },
        { name: '階梯有氧', src: '/imgs/Climb-stairs.jpeg' },
        { name: '划船機', src: '/imgs/Rowing-machine.jpeg' },
      ],
    },
    {
      type: 'training',
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
    // 啟用 Lenis 平滑滾動
    const lenis = new Lenis();
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
      case '輕度': return 'light';
      case '有氧': return 'aerobic';
      case '重訓': return 'training';
      default: return '';
    }
  }

  //================== 時鐘與時間輸入邏輯 ==================//
  minutesInput = 0; // 使用者輸入的分鐘數
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

    // 計算前7天的日期
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.minDate = this.formatDate(sevenDaysAgo);
    this.maxDate = this.formatDate(today);

    // 2. 初始化時鐘
    this.numbers = Array.from({ length: 12 }, (_, i) => ({
      value: i === 0 ? 12 : i,
      angle: i * 30
    }));
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // 3. 載入數據
    this.loadXpData(); // 從本地儲存載入經驗值
    this.loadExerciseData(); // 現在這個方法已正確定義

    // 格式化成 input type="date" 需要的字串 'yyyy-MM-dd'
    this.minDate = this.formatDate(sevenDaysAgo);
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
    const exerciseData = {
      email: "Baoyungpeng1999@gmail.com",
      exerciseName: this.selectedImageName, // 使用選中的圖片名稱
      duration: this.duration,
      date: this.date
    }
    console.log(exerciseData);

    this.httpservice.fillInExercise(exerciseData).subscribe((res: any) => {
      console.log(res);
      // 新增記錄後重新獲取數據
      this.fetchExerciseRecords();
      // this.router.navigate(['/userpage']); // 明確指定路徑
    });
  }

  // 儲存從後端獲取的運動記錄
  exerciseRecords: ExerciseRecord[] = [];

  // 按日期分組的運動記錄
  groupedRecords: { [date: string]: ExerciseRecord[] } = {};

  // 從後端獲取運動記錄
  fetchExerciseRecords() {
    const calendarexercise = {
      email: "Baoyungpeng1999@gmail.com", // 使用與提交相同的email
    }
    console.log(calendarexercise);
    this.httpservice.getCalendarExercise(calendarexercise).subscribe((res: any) => {
      console.log(res);

      // 檢查回傳是否是陣列，不是就包成陣列
      if (Array.isArray(res)) {
        this.exerciseRecords = res;
      } else {
        this.exerciseRecords = [res]; // <-- 包成陣列以便 forEach 不報錯
      }

      this.groupRecordsByDate();
    });
  }

  // 按日期分組運動記錄
  groupRecordsByDate() {
    this.groupedRecords = {};

    this.exerciseRecords.forEach(record => {
      // Try to parse the date string into a Date object
      const dateObj = new Date(record.date);

      // Check if the date is valid
      if (!isNaN(dateObj.getTime())) {
        // Format the date as 'YYYY-MM-DD'
        const dateStr = dateObj.toISOString().split('T')[0];

        if (!this.groupedRecords[dateStr]) {
          this.groupedRecords[dateStr] = [];
        }

        this.groupedRecords[dateStr].push(record);
      } else {
        console.warn('Invalid date in record:', record);
      }
    });
  }

  // 獲取指定日期的運動記錄
  getRecordsForDate(date: Date): ExerciseRecord[] {
    const dateStr = this.formatDate(date);
    return this.groupedRecords[dateStr] || [];
  }

  // 獲取最近7天的日期數組
  getLastSevenDays(): Date[] {
    const days: Date[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }

    return days;
  }

  //===============================================================
  // 經驗值系統狀態
  xpSystem: XpSystem = {
    totalXp: 0,
    currentLevel: 1,
    expToNextLevel: 100, // 第一級需要100XP
    dailyProgress: 0,
    weeklyProgress: 0
  };

  // 完成運動任務
  completeExercise(record: ExerciseRecord) {
    record.completed = !record.completed;

    if (record.completed && !record.xpEarned) {
      this.addXp(10); // 完成任務獲得10XP
      record.xpEarned = true;
    } else if (!record.completed && record.xpEarned) {
      this.addXp(-10); // 取消完成扣除10XP
      record.xpEarned = false;
    }

    this.updateProgress();
    this.saveXpData();
  }

  // 新增經驗值
  private addXp(amount: number) {
    this.xpSystem.totalXp += amount;

    // 升級邏輯
    while (this.xpSystem.totalXp >= this.xpSystem.expToNextLevel && this.xpSystem.totalXp > 0) {
      this.xpSystem.currentLevel++;
      this.xpSystem.totalXp -= this.xpSystem.expToNextLevel;
      this.xpSystem.expToNextLevel = Math.floor(this.xpSystem.expToNextLevel * 1.2);
    }

    // 防止降級到0級以下
    if (this.xpSystem.totalXp < 0) {
      this.xpSystem.totalXp = 0;
    }
  }

  // 更新進度
  private updateProgress() {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = this.getWeekStartDate();

    const dailyRecords = this.exerciseRecords.filter(r =>
      r.date === today
    );

    const weeklyRecords = this.exerciseRecords.filter(r =>
      new Date(r.date) >= weekStart
    );

    this.xpSystem.dailyProgress = dailyRecords.length > 0
      ? (dailyRecords.filter(r => r.completed).length / dailyRecords.length) * 100
      : 0;

    this.xpSystem.weeklyProgress = weeklyRecords.length > 0
      ? (weeklyRecords.filter(r => r.completed).length / weeklyRecords.length) * 100
      : 0;
  }

  // 獲取本週開始日期 (週日)
  private getWeekStartDate(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  }

  // 本地儲存經驗值
  private saveXpData() {
    localStorage.setItem('xpSystem', JSON.stringify(this.xpSystem));
  }

  // 載入經驗值
  private loadXpData() {
    const data = localStorage.getItem('xpSystem');
    if (data) {
      this.xpSystem = JSON.parse(data);
    }
  }

  private loadExerciseData() {
    const email = "Baoyungpeng1999@gmail.com"; // 從登入用戶獲取實際email
    const calendarexercise = { email };

    this.httpservice.getCalendarExercise(calendarexercise).subscribe({
      next: (response: any) => {
        // 檢查回傳資料格式
        if (response && Array.isArray(response.exerciselist)) {
          // 提取 'exerciselist' 陣列
          const typedRecords = response.exerciselist as ExerciseRecord[];
          this.exerciseRecords = typedRecords;
          this.prepareLastSevenDays();
          this.updateProgress();
          console.log('運動記錄載入完成', typedRecords);
        } else {
          console.error('返回資料格式錯誤，預期包含 exerciselist 陣列:', response);
        }
      },
      error: (err) => {
        console.error('載入運動記錄失敗:', err);
        alert('載入運動記錄失敗，請稍後再試');
      }
    });
  }
  private prepareLastSevenDays() {
    const today = new Date();

    this.lastSevenDaysWithRecords = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = this.formatDate(date);

      const recordsForDate = this.exerciseRecords.filter(record =>
        record.date.startsWith(dateStr)
      );

      // 這裡修改為使用 exerciseId 來檢查是否有重複
      const ids = recordsForDate.map(r => r.exerciseId);
      const idSet = new Set(ids);
      if (ids.length !== idSet.size) {
        console.warn(`⚠️ Duplicate record.exerciseId found for ${dateStr}`, ids);
      }

      this.lastSevenDaysWithRecords.push({
        date: date,
        records: recordsForDate
      });
    }
  }

}
