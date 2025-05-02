import { Component, Input } from '@angular/core';
import { HttpService } from '../../@services/http.service';
import { GptService } from '../../@services/gpt.service';
import { FormsModule } from '@angular/forms';


import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FoodEditDialogComponent } from '../food-edit-dialog/food-edit-dialog.component';
import { TextareaModule } from 'primeng/textarea';


interface Dietfrom {
  email: string;
  mealsName: string[];
}

@Component({
  selector: 'app-food-table',
  imports: [
    FormsModule,

    TableModule,
    ButtonModule,
    TextareaModule
  ],
  providers: [DialogService],
  templateUrl: './food-table.component.html',
  styleUrl: './food-table.component.scss'
})
export class FoodTableComponent {
  // 和 ai 補充說明的文字
  detail!: string;

  // 選擇的食物
  selectedFoods: any[] = [];

  // 選擇的食物(傳到後端)
  myDiet: any[] = [];
  user!: any;
  userEmail!: string;

  totalCalorie: number = 0;
  totalCholesterol: number = 0;
  totalFat: number = 0;
  totalProtein: number = 0;
  totalCarbohydrate: number = 0;

  // 傳給後端的資料，使用者吃哪些食物的表單(包含email、mealsName、mealsName)
  dietForm!: Dietfrom;
  serve: number = 1;
  // ai回應
  response = '';
  constructor(
    private gptService: GptService,
    private http: HttpService,
    public dialogService: DialogService
  ) { }

  // dialog
  visible: boolean = false;
  ref: DynamicDialogRef | undefined;

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
    if (!this.selectedFoods.find(f => f.foodName == food.foodName)) {
      // 新增 serve 的 key 到 每個食物中
      const foodWithServe = {
        ...food,
        serve: 1
      };
      this.selectedFoods.push(foodWithServe);
      this.myDiet.push(food.foodName);
      console.log(this.selectedFoods);
      this.calculateNutri();
    }
  }

  calculateNutri() {
    this.totalCalorie = this.selectedFoods.reduce((sum, food) => {
      return sum + ((food.calorie || 0) * (food.serve || 1));
    }, 0);
    this.totalCarbohydrate = this.selectedFoods.reduce((sum, food) => {
      return sum + ((food.carbohydrate || 0) * (food.serve || 1));
    }, 0);
    this.totalFat = this.selectedFoods.reduce((sum, food) => {
      return sum + ((food.totalFat || 0) * (food.serve || 1));
    }, 0);
    this.totalProtein = this.selectedFoods.reduce((sum, food) => {
      return sum + ((food.protein || 0) * (food.serve || 1));
    }, 0);
    this.totalCholesterol = this.selectedFoods.reduce((sum, food) => {
      return sum + ((food.cholesterol || 0) * (food.serve || 1));
    }, 0);
  }

  delFood(index: any) {
    this.selectedFoods.splice(index, 1);
    this.myDiet.splice(index, 1);
  }

  editFood(food: any) {
    this.visible = true;
    this.ref = this.dialogService.open(FoodEditDialogComponent, {
      data: {
        //
        food: food
      },
      width: '30rem',
      height: '20rem',
      modal: true,
      dismissableMask: true,
      header: `選擇食物: ${food.foodName}`
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        // 找到該筆資料，更新 serve
        const index = this.selectedFoods.findIndex(f => f.foodName === result.foodName);
        if (index !== -1) {
          this.selectedFoods[index].serve = result.serve;
          this.calculateNutri();
        }
      }
    });
  }

  save() {
    const req = {
      email: this.user.email,
      mealsName: JSON.stringify(this.myDiet),
      eatTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    console.log(req);

    this.http.fillinMealsApi(req).subscribe({
      next: (res: any) => {
        console.log('API回應', res);
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    })
  }

}
