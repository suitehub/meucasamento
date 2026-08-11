import { AppState, BudgetItem, Config, StatusLevel, BestCategoryItem } from '../types';

export const STORAGE_KEY = 'meu_casamento_v2';

export const DEFAULTS: AppState = {
  config: {
    goal: 12000,
    initial: 1068,
    start: '2026-03',
    wedding: '2028-01',
    rate1: 400,
    rate2: 600,
    yellowPct: 90,
    guests: 120,
  },
  entries: {},
  budgets: [],
};

export const pad2 = (n: number): string => String(n).padStart(2, '0');

export const money = (v: number | string | undefined | null): string => {
  const n = Number(v || 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const moneyInputToNumber = (v: string | number): number => {
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

export const ymToDate = (ym: string): Date => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1);
};

export const dateToYM = (d: Date): string => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

export const addMonths = (ym: string, delta: number): string => {
  const d = ymToDate(ym);
  d.setMonth(d.getMonth() + delta);
  return dateToYM(d);
};

export const cmpYM = (a: string, b: string): number => (a === b ? 0 : a < b ? -1 : 1);

export const monthLabel = (ym: string): string => {
  if (!ym || !ym.includes('-')) return ym;
  const d = ymToDate(ym);
  const fmt = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  return fmt.replace('.', '').toUpperCase();
};

export const safeInt = (x: unknown): number => {
  const n = Number(x);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
};

export const uid = (): string => Math.random().toString(36).slice(2, 10);

export function listMonthsInclusive(startYM: string, endYM: string): string[] {
  if (cmpYM(startYM, endYM) > 0) return [];
  const out: string[] = [];
  let cur = startYM;
  while (cmpYM(cur, endYM) <= 0) {
    out.push(cur);
    cur = addMonths(cur, 1);
  }
  return out;
}

export function monthlyTargetFor(ym: string, config: Config): number {
  const year = Number(ym.slice(0, 4));
  return year === 2026 ? config.rate1 : config.rate2;
}

export function sumEntries(entries: Record<string, number>): number {
  let s = 0;
  for (const [, val] of Object.entries(entries)) {
    s += safeInt(val);
  }
  return s;
}

export function totalAccumulated(state: AppState): number {
  return safeInt(state.config.initial) + sumEntries(state.entries);
}

export function expectedUntil(ymNow: string, config: Config): number {
  const start = config.start;
  const end = config.wedding;
  const stop = cmpYM(ymNow, end) > 0 ? end : ymNow;
  if (cmpYM(stop, start) < 0) return safeInt(config.initial);

  const months = listMonthsInclusive(start, stop);
  let expectedAdds = 0;
  for (const ym of months) {
    expectedAdds += monthlyTargetFor(ym, config);
  }
  return safeInt(config.initial) + expectedAdds;
}

export function monthsRemaining(fromYM: string, weddingYM: string): number {
  if (cmpYM(fromYM, weddingYM) > 0) return 0;
  return listMonthsInclusive(fromYM, weddingYM).length;
}

export function budgetTotal(item: BudgetItem): number {
  const baseValue = Number(item.baseValue || 0);
  const people = Number(item.people || 0);
  if (item.pricingType === 'per_person') {
    return baseValue * people;
  }
  return baseValue;
}

export function bestByCategory(budgets: BudgetItem[]): Record<string, BestCategoryItem> {
  const map: Record<string, BestCategoryItem> = {};
  budgets.forEach((item) => {
    const total = budgetTotal(item);
    if (!map[item.category] || total < map[item.category].total) {
      map[item.category] = {
        vendor: item.vendor,
        total,
        notes: item.notes || '',
      };
    }
  });
  return map;
}

export function getStatusLevel(total: number, exp: number, yellowPct: number): StatusLevel {
  const yellowThreshold = Math.floor((yellowPct / 100) * exp);
  if (total < yellowThreshold) return 'bad';
  if (total < exp) return 'warn';
  return 'good';
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    const merged = structuredClone(DEFAULTS);
    merged.config = { ...merged.config, ...(parsed.config || {}) };
    merged.entries = { ...(parsed.entries || {}) };
    merged.budgets = Array.isArray(parsed.budgets) ? parsed.budgets : [];
    return merged;
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
