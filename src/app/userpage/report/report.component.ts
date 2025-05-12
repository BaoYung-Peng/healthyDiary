import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';


@Component({
  selector: 'app-report',
  imports: [
    FormsModule,
    DatePicker
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  dateList: string[] = [
    "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"
  ]
  selectedDate!: Date; // 使用者選擇的日期
  dailyMood: { [key: string]: string } = {}; // 儲存每天的 emoji 標記

  emojiOptions = ["😀", "😌", "💪", "🎨"]; // 可選的狀態（變瘦、保持不變、變壯、精美）

  // 設定當天的 emoji
  setEmoji(emoji: string) {
    const dateStr = this.selectedDate.toDateString();
    this.dailyMood[dateStr] = emoji;
  }

}
