import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';


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
  ],
  templateUrl: './userpage.component.html',
  styleUrl: './userpage.component.scss'
})
export class UserpageComponent {

}
