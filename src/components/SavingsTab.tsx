import React, { useState, useRef, useEffect } from 'react';
import { AppState, StatusLevel } from '../types';
import {
  money,
  totalAccumulated,
  monthsRemaining,
  expectedUntil,
  monthLabel,
  dateToYM,
  listMonthsInclusive,
  cmpYM,
  getStatusLevel,
  monthlyTargetFor,
  safeInt,
} from '../utils/helpers';
import {
  TrendingUp,
  Target,
  PiggyBank,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Save,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SavingsTabProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onSave: () => void;
}

export const SavingsTab: React.FC<SavingsTabProps> = ({ state, setState, onSave }) => {
  const [selectedYM, setSelectedYM] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [justSaved, setJustSaved] = useState(false);

  const monthsTableRef = useRef<HTMLDivElement>(null);
  const nowYM = dateToYM(new Date());

  const cfg = state.config;
  const total = totalAccumulated(state);
  const goal = safeInt(cfg.goal);
  const remaining = Math.max(0, goal - total);
  const mLeft = monthsRemaining(nowYM, cfg.wedding);
  const avgNeeded = mLeft > 0 ? Math.ceil(remaining / mLeft) : remaining;

  const exp = expectedUntil(nowYM, cfg);
  const delta = total - exp;
  const statusLevel: StatusLevel = getStatusLevel(total, exp, cfg.yellowPct);

  const progressPct = goal > 0 ? Math.min(100, (total / goal) * 100) : 0;

  const months = listMonthsInclusive(cfg.start, cfg.wedding);

  // Available years for filter
  const years = Array.from(new Set(months.map((ym) => ym.slice(0, 4)))).sort();

  const filteredMonths = months.filter((ym) => {
    const matchesYear = filterYear === 'ALL' || ym.startsWith(filterYear);
    const label = monthLabel(ym).toLowerCase();
    const matchesSearch = !searchTerm || label.includes(searchTerm.toLowerCase()) || ym.includes(searchTerm);
    return matchesYear && matchesSearch;
  });

  const handleEntryChange = (ym: string, valStr: string) => {
    setState((prev) => {
      const nextEntries = { ...prev.entries };
      if (valStr.trim() === '') {
        delete nextEntries[ym];
      } else {
        nextEntries[ym] = safeInt(valStr);
      }
      return { ...prev, entries: nextEntries };
    });
  };

  const handleClearMonth = () => {
    if (!selectedYM) return;
    setState((prev) => {
      const next = { ...prev.entries };
      delete next[selectedYM];
      return { ...prev, entries: next };
    });
  };

  const handleFillZeros = () => {
    setState((prev) => {
      const next = { ...prev.entries };
      months.forEach((ym) => {
        if (next[ym] === undefined) {
          next[ym] = 0;
        }
      });
      return { ...prev, entries: next };
    });
  };

  const handleGoCurrentMonth = () => {
    const targetInput = document.getElementById(`input-${nowYM}`);
    if (targetInput) {
      targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetInput.focus();
    }
  };

  const handleSave = () => {
    onSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-[#1a] space-y-6">
      
      {/* KPI Cards & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Meta Total */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Meta Total
            </span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {money(goal)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {cfg.guests} convidados previstos
            </p>
          </div>
        </motion.div>

        {/* Total Acumulado */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Acumulado
            </span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {money(total)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Inclui {money(cfg.initial)} inicial
            </p>
          </div>
        </motion.div>

        {/* Valor Restante / Falta */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Falta Guardar
            </span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {money(remaining)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {mLeft} meses até {monthLabel(cfg.wedding)}
            </p>
          </div>
        </motion.div>

        {/* Média Necessária */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Média Necessária
            </span>
            <div className="p-2.5 bg-pink-50 rounded-xl text-pink-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-pink-600 tracking-tight">
              {money(avgNeeded)}
              <span className="text-xs font-bold text-slate-500">/mês</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Para atingir 100% da meta
            </p>
          </div>
        </motion.div>

      </div>

      {/* Progress Bar & Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress & Plan Health */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 font-serif">
                Progresso Financeiro & Saúde do Plano
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Comparativo do valor guardado x esperado para o mês atual ({monthLabel(nowYM)})
              </p>
            </div>

            {/* Dynamic Status Pill */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                statusLevel === 'good'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : statusLevel === 'warn'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusLevel === 'good' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {statusLevel === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {statusLevel === 'bad' && <XCircle className="w-4 h-4 text-rose-600" />}
              <span>
                {statusLevel === 'good'
                  ? 'Acima do Plano'
                  : statusLevel === 'warn'
                  ? 'No Limite'
                  : 'Abaixo do Plano'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
              <span>{money(total)} Guardados</span>
              <span>{Math.round(progressPct)}% de {money(goal)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 p-0.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full transition-all ${
                  statusLevel === 'good'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : statusLevel === 'warn'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-rose-500 to-pink-600'
                }`}
              />
            </div>
          </div>

          {/* Expected vs Actual details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-rose-50">
            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/60">
              <span className="text-xs text-slate-500 font-medium">Esperado até agora:</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{money(exp)}</p>
            </div>

            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/60">
              <span className="text-xs text-slate-500 font-medium">Diferença Atual:</span>
              <p
                className={`text-sm font-bold mt-0.5 ${
                  delta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {delta >= 0 ? '+' : ''}
                {money(delta)}
              </p>
            </div>
          </div>

          {/* Recommendation Note */}
          <div
            className={`p-4 rounded-2xl text-xs leading-relaxed border ${
              statusLevel === 'good'
                ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                : statusLevel === 'warn'
                ? 'bg-amber-50/60 border-amber-100 text-amber-900'
                : 'bg-rose-50/60 border-rose-100 text-rose-900'
            }`}
          >
            {statusLevel === 'good' && (
              <p className="font-semibold">
                ✔️ Parabéns! Vocês estão mantendo o ritmo acima do previsto. Se desejarem, acumulem
                essa folga como reserva de emergência para imprevistos do buffet ou decoração.
              </p>
            )}
            {statusLevel === 'warn' && (
              <p className="font-semibold">
                ⚠️ Vocês estão ligeiramente abaixo do estimado por{' '}
                <span className="underline">{money(Math.abs(delta))}</span>. Para recuperar o ritmo
                ideal, tentem adicionar +{money(mLeft > 0 ? Math.ceil(Math.abs(delta) / mLeft) : 0)}
                /mês até {monthLabel(cfg.wedding)}.
              </p>
            )}
            {statusLevel === 'bad' && (
              <p className="font-semibold">
                ❌ Atenção: Atualmente faltam <span className="underline">{money(Math.abs(delta))}</span>{' '}
                em relação ao plano original. Para recuperar: injetem +
                {money(mLeft > 0 ? Math.ceil(Math.abs(delta) / mLeft) : 0)}/mês até{' '}
                {monthLabel(cfg.wedding)} ou reajustem as metas dos orçamentos.
              </p>
            )}
          </div>
        </div>

        {/* 2-Phase Plan Overview */}
        <div className="bg-gradient-to-br from-white to-rose-50/40 rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-bold text-slate-800 font-serif">Plano em 2 Fases</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Estratégia dividida em duas metas de depósitos mensais para equilibrar o orçamento.
            </p>

            <div className="mt-4 space-y-3">
              {/* Phase 1 */}
              <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-2xs">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Fase 1 (2026)</span>
                  <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    {money(cfg.rate1)}/mês
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  De {monthLabel(cfg.start)} até Dez/2026
                </p>
              </div>

              {/* Phase 2 */}
              <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-2xs">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Fase 2 (2027+)</span>
                  <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                    {money(cfg.rate2)}/mês
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  De Jan/2027 até {monthLabel(cfg.wedding)}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-rose-100 space-y-2">
            <button
              onClick={handleGoCurrentMonth}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <Calendar className="w-4 h-4" />
              Ir para o Mês Atual ({monthLabel(nowYM)})
            </button>

            <button
              onClick={handleFillZeros}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-rose-50 text-slate-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
            >
              Preencher Vazios com R$ 0
            </button>
          </div>
        </div>

      </div>

      {/* Monthly Entries Table Section */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
        
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 font-serif">
              Registro Mensal do Cofrinho
            </h2>
            <p className="text-xs text-slate-500">
              Lancem 1 valor por mês guardado. Sugestão: abram juntos todo dia 5 do mês.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Year */}
            <div className="flex items-center gap-1.5 bg-rose-50/70 p-1 rounded-xl border border-rose-100">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none pr-2 py-1"
              >
                <option value="ALL">Todos os Anos</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    Ano {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar mês..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-300 w-28 sm:w-36 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div ref={monthsTableRef} className="overflow-x-auto rounded-2xl border border-rose-100">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-rose-50/80 border-b border-rose-100 text-slate-700 text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Mês / Período</th>
                <th className="py-3 px-4">Alvo da Fase</th>
                <th className="py-3 px-4">Valor Lançado (R$)</th>
                <th className="py-3 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 text-sm">
              {filteredMonths.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    Nenhum mês encontrado para esse filtro.
                  </td>
                </tr>
              ) : (
                filteredMonths.map((ym) => {
                  const isCurrent = ym === nowYM;
                  const isSelected = selectedYM === ym;
                  const entryVal = state.entries[ym];
                  const targetRate = monthlyTargetFor(ym, cfg);

                  return (
                    <tr
                      key={ym}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-rose-50/70 font-semibold'
                          : isSelected
                          ? 'bg-slate-50'
                          : 'hover:bg-rose-50/20'
                      }`}
                    >
                      {/* Month Label */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{monthLabel(ym)}</span>
                          <span className="text-xs text-slate-400 font-mono">({ym})</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold shadow-2xs">
                              Mês Atual
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expected Target for Phase */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-500">
                        {money(targetRate)}
                      </td>

                      {/* Entry Input */}
                      <td className="py-3 px-4">
                        <div className="relative max-w-[160px]">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                            R$
                          </span>
                          <input
                            id={`input-${ym}`}
                            type="number"
                            min="0"
                            step="1"
                            value={entryVal ?? ''}
                            placeholder="0"
                            onChange={(e) => handleEntryChange(ym, e.target.value)}
                            onFocus={() => setSelectedYM(ym)}
                            className={`w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-800 bg-white border rounded-xl outline-none transition-all ${
                              isCurrent
                                ? 'border-rose-400 ring-2 ring-rose-200/60 shadow-xs'
                                : 'border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedYM(ym)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-rose-200 hover:text-rose-600'
                          }`}
                        >
                          {isSelected ? 'Selecionado ✓' : 'Selecionar'}
                        </button>
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>

            {justSaved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold text-emerald-600 flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
              </motion.span>
            )}
          </div>

          <button
            onClick={handleClearMonth}
            disabled={!selectedYM}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Zerar Mês Selecionado {selectedYM ? `(${monthLabel(selectedYM)})` : ''}
          </button>
        </div>

      </div>

    </div>
  );
};
