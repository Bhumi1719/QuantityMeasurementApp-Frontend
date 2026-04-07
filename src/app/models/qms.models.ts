export interface UnitDef {
  label: string;
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
}

export interface Category {
  icon: string;
  label: string;
  units: Record<string, UnitDef>;
}

export interface User {
  name: string;
  email: string;
  password: string;
}

export interface HistoryRecord {
  id: number;
  timestamp: number;
  category: string;
  op: string;
  expression: string;
  result: string;
}

export type Operation = 'convert' | 'add' | 'subtract' | 'multiply' | 'divide' | 'compare';
