import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  convertToBase64(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        reject('只允許上傳 JPG、JPEG 或 PNG 格式的圖片');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string); // 回傳 Base64
      };
      reader.onerror = () => {
        reject('文件讀取錯誤');
      };

      reader.readAsDataURL(file); // 讀取檔案並轉換為 Base64
    });
  }

  convertToAge(birthdate: any) {
    const birthDate = new Date(birthdate);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    if (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
