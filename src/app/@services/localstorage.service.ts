import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {
  private _isLogin$ = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  isLogin$ = this._isLogin$.asObservable();

  constructor() { }

  // 在localstorage存email，並將狀態更新為登入狀態
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
    if (key == 'token') {
      this._isLogin$.next(true); // 更新為登入狀態
    }
  }

  // 登出
  removeItem(): void {
    localStorage.clear();
    this._isLogin$.next(false); // 更新為未登入狀態
  }
}
