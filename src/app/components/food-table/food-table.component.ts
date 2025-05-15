import { Component } from '@angular/core';
import { HttpService } from '../../@services/http.service';
import { FormsModule } from '@angular/forms';


import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FoodEditDialogComponent } from '../food-edit-dialog/food-edit-dialog.component';
import { TextareaModule } from 'primeng/textarea';
import { Message } from 'primeng/message';


interface Dietfrom {
  token: string;
  mealsName: string[];
}

@Component({
  selector: 'app-food-table',
  imports: [
    FormsModule,

    TableModule,
    ButtonModule,
    TextareaModule,
    Message
  ],
  providers: [DialogService],
  templateUrl: './food-table.component.html',
  styleUrl: './food-table.component.scss'
})
export class FoodTableComponent {
  showMessage: boolean = false;

  // 和 ai 補充說明的文字
  detail: string = '';


  selectedFoods: any[] = []; // 選擇的食物

  myDiet: any[] = [];  // 選擇的食物(傳到後端)
  user!: any;
  token!: string;

  totalCalorie: number = 0;
  totalFat: number = 0;
  totalSaturatedFat: number = 0;
  totalTransFat: number = 0;
  totalProtein: number = 0;
  totalCarbohydrate: number = 0;
  totalSugar: number = 0;
  totalDietaryFiber: number = 0;

  // 傳給後端的資料，使用者吃哪些食物的表單(包含token、mealsName)
  dietForm!: Dietfrom;
  serve: number = 1;

  constructor(
    private http: HttpService,
    public dialogService: DialogService
  ) { }

  // dialog
  visible: boolean = false;
  ref: DynamicDialogRef | undefined;

  ngOnInit(): void {
    this.token = localStorage.getItem('token') ?? '';

    const req = {
      token: this.token
    }
    this.http.getUserByTokenApi(req).subscribe((res: any) => {
      this.user = res.user;
    });

    this.dietForm = {
      token: this.token,
      mealsName: []
    }
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
    this.totalCalorie = 0;
    this.totalFat = 0;
    this.totalSaturatedFat = 0;
    this.totalTransFat = 0;
    this.totalProtein = 0;
    this.totalCarbohydrate = 0;
    this.totalSugar = 0;

    this.selectedFoods.forEach(food => {
      this.totalCalorie += (food.calorie || 0) * (food.serve || 1);
      this.totalFat += (food.totalFat || 0) * (food.serve || 1);
      this.totalSaturatedFat += (food.saturatedFat || 0) * (food.serve || 1);
      this.totalTransFat += (food.transFat || 0) * (food.serve || 1);
      this.totalProtein += (food.protein || 0) * (food.serve || 1);
      this.totalCarbohydrate += (food.carbohydrate || 0) * (food.serve || 1);
      this.totalSugar += (food.sugar || 0) * (food.serve || 1);
      this.totalDietaryFiber += (food.dietaryFiber || 0) * (food.serve || 1);
    });
  }

  delFood(index: any) {
    this.selectedFoods.splice(index, 1);
    this.myDiet.splice(index, 1);
    this.calculateNutri();
  }

  editFood(food: any) {
    this.visible = true;
    this.ref = this.dialogService.open(FoodEditDialogComponent, {
      data: {
        //
        food: food,
        type: 'food'
      },
      // width: '30rem',
      // height: '20rem',
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

  showAIDialog() {
    this.visible = true;
    this.ref = this.dialogService.open(FoodEditDialogComponent, {
      data: {
        //
        user: this.user,
        detail: this.detail,
        dietForm: this.dietForm,
        type: 'save'
      },
      width: '30rem',
      height: '20rem',
      modal: true,
      dismissableMask: true,
      // header: `選擇食物: ${food.foodName}`
    });
  }

  save() {
    const req = {
      token: this.token,
      mealsName: JSON.stringify(this.myDiet),
      eatTime: new Date().toISOString().slice(0, 19)
    }
    console.log(req);

    this.http.fillinMealsApi(req).subscribe({
      next: (res: any) => {
        console.log('API回應', res);
        if (res.code == 200) {
          this.showMessage = true;
          this.myDiet = [];
          this.selectedFoods = [];
          setTimeout(() => {
            this.showMessage = false
          }, 2000);
        }
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    })
  }

}
