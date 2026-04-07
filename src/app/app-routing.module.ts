import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent }     from './components/home/home.component';
import { CategoryComponent } from './components/category/category.component';
import { AuthComponent }     from './components/auth/auth.component';
import { HistoryComponent }  from './components/history/history.component';
import { AuthGuard }         from './guards/auth.guard';

const routes: Routes = [
  { path: '',                component: HomeComponent },
  { path: 'category/:category', component: CategoryComponent },
  { path: 'login',           component: AuthComponent },
  { path: 'history',         component: HistoryComponent, canActivate: [AuthGuard] },
  { path: '**',              redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
