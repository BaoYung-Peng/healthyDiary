import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// 匯入 Lenis 平滑滾動函式庫
import Lenis from '@studio-freight/lenis';
// 匯入 GSAP 與滾動觸發插件
import { gsap } from 'gsap';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../@services/http.service';

interface ClockNumber {
  value: number;
  angle: number;
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
  cards = [
    {
      title: '輕度',
      description: '散步',
      note: '灰色透明背景',
      // route: '/light',
      backgroundImage: '/cat.png',
      command: () => {
        this.router.navigateByUrl('/light')
      }
    },
    {
      title: '有氧',
      description: '跑步',
      note: '灰色透明背景',
      route: '/aerobic',
      backgroundImage: '/running.png'
    },
    {
      title: '重訓',
      description: '健身房',
      note: '灰色透明背景',
      route: '/training',
      backgroundImage: '/123.png'
    }
  ];

  selectedCard: any = null; // 現在選取的是哪一張

  constructor(private router: Router, private httpservice: HttpService) { }

  selectCard(card: any) {
    this.selectedCard = card;
    // 點擊動畫：脈衝效果 + 背景閃爍
    gsap.to(".card.selected", {
      scale: 1.1,
      backgroundColor: "rgba(76, 166, 255, 0.3)",
      duration: 0.2,
      yoyo: true, // 來回播放
      repeat: 1,  // 重複一次（共兩次動畫）
      onComplete: () => {
        this.router.navigateByUrl(card.route);
      }
    });
  }

  ngAfterViewInit() {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 初始進場動畫
    gsap.from(".card", {
      y: 100,
      opacity: 0,
      rotation: -5, // 初始傾斜
      stagger: 0.2,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)", // 彈性效果
      delay: 0.5
    });

    // hover 放大縮小動畫
    const cards = document.querySelectorAll('.cards-container .card');

    cards.forEach((card) => {
      let pulseTween: gsap.core.Tween | null = null;

      card.addEventListener('mouseenter', () => {
        // 啟動脈衝動畫
        pulseTween = gsap.to(card, {
          scale: 1.05,
          duration: 0.6,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true
        });
      });

      card.addEventListener('mouseleave', () => {
        // 停止脈衝動畫並恢復原狀
        pulseTween?.kill();
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: 'power1.out'
        });
      });
    });
  }

  minutesInput = 0; // 綁定到輸入框
  endTime: string = ''; // 結束時間顯示
  isTimeSet: boolean = false; // 標記是否已設置時間
  date: Date | undefined;
  minDate: string = '';
  maxDate: string = '';
  today = new Date().toISOString().split('T')[0];

  images = [
    '/cat.png',  // 直接使用根路径，Angular 会从 public 文件夹查找
    '/running.png',
    '',
    '',
  ];

  numbers: ClockNumber[] = [];
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

    this.endTime = taiwanTime.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace('24:', '00:');
  }

  setStartMinutes() {
    this.calculateEndTime(this.minutesInput); // 保留計算結束時間
    this.isTimeSet = true;
  }

  ngOnInit() {
    const today = new Date();

    // 計算前7天的日期
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

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

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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

  prevImage() {
    this.currentImage = (this.currentImage - 1 + this.images.length) % this.images.length;
  }

  nextImage() {
    this.currentImage = (this.currentImage + 1) % this.images.length;
  }

  // 當分鐘數變化時同步 duration
  onMinutesChange(value: number) {
    this.minutesInput = value;
    this.duration = value;
  }

  confirm() {
    const exerciseData = {
      email: "FKU@gmail.com",
      exerciseName: this.exercise_name,
      duration: this.duration,
      date: this.date
    }
    console.log(exerciseData);

    this.httpservice.fillInExercise(exerciseData).subscribe((res: any) => {
      console.log(res);
      this.router.navigate(['/userpage']); // 明確指定路徑
    });

  }
}
