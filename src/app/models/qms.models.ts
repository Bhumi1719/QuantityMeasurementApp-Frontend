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

export interface UserInfo {
  name: string;
  email: string;
}

// Backend history record shape
export interface HistoryRecord {
  id: number;
  operation: string;
  result: string;
}

export type Operation = 'convert' | 'add' | 'subtract' | 'multiply' | 'divide' | 'compare';
