import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../@services/http.service';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';


@Component({
  selector: 'app-admin',
  imports: [
    ReactiveFormsModule,

    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    InputNumber,
    Select
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  foodForm!: FormGroup;
  cookingMethods = [
    { label: '煮', value: '煮' },
    { label: '炸', value: '炸' },
    { label: '烤', value: '烤' },
    { label: '蒸', value: '蒸' },
    { label: '其他', value: '其他' }
  ];
  types = [
   { label: '五穀根莖', value: '五穀根莖' },
    { label: '蛋豆魚肉', value: '蛋豆魚肉' },
    { label: '蔬菜水果', value: '蔬菜水果' },
    { label: '飲料甜點零食', value: '飲料甜點零食' },
    { label: '外食', value: '外食' },
  ];

  constructor(
    private http: HttpService,
    private fb: FormBuilder

  ) { }

  ngOnInit(): void {
    this.http.getFoodInfoApi().subscribe({
      next: (res: any) => {
        console.log('API回應: ', res);
      },
      error: (err) => {
        console.log('錯誤: ', err);
      }
    });


    this.foodForm = this.fb.group({
      foodName: ['', Validators.required],
      cookingMethod: ['', Validators.required],
      type: ['', Validators.required],
      calorie: [0, [Validators.required, Validators.min(0)]],
      totalFat: [0, [Validators.required, Validators.min(0)]],
      transFat: [0, [Validators.required, Validators.min(0)]],
      saturatedFat: [0, [Validators.required, Validators.min(0)]],
      totalCarbohydrate: [0, [Validators.required, Validators.min(0)]],
      sugar: [0, [Validators.required, Validators.min(0)]],
      dietaryFiber: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      sodium: [0, [Validators.required, Validators.min(0)]],
      cholesterol: [0, [Validators.required, Validators.min(0)]],
      photo: [],
    });

  }

  // 將檔案轉換成Base64
  convertToBase64(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('只允許上傳 JPG、JPEG 或 PNG 格式的圖片');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.foodForm.controls['photo']?.setValue(reader.result as string); // 轉換完成後儲存
        input.value = '';
      };
      reader.readAsDataURL(file); // 讀取檔案並轉換為Base64
    }
  }

  // 重製表單欄位
  resetForm() {
    this.foodForm.reset({
      foodName: '',
      cookingMethod: '',
      type: '',
      calorie: 0,
      totalFat: 0,
      transFat: 0,
      saturatedFat: 0,
      totalCarbohydrate: 0,
      sugar: 0,
      dietaryFiber: 0,
      protein: 0,
      sodium: 0,
      cholesterol: 0,
      photo: '',
    });
  }

  // 儲存
  save() {
    const req = this.foodForm.value;
    this.http.addFoodInfoApi(req).subscribe({
      next: (res: any) => {
        console.log('API回應:', res);
      },
      error: (err: any) => {
        console.error('錯誤:', err);
      }
    });

    console.log(this.foodForm.value);
    this.resetForm();
  }
}
