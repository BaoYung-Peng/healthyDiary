import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HttpService } from '../../@services/http.service';

import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FoodEditDialogComponent } from '../../components/food-edit-dialog/food-edit-dialog.component';

interface Dietfrom {
  token: string;
  mealsName: string[];
}

interface Items {
  icon?: string;
  label: string;
  value: string;
}

interface Food {
  name: string;
  type: string;
}

@Component({
  selector: 'app-diet',
  imports: [
    FormsModule,
    CommonModule,

    FloatLabelModule,
    InputTextModule,
    SelectButtonModule,
    ButtonModule,
    TableModule,
    Select,
    Message,
  ],
  providers: [DialogService],
  templateUrl: './diet.component.html',
  styleUrl: './diet.component.scss'
})
export class DietComponent implements OnInit {
  today: Date = new Date(); // 取得今天的日期

  // 顯示儲存成功訊息
  showMessage: boolean = false;

  selectedFoods: any[] = []; // 選擇的食物

  times: Items[] = [
    { label: '早餐', value: '早餐' },
    { label: '午餐', value: '午餐' },
    { label: '晚餐', value: '晚餐' },
    { label: '其他', value: '其他' },
  ];
  mealsType!: any; // 用餐時段

  myDiet: any[] = []; // 選擇的食物(傳到後端)
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

  // 傳給後端的資料，使用者吃哪些食物的表單(包含email、mealsName、mealsName)
  dietForm!: Dietfrom;
  serve: number = 1;


  // 查詢的食物名稱
  searchedName: string = '';
  searchedType: string = '';
  searchedMethod: string = '';

  methods: Items[] = [
    { label: '煮', value: '煮' },
    { label: '炸', value: '炸' },
    { label: '烤', value: '烤' },
    { label: '蒸', value: '蒸' },
    { label: '其他', value: '其他' }
  ];

  types: Items[] = [
    { label: '五穀根莖', value: '五穀根莖' },
    { label: '蛋豆魚肉', value: '蛋豆魚肉' },
    { label: '蔬菜水果', value: '蔬菜水果' },
    { label: '飲料甜點零食', value: '飲料甜點零食' },
    { label: '外食', value: '外食' },

  ];

  // db食物列表
  foods!: Food[];

  // 搜尋後的食物列表
  searchedFood = [];

  visible: boolean = false;
  ref: DynamicDialogRef | undefined;

  constructor(
    private http: HttpService,
    public dialogService: DialogService

  ) { }

  ngOnInit() {
    this.http.getFoodInfoApi().subscribe((res: any) => {
      this.foods = res.foodList;
    });

    this.token = localStorage.getItem('token') ?? '';

    const getUserReq = {
      token: this.token
    }
    this.http.getUserByTokenApi(getUserReq).subscribe((res: any) => {
      this.user = res.user;
    });

    this.dietForm = {
      token: this.token,
      mealsName: []
    }

    const getMealsReq = {
      token: this.token,
      date: new Date().toISOString().split('T')[0] // 取得今天的日期
    }
  }

  // 取得特定時段食物
  onMealsTypeChange(type: string) {
    if (!type) return;

    // 先清空
    this.selectedFoods = [];
    this.myDiet = [];
    this.calculateNutri();

    const req = {
      token: this.token,
      date: new Date().toISOString().split('T')[0],
    };

    this.http.getDateMealApi(req).subscribe({
      next: (res: any) => {
        if (res.code === 200 && res.meals?.length > 0) {
          const mealsOfType = res.meals.find((meal: any) => meal.mealsType === type);

          if (mealsOfType) {
            const foodNames: string[] = JSON.parse(mealsOfType.mealsName);
            for (const food of foodNames) {
              const req = {
                foodName: food,
                type: '',
                cookingMethod: ''
              };
              this.http.searchFoodApi(req).subscribe((res: any) => {
                this.addFood(res.foodList[0]);
              });
            }
          } else {
            // 沒有該時段紀錄就清空
            this.selectedFoods = [];
            this.myDiet = [];
            this.calculateNutri();
          }
        } else {
          // 全部沒紀錄也清空
          this.selectedFoods = [];
          this.myDiet = [];
          this.calculateNutri();
        }
      },
      error: (err) => {
        console.error('取得餐點資料失敗', err);
      }
    });
  }


  reset(event: Event) {
    if (!(event.target as HTMLInputElement).value) {
      const req = {
        foodName: '',
        type: '',
        cookingMethod: ''
      };

      this.http.searchFoodApi(req).subscribe((res: any) => {
        this.foods = res.foodList;
      })
    }
  }


  searchFood() {
    this.searchedType = (this.searchedType == null) ? "" : this.searchedType;
    this.searchedMethod = (this.searchedMethod == null) ? "" : this.searchedMethod;

    const req = {
      foodName: this.searchedName,
      type: this.searchedType,
      cookingMethod: this.searchedMethod
    }

    this.http.searchFoodApi(req).subscribe({
      next: (res: any) => {
        this.foods = res.foodList;
        console.log('API回應', res);
      },
      error: (err) => {
        console.log('API錯誤', err);
      }
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
      this.calculateNutri();

      console.log("selectedFoods");
      console.log(this.selectedFoods);

    }
  }

  // 計算選取食物的營養資訊
  calculateNutri() {
    this.totalCalorie = 0;
    this.totalFat = 0;
    this.totalSaturatedFat = 0;
    this.totalTransFat = 0;
    this.totalProtein = 0;
    this.totalCarbohydrate = 0;
    this.totalSugar = 0;
    this.totalDietaryFiber = 0;

    this.selectedFoods.forEach(food => {
      this.totalCalorie += (food.calorie || 0) * (food.serve || 1);
      this.totalFat += (food.totalFat || 0) * (food.serve || 1);
      this.totalSaturatedFat += (food.saturatedFat || 0) * (food.serve || 1);
      this.totalTransFat += (food.transFat || 0) * (food.serve || 1);
      this.totalProtein += (food.protein || 0) * (food.serve || 1);
      this.totalCarbohydrate += (food.totalCarbohydrate || 0) * (food.serve || 1);
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
      token: this.token,
      mealsName: JSON.stringify(this.myDiet),
      eatTime: new Date().toISOString().split('T')[0],
      mealsType: this.mealsType
    }
    this.http.fillinMealsApi(req).subscribe({
      next: (res: any) => {
        console.log('API回應', res);
        if (res.code == 200) {

          this.showMessage = true;
          this.mealsType = 'null';
          this.selectedFoods = [];
          this.myDiet = [];

          this.totalCalorie = 0;
          this.totalFat = 0;
          this.totalSaturatedFat = 0;
          this.totalTransFat = 0;
          this.totalProtein = 0;
          this.totalCarbohydrate = 0;
          this.totalSugar = 0;
          this.totalDietaryFiber = 0;

          setTimeout(() => {
            this.showMessage = false
          }, 2000);
        }
      },
      error: (err: any) => {
        console.log('API錯誤', err);
      }
    });
  }
}
