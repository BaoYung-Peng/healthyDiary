import { Component, Input } from '@angular/core';
import { HttpService } from '../../@services/http.service';
import { GptService } from '../../@services/gpt.service';

import { TableModule } from 'primeng/table';


interface Dietfrom {
  email: string;
  mealsName: string[];
}

@Component({
  selector: 'app-food-table',
  imports: [
    TableModule
  ],
  templateUrl: './food-table.component.html',
  styleUrl: './food-table.component.scss'
})
export class FoodTableComponent {
  // 補充說明
  @Input() detail!: string;

  // 選擇的食物
  selectedFoods: any[] = [];

  user!: any;
  userEmail!: string;

  totalCalorie: number = 0;
  totalFat: number = 0;
  totalProtein: number = 0;
  totalCarbohydrate: number = 0;

  // 傳給後端的資料，使用者吃哪些食物的表單(包含email、mealsName、mealsName)
  dietForm!: Dietfrom;
  // ai回應
  response = '';
  constructor(
    private gptService: GptService,
    private http: HttpService
  ) { }
  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail') ?? '';

    const req = {
      email: this.userEmail
    }
    this.http.getUserByEmailApi(req).subscribe((res: any) => {
      this.user = res.user;
    });

    this.dietForm = {
      email: this.userEmail,
      mealsName: []
    }
  }

  // AI回應
  sendMessage() {
    const req = `你是一位健康營養師，依據我給你的個人訊息及飲食資訊，分析今天吃的是否達標，
  並給我一點建議或鼓勵，用繁體中文回答，字數在70字以內。
  我的身高${this.user.height}公分，
  體重${this.user.weight}公斤，
  性別為${this.user.gender}，
  工作型態為${this.user.workType}。
  今天中午吃了${this.dietForm.mealsName}。
  補充說明:${this.detail}`;


    if (!req.trim()) return;
    this.response = 'Loading...';
    this.gptService.sendMessage(req).subscribe({
      next: res => this.response = res,
      error: err => this.response = 'Error: ' + err.message,
    });
  }

  addFood(food: any) {
    this.selectedFoods.push(food);
    console.log(this.selectedFoods);
    this.calculatNutri(food);
  }

  calculatNutri(food: any) {
   this.totalCalorie += food.calorie;
   this.totalCarbohydrate += food.totalCarbohydrate;
   this.totalFat += food.totalFat;
   this.totalProtein += food.protein;
  }

}
