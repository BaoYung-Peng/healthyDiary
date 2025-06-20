import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private _loading$ = new BehaviorSubject<boolean>(false);
  loading$ = this._loading$.asObservable();

  constructor() { }

  showLoading() {
    this._loading$.next(true);
  }

  hideLoading() {
    this._loading$.next(false);
  }
}
