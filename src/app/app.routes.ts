import { Routes } from '@angular/router';
import { authGuard } from './@guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgotpassword',
    loadComponent: () => import('./forgotpassword/forgotpassword.component').then(m => m.ForgotpasswordComponent)
  },
  {
    path: 'editpassword',
    loadComponent: () => import('./editpassword/editpassword.component').then(m => m.EditpasswordComponent)
  },
  {
    path: 'editconfirm',
    loadComponent: () => import('./edit-verify/edit-verify.component').then(m => m.EditVerifyComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'userpage',
    loadComponent: () => import('./userpage/userpage.component').then(m => m.UserpageComponent),
    children: [
      { path: 'diet', loadComponent: () => import('./userpage/diet/diet.component').then(m => m.DietComponent) },
      { path: 'exercise', loadComponent: () => import('./userpage/exercise/exercise.component').then(m => m.ExerciseComponent) },
      { path: 'sleep', loadComponent: () => import('./userpage/sleep/sleep.component').then(m => m.SleepComponent) },
      { path: 'report', loadComponent: () => import('./userpage/report/report.component').then(m => m.ReportComponent) }
    ],
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'confirm',
    loadComponent: () => import('./verify/verify.component').then(m => m.VerifyComponent)
  },
  {
    path: 'bookcase',
    loadComponent: () => import('./bookcase/bookcase.component').then(m => m.BookcaseComponent)
  },
  {
    path: 'write-mood',
    loadComponent: () => import('./write-mood/write-mood.component').then(m => m.WriteMoodComponent)
  },
  {
    path: 'mood-diary/:monthId',
    loadComponent: () => import('./mood-diary/mood-diary.component').then(m => m.MoodDiaryComponent)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];