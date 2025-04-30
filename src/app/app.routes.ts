import { Routes } from '@angular/router';

import { authGuard } from './@guards/auth.guard';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserpageComponent } from './userpage/userpage.component';
import { VerifyComponent } from './verify/verify.component';
import { DietComponent } from './userpage/diet/diet.component';
import { ExerciseComponent } from './userpage/exercise/exercise.component';
import { SleepComponent } from './userpage/sleep/sleep.component';



export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'userpage',
    component: UserpageComponent,
    children: [
      { path: 'diet', component: DietComponent },
      { path: 'exercise', component: ExerciseComponent },
      { path: 'sleep', component: SleepComponent }
    ],
    canActivate: [authGuard]
  },
  {
    path: 'confirm',
    component: VerifyComponent
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
