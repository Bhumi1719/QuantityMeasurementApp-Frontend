import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  categories = [
    { key: 'length',      icon: '📏', title: 'Length',      desc: 'meter · km · inch · foot',         hue: 210 },
    { key: 'weight',      icon: '⚖️', title: 'Weight',      desc: 'gram · kg · pound',        hue: 150 },
    { key: 'temperature', icon: '🌡️', title: 'Temperature', desc: 'celsius · fahrenheit · kelvin',    hue: 20  },
    { key: 'volume',      icon: '🧪', title: 'Volume',      desc: 'liter · ml · gallon',        hue: 280 },

  ];

  constructor(private router: Router) {}

  open(key: string) {
    this.router.navigate(['/category', key]);
  }
}
