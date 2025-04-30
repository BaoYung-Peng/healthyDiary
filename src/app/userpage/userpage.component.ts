import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBar } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';

interface ScheduleItem {
  date: Date;
  dayOfWeek: string;
  dayOfMonth: number;
  activities: Activity[];
}

interface Activity {
  time: string;
  title: string;
  type: 'workout' | 'meeting' | 'personal';
  completed?: boolean; // 添加 optional 的 completed 屬性
}


@Component({
  selector: 'app-userpage',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ProgressBar,
    ToastModule
  ],
  templateUrl: './userpage.component.html',
  styleUrl: './userpage.component.scss'
})
export class UserpageComponent {
 // 在組件中添加這些變量
 currentLevel = 1;
 totalXp = 0;
 xpToNextLevel = 100;

 dailyProgress = 0;
 completedTasksToday = 0;
 totalTasksToday = 0;

 weeklyProgress = 0;
 completedTasksThisWeek = 0;
 totalTasksThisWeek = 0;

 constructor(private ngZone: NgZone) { }

 // 在適當的地方調用這個方法（如初始化或任務完成時）
 updateXpSystem() {
   // 計算每日進度
   const todayActivities = this.scheduleDays().find(day => this.isToday(day.date))?.activities || [];
   this.completedTasksToday = todayActivities.filter(act => act.completed).length;
   this.totalTasksToday = todayActivities.length;
   this.dailyProgress = this.totalTasksToday > 0 ? (this.completedTasksToday / this.totalTasksToday) * 100 : 0;

   // 計算每周進度
   const weekActivities = this.getCurrentWeekActivities();
   this.completedTasksThisWeek = weekActivities.filter(act => act.completed).length;
   this.totalTasksThisWeek = weekActivities.length;
   this.weeklyProgress = this.totalTasksThisWeek > 0 ? (this.completedTasksThisWeek / this.totalTasksThisWeek) * 100 : 0;

   // 更新經驗值和等級
   this.updateLevel();
 }

 private getCurrentWeekActivities(): Activity[] {
   const today = new Date();
   const startOfWeek = new Date(today);
   startOfWeek.setDate(today.getDate() - today.getDay());

   return this.scheduleDays()
     .filter(day => {
       const dayDate = new Date(day.date);
       return dayDate >= startOfWeek && dayDate <= today;
     })
     .flatMap(day => day.activities);
 }

 private updateLevel() {
   this.totalXp += this.completedTasksToday * 10;
   while (this.totalXp >= this.xpToNextLevel) {
     this.currentLevel++;
     this.totalXp -= this.xpToNextLevel;
     this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.2);
   }
 }

 // 當任務完成時調用
 completeActivity(activity: Activity) {
   activity.completed = !activity.completed;
   this.updateXpSystem();
 }


 // 使用signal代替BehaviorSubject
 currentDate = signal(new Date());
 scheduleDays = signal<ScheduleItem[]>(this.generateScheduleDays());

 private generateScheduleDays(): ScheduleItem[] {
   const days: ScheduleItem[] = [];
   const today = new Date();

   for (let i = -3; i <= 3; i++) {
     const date = new Date(today);
     date.setDate(today.getDate() + i);

     days.push({
       date,
       dayOfWeek: this.getDayOfWeek(date),
       dayOfMonth: date.getDate(),
       activities: this.generateRandomActivities(date)
     });
   }

   return days;
 }

 private getDayOfWeek(date: Date): string {
   return ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
 }

 private generateRandomActivities(date: Date): Activity[] {
   const activities: Activity[] = [];
   const now = new Date();

   // 如果是今天，生成更详细的日程
   if (date.toDateString() === now.toDateString()) {
     activities.push(
       { time: '08:00', title: '晨跑', type: 'workout' },
       { time: '12:00', title: '午餐会议', type: 'meeting' },
       { time: '18:30', title: '健身房', type: 'workout' }
     );
   } else {
     // 其他日期生成1-3个随机活动
     const count = Math.floor(Math.random() * 3) + 1;
     const types: ('workout' | 'meeting' | 'personal')[] = ['workout', 'meeting', 'personal'];

     for (let i = 0; i < count; i++) {
       const hour = Math.floor(Math.random() * 10) + 8; // 8-17点
       const minute = Math.random() > 0.5 ? 30 : 0;

       activities.push({
         time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
         title: ['训练', '会议', '瑜伽', '游泳', '项目讨论'][Math.floor(Math.random() * 5)],
         type: types[Math.floor(Math.random() * types.length)],
         completed: false // 新增這行
       });
       return activities;
     }
   }

   return activities.sort((a, b) => a.time.localeCompare(b.time));
 }

 scrollLeft() {
   const container = document.querySelector('.schedule-container');
   if (container) {
     container.scrollBy({ left: -300, behavior: 'smooth' });
   }
 }

 scrollRight() {
   const container = document.querySelector('.schedule-container');
   if (container) {
     container.scrollBy({ left: 300, behavior: 'smooth' });
   }
 }

 isToday(date: Date): boolean {
   return date.toDateString() === new Date().toDateString();
 }

 getActivityIcon(type: 'workout' | 'meeting' | 'personal'): string {
   return {
     workout: 'fitness_center',
     meeting: 'groups',
     personal: 'person'
   }[type];
 }
}
