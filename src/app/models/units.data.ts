import { Category } from '../models/qms.models';

export const CATEGORIES: Record<string, Category> = {
  length: {
    icon: '📏', label: 'Length',
    units: {
      meter:      { label: 'Meter (m)',       toBase: v => v,             fromBase: v => v },
      kilometer:  { label: 'Kilometer (km)',  toBase: v => v * 1000,      fromBase: v => v / 1000 },
      centimeter: { label: 'Centimeter (cm)', toBase: v => v / 100,       fromBase: v => v * 100 },
      millimeter: { label: 'Millimeter (mm)', toBase: v => v / 1000,      fromBase: v => v * 1000 },
      inch:       { label: 'Inch (in)',       toBase: v => v * 0.0254,    fromBase: v => v / 0.0254 },
      foot:       { label: 'Foot (ft)',       toBase: v => v * 0.3048,    fromBase: v => v / 0.3048 },
    }
  },
  weight: {
    icon: '⚖️', label: 'Weight',
    units: {
      gram:     { label: 'Gram (g)',      toBase: v => v,           fromBase: v => v },
      kilogram: { label: 'Kilogram (kg)', toBase: v => v * 1000,    fromBase: v => v / 1000 },
      pound:    { label: 'Pound (lb)',    toBase: v => v * 453.592, fromBase: v => v / 453.592 },
      ounce:    { label: 'Ounce (oz)',    toBase: v => v * 28.3495, fromBase: v => v / 28.3495 },
    }
  },
  temperature: {
    icon: '🌡️', label: 'Temperature',
    units: {
      celsius:    { label: 'Celsius (°C)' },
      fahrenheit: { label: 'Fahrenheit (°F)' },
      kelvin:     { label: 'Kelvin (K)' },
    }
  },
  volume: {
    icon: '🧪', label: 'Volume',
    units: {
      liter:      { label: 'Liter (L)',       toBase: v => v,         fromBase: v => v },
      milliliter: { label: 'Milliliter (mL)', toBase: v => v / 1000,  fromBase: v => v * 1000 },
      gallon:     { label: 'Gallon (gal)',    toBase: v => v * 3.785, fromBase: v => v / 3.785 },
      cup:        { label: 'Cup (cup)',       toBase: v => v * 0.2366, fromBase: v => v / 0.2366 },
    }
  },
};
