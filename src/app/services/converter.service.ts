import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CATEGORIES } from '../models/units.data';
import { environment } from '../../environments/environment';

export interface QuantityDTO {
  value: number;
  unit: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class ConverterService {
  private apiUrl = `${environment.apiUrl}/api/v1/quantities`;

  constructor(private http: HttpClient) {}

  getCategories() { return CATEGORIES; }
  getCategoryKeys() { return Object.keys(CATEGORIES); }

  convertLocal(category: string, fromUnit: string, toUnit: string, value: number): number {
    if (isNaN(value)) throw new Error('Please enter a valid number.');
    if (category === 'temperature') return this.convertTemperature(fromUnit, toUnit, value);
    const cat = CATEGORIES[category];
    const base = cat.units[fromUnit].toBase!(value);
    return cat.units[toUnit].fromBase!(base);
  }

  private convertTemperature(from: string, to: string, v: number): number {
    if (from === to) return v;
    let c: number;
    if (from === 'celsius')      c = v;
    else if (from === 'fahrenheit') c = (v - 32) * 5 / 9;
    else { if (v < 0) throw new Error('Kelvin cannot be negative.'); c = v - 273.15; }
    if (to === 'celsius')    return c;
    if (to === 'fahrenheit') return c * 9 / 5 + 32;
    return c + 273.15;
  }

  arithmeticLocal(category: string, op: string, val1: number, unit1: string, val2: number, unit2: string): { result: number; unit: string } {
    if (isNaN(val1) || isNaN(val2)) throw new Error('Please enter valid numbers for both values.');
    if (op === 'divide' && val2 === 0) throw new Error('Cannot divide by zero.');
    if (category === 'temperature') {
      let r = 0;
      if (op === 'add')      r = val1 + val2;
      if (op === 'subtract') r = val1 - val2;
      if (op === 'multiply') r = val1 * val2;
      if (op === 'divide')   r = val1 / val2;
      return { result: r, unit: unit1 };
    }
    const cat = CATEGORIES[category];
    const b1 = cat.units[unit1].toBase!(val1);
    const b2 = cat.units[unit2].toBase!(val2);
    let br = 0;
    if (op === 'add')      br = b1 + b2;
    if (op === 'subtract') br = b1 - b2;
    if (op === 'multiply') br = b1 * b2;
    if (op === 'divide')   br = b1 / b2;
    return { result: cat.units[unit1].fromBase!(br), unit: unit1 };
  }

  compareLocal(category: string, val1: number, unit1: string, val2: number, unit2: string): string {
    if (isNaN(val1) || isNaN(val2)) throw new Error('Please enter valid numbers for both values.');
    let base1: number, base2: number;
    if (category === 'temperature') {
      base1 = this.convertTemperature(unit1, 'celsius', val1);
      base2 = this.convertTemperature(unit2, 'celsius', val2);
    } else {
      const cat = CATEGORIES[category];
      base1 = cat.units[unit1].toBase!(val1);
      base2 = cat.units[unit2].toBase!(val2);
    }
    const l1 = `${this.fmt(val1)} ${CATEGORIES[category].units[unit1].label}`;
    const l2 = `${this.fmt(val2)} ${CATEGORIES[category].units[unit2].label}`;
    if (Math.abs(base1 - base2) < 1e-10) return `${l1} = ${l2}  ✓ Equal`;
    if (base1 > base2) return `${l1}  >  ${l2}`;
    return `${l1}  <  ${l2}`;
  }

  convertApi(dto: QuantityDTO, target: string): Observable<QuantityDTO> {
    const params = new HttpParams().set('target', target);
    return this.http.post<QuantityDTO>(`${this.apiUrl}/convert`, dto, { params });
  }

  addApi(q1: QuantityDTO, q2: QuantityDTO): Observable<QuantityDTO> {
    return this.http.post<QuantityDTO>(`${this.apiUrl}/add`, [q1, q2]);
  }

  compareApi(q1: QuantityDTO, q2: QuantityDTO): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/compare`, [q1, q2]);
  }

  fmt(n: number): string {
    if (typeof n !== 'number') return String(n);
    const abs = Math.abs(n);
    if (abs === 0) return '0';
    if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) return n.toPrecision(6);
    return parseFloat(n.toFixed(8)).toString();
  }
}
