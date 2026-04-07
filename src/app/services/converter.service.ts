import { Injectable } from '@angular/core';
import { CATEGORIES } from '../models/units.data';

@Injectable({ providedIn: 'root' })
export class ConverterService {

  getCategories() { return CATEGORIES; }

  getCategoryKeys() { return Object.keys(CATEGORIES); }

  convert(category: string, fromUnit: string, toUnit: string, value: number): number {
    if (isNaN(value)) throw new Error('Please enter a valid number.');
    if (category === 'temperature') return this.convertTemperature(fromUnit, toUnit, value);
    const cat = CATEGORIES[category];
    const base = cat.units[fromUnit].toBase!(value);
    return cat.units[toUnit].fromBase!(base);
  }

  private convertTemperature(from: string, to: string, v: number): number {
    if (from === to) return v;
    let c: number;
    if (from === 'celsius')    c = v;
    else if (from === 'fahrenheit') c = (v - 32) * 5 / 9;
    else {
      if (v < 0) throw new Error('Kelvin cannot be negative.');
      c = v - 273.15;
    }
    if (to === 'celsius')    return c;
    if (to === 'fahrenheit') return c * 9 / 5 + 32;
    return c + 273.15;
  }

  arithmetic(category: string, op: string, val1: number, unit1: string, val2: number, unit2: string): { result: number; unit: string } {
    if (isNaN(val1) || isNaN(val2)) throw new Error('Please enter valid numbers for both values.');
    if (op === 'divide' && val2 === 0) throw new Error('Cannot divide by zero.');

    if (category === 'temperature') {
      let result = 0;
      if (op === 'add')      result = val1 + val2;
      if (op === 'subtract') result = val1 - val2;
      if (op === 'multiply') result = val1 * val2;
      if (op === 'divide')   result = val1 / val2;
      return { result, unit: unit1 };
    }

    const cat = CATEGORIES[category];
    const base1 = cat.units[unit1].toBase!(val1);
    const base2 = cat.units[unit2].toBase!(val2);
    let baseResult = 0;
    if (op === 'add')      baseResult = base1 + base2;
    if (op === 'subtract') baseResult = base1 - base2;
    if (op === 'multiply') baseResult = base1 * base2;
    if (op === 'divide')   baseResult = base1 / base2;
    return { result: cat.units[unit1].fromBase!(baseResult), unit: unit1 };
  }

  compare(category: string, val1: number, unit1: string, val2: number, unit2: string): string {
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

  fmt(n: number): string {
    if (typeof n !== 'number') return String(n);
    const abs = Math.abs(n);
    if (abs === 0) return '0';
    if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) return n.toPrecision(6);
    return parseFloat(n.toFixed(8)).toString();
  }
}
