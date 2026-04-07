import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule }  from './app-routing.module';
import { AppComponent }      from './app.component';
import { NavbarComponent }   from './components/navbar/navbar.component';
import { HomeComponent }     from './components/home/home.component';
import { CategoryComponent } from './components/category/category.component';
import { AuthComponent }     from './components/auth/auth.component';
import { HistoryComponent }  from './components/history/history.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    CategoryComponent,
    AuthComponent,
    HistoryComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
