import React, { useState } from 'react';
import { AppState, BudgetItem, BUDGET_CATEGORIES, PricingType } from '../types';
import {
  money,
  safeInt,
  budgetTotal,
  bestByCategory,
  uid,
  moneyInputToNumber,
} from '../utils/helpers';
import {
  Plus,
  Receipt,
  Search,
  Filter,
  Trash2,
  Edit3,
  Sparkles,
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

interface BudgetsTabProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onSave: () => void;
}

const COLORS = [
  '#e91e63',
  '#c2185b',
  '#ec4899',
  '#f43f5e',
  '#fb7185',
  '#8b5cf6',
  '#6366f1',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#14b8a6',
  '#06b6d4',
];

export const BudgetsTab: React.FC<BudgetsTabProps> = ({ state, setState, onSave }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<string>(BUDGET_CATEGORIES[0]);
  const [vendor, setVendor] = useState<string>('');
  const [pricingType, setPricingType] = useState<PricingType>('per_person');
  const [baseValue, setBaseValue] = useState<string>('');
  const [people, setPeople] = useState<string>(String(state.config.guests));
  const [notes, setNotes] = useState<string>('');

  // Table Filters
  const [searchVendor, setSearchVendor] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Preview Calculation
  const numBase = moneyInputToNumber(baseValue);
  const numPeople = pricingType === 'per_person' ? safeInt(people || state.config.guests) : 0;
  const calculatedPreview = pricingType === 'per_person' ? numBase * numPeople : numBase;

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendor.trim()) {
      alert('Informe o nome do fornecedor ou empresa.');
      return;
    }

    if (numBase <= 0) {
      alert('Informe um valor base maior que zero.');
      return;
    }

    if (pricingType === 'per_person' && numPeople <= 0) {
      alert('Informe a quantidade de pessoas.');
      return;
    }

    setState((prev) => {
      const newBudgets = [...prev.budgets];
      if (editingId) {
        const idx = newBudgets.findIndex((b) => b.id === editingId);
        if (idx !== -1) {
          newBudgets[idx] = {
            id: editingId,
            category,
            vendor: vendor.trim(),
            pricingType,
            baseValue: numBase,
            people: numPeople,
            notes: notes.trim(),
          };
        }
      } else {
        newBudgets.push({
          id: uid(),
          category,
          vendor: vendor.trim(),
          pricingType,
          baseValue: numBase,
          people: numPeople,
          notes: notes.trim(),
        });
      }
      return { ...prev, budgets: newBudgets };
    });

    onSave();
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setVendor('');
    setBaseValue('');
    setNotes('');
    setPeople(String(state.config.guests));
    setCategory(BUDGET_CATEGORIES[0]);
    setPricingType('per_person');
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setVendor(item.vendor);
    setPricingType(item.pricingType);
    setBaseValue(String(item.baseValue));
    setPeople(String(item.people || state.config.guests));
    setNotes(item.notes || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja excluir este orçamento?')) return;
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== id),
    }));
    onSave();
  };

  const handleSeedExamples = () => {
    if (state.budgets.length > 0) {
      if (!confirm('Já existem orçamentos salvos. Deseja adicionar cotações de exemplo mesmo assim?')) {
        return;
      }
    }

    const examples: BudgetItem[] = [
      {
        id: uid(),
        category: 'Alimentação',
        vendor: 'Buffet Esperança',
        pricingType: 'per_person',
        baseValue: 49.5,
        people: state.config.guests,
        notes: 'Inclui refrigerante, sucos, entrada e 4 pratos quentes',
      },
      {
        id: uid(),
        category: 'Fotografia',
        vendor: 'João Fotos & Filme',
        pricingType: 'fixed',
        baseValue: 2400,
        people: 0,
        notes: 'Cobertura de 6 horas + Ensaio Pré-Wedding',
      },
      {
        id: uid(),
        category: 'Vestido',
        vendor: 'Ateliê Rosa Noivas',
        pricingType: 'fixed',
        baseValue: 1200,
        people: 0,
        notes: 'Primeiro aluguel com ajustes incluídos',
      },
      {
        id: uid(),
        category: 'Decoração',
        vendor: 'Flores & Sonhos',
        pricingType: 'fixed',
        baseValue: 3500,
        people: 0,
        notes: 'Cerimônia ao ar livre + recepção com flores nobres',
      },
      {
        id: uid(),
        category: 'Bolo',
        vendor: 'Doces da Ana',
        pricingType: 'fixed',
        baseValue: 800,
        people: 0,
        notes: 'Bolo fake 4 andares + bolo de corte para 120 pessoas',
      },
    ];

    setState((prev) => ({
      ...prev,
      budgets: [...prev.budgets, ...examples],
    }));
    onSave();
  };

  const handleClearAll = () => {
    if (!confirm('Tem certeza? Isso apaga todos os orçamentos da lista.')) return;
    setState((prev) => ({ ...prev, budgets: [] }));
    onSave();
  };

  // Calculations
  const itemsTotals = state.budgets.map((b) => budgetTotal(b));
  const count = state.budgets.length;
  const grandTotal = itemsTotals.reduce((a, b) => a + b, 0);
  const cheapest = count ? Math.min(...itemsTotals) : 0;
  const expensive = count ? Math.max(...itemsTotals) : 0;

  const bestMap = bestByCategory(state.budgets);
  const bestCategories = Object.keys(bestMap);
  const bestTotal = bestCategories.reduce((acc, cat) => acc + bestMap[cat].total, 0);

  const goal = safeInt(state.config.goal);
  const goalDiff = bestTotal - goal;

  // Recharts Chart Data (best quotes by category)
  const chartData = bestCategories.map((cat) => ({
    name: cat,
    value: bestMap[cat].total,
  }));

  // Table Filter
  const filteredBudgets = state.budgets.filter((item) => {
    const matchesCat = filterCategory === 'ALL' || item.category === filterCategory;
    const searchLower = searchVendor.toLowerCase();
    const matchesSearch =
      !searchVendor ||
      item.vendor.toLowerCase().includes(searchLower) ||
      (item.notes && item.notes.toLowerCase().includes(searchLower));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cotações Salvas
            </span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">{count}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">fornecedores cadastrados</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total das Cotações
            </span>
            <div className="p-2.5 bg-pink-50 rounded-xl text-pink-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {money(grandTotal)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">soma de todas as opções</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mais Barato (Opção)
            </span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {money(cheapest)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">menor valor individual</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mais Caro (Opção)
            </span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700 tracking-tight">
              {money(expensive)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">maior valor individual</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Add Quote Form & Best Combination Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Add/Edit Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 font-serif">
                {editingId ? 'Editar Orçamento' : 'Cadastrar Novo Orçamento'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Insira os valores recebidos dos fornecedores para comparar opções.
              </p>
            </div>

            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleAddOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category Select */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white transition-all"
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Fornecedor / Empresa
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex.: Buffet Esperança"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Pricing Type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tipo de Cobrança
                </label>
                <select
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as PricingType)}
                  className="w-full p-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white transition-all"
                >
                  <option value="per_person">Por Pessoa (Multiplica por convidados)</option>
                  <option value="fixed">Valor Fixo (Preço fechado)</option>
                </select>
              </div>

              {/* Base Value */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Valor Base (R$)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  placeholder="Ex.: 49.50 ou 1800"
                  value={baseValue}
                  onChange={(e) => setBaseValue(e.target.value)}
                  className="w-full p-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white transition-all"
                />
              </div>

              {/* Number of People */}
              {pricingType === 'per_person' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Quantidade de Pessoas
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className={pricingType === 'per_person' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Observações / O que inclui
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Inclui refri, sucos, 4h de evento..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white transition-all"
                />
              </div>

            </div>

            {/* Calculated Preview & Submit */}
            <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Calculado:</span>
                <p className="text-lg font-black text-rose-700">{money(calculatedPreview)}</p>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                {editingId ? 'Salvar Alterações' : 'Adicionar Orçamento'}
              </button>
            </div>
          </form>
        </div>

        {/* Best Combinations & Goal Comparison */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-bold text-slate-800 font-serif">
                Melhor Cenário Atual
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Soma das opções mais econômicas encontradas em cada categoria.
            </p>

            {/* Comparison Badge */}
            <div className="mt-4 p-4 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Soma das Melhores Opções:</span>
                <span className="text-sm font-black text-slate-800">{money(bestTotal)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-rose-100/80 text-xs">
                <span className="text-slate-500">Sua Meta do Cofrinho:</span>
                <span className="font-bold text-slate-700">{money(goal)}</span>
              </div>

              {bestCategories.length > 0 && (
                <div
                  className={`mt-2 p-2.5 rounded-xl text-xs font-bold leading-relaxed ${
                    goalDiff > 0
                      ? 'bg-amber-100/80 text-amber-900 border border-amber-200'
                      : goalDiff < 0
                      ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-100/80 text-rose-900 border border-rose-200'
                  }`}
                >
                  {goalDiff > 0 && (
                    <span>⚠️ O melhor cenário atual está {money(goalDiff)} acima da meta total.</span>
                  )}
                  {goalDiff < 0 && (
                    <span>✔️ O melhor cenário atual está {money(Math.abs(goalDiff))} abaixo da meta!</span>
                  )}
                  {goalDiff === 0 && <span>🎉 O melhor cenário atinge exatamente a meta total!</span>}
                </div>
              )}
            </div>

            {/* List of Best Options */}
            <div className="mt-4 max-h-56 overflow-y-auto space-y-2 pr-1">
              {bestCategories.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Nenhuma cotação cadastrada ainda.
                </p>
              ) : (
                bestCategories.map((cat) => {
                  const item = bestMap[cat];
                  return (
                    <div
                      key={cat}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{cat}: </span>
                        <span className="text-slate-600 font-medium">{item.vendor}</span>
                      </div>
                      <span className="font-black text-rose-700 ml-2">{money(item.total)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Dica: atualize os fornecedores à medida que fechar contratos.</span>
          </div>
        </div>

      </div>

      {/* Recharts Visual Category Breakdown */}
      {bestCategories.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-800 font-serif">
              Distribuição do Orçamento por Categoria (Melhores Opções)
            </h2>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tickFormatter={(v) => `R$${v}`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(value: number) => [money(value), 'Valor Estimado']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #fecdd3',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#e91e63" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Vendor Quotes Table */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
        
        {/* Table Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 font-serif">
              Lista de Cotações Cadastradas
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie, filtre e edite todos os orçamentos recebidos.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-rose-50/70 p-1 rounded-xl border border-rose-100">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none pr-2 py-1"
              >
                <option value="ALL">Todas as Categorias</option>
                {BUDGET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar fornecedor..."
                value={searchVendor}
                onChange={(e) => setSearchVendor(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-300 w-36 sm:w-48 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quotes Table */}
        <div className="overflow-x-auto rounded-2xl border border-rose-100">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-rose-50/80 border-b border-rose-100 text-slate-700 text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Valor Base</th>
                <th className="py-3 px-4">Pessoas</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Observações</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 text-xs">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum orçamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredBudgets.map((item) => {
                  const total = budgetTotal(item);
                  return (
                    <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">{item.category}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{item.vendor}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.pricingType === 'per_person' ? 'Por pessoa' : 'Fixo'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{money(item.baseValue)}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.pricingType === 'per_person' ? safeInt(item.people) : '—'}
                      </td>
                      <td className="py-3 px-4 font-black text-rose-700">{money(total)}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {item.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-rose-50">
          <button
            onClick={handleSeedExamples}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Carregar Exemplos Rápidos
          </button>

          <button
            onClick={handleClearAll}
            disabled={state.budgets.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Apagar Todos os Orçamentos
          </button>
        </div>

      </div>

    </div>
  );
};
