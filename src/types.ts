export interface Config {
  goal: number;
  initial: number;
  start: string; // YYYY-MM
  wedding: string; // YYYY-MM
  rate1: number;
  rate2: number;
  yellowPct: number;
  guests: number;
}

export type PricingType = 'per_person' | 'fixed';

export interface BudgetItem {
  id: string;
  category: string;
  vendor: string;
  pricingType: PricingType;
  baseValue: number;
  people: number;
  notes?: string;
  createdAt?: string;
}

export interface AppState {
  config: Config;
  entries: Record<string, number>; // "YYYY-MM": amount
  budgets: BudgetItem[];
}

export type StatusLevel = 'good' | 'warn' | 'bad';

export interface BestCategoryItem {
  vendor: string;
  total: number;
  notes?: string;
}

export const BUDGET_CATEGORIES = [
  'Alimentação',
  'Bebida',
  'Vestido',
  'Traje do noivo',
  'Fotografia',
  'Filmagem',
  'Decoração',
  'Local',
  'Cerimonialista',
  'Doces',
  'Bolo',
  'Som / música',
  'Convites',
  'Lembrancinhas',
  'Hospedagem',
  'Transporte',
  'Outro',
] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number];
