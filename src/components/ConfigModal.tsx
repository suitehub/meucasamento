import React, { useState, useEffect } from 'react';
import { Config } from '../types';
import { safeInt, cmpYM } from '../utils/helpers';
import { Settings, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Config;
  onSaveConfig: (newConfig: Config) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [goal, setGoal] = useState<string>('');
  const [initial, setInitial] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [wedding, setWedding] = useState<string>('');
  const [rate1, setRate1] = useState<string>('');
  const [rate2, setRate2] = useState<string>('');
  const [yellowPct, setYellowPct] = useState<string>('');
  const [guests, setGuests] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setGoal(String(config.goal));
      setInitial(String(config.initial));
      setStart(config.start);
      setWedding(config.wedding);
      setRate1(String(config.rate1));
      setRate2(String(config.rate2));
      setYellowPct(String(config.yellowPct));
      setGuests(String(config.guests));
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStart = start || config.start;
    const newWedding = wedding || config.wedding;

    if (cmpYM(newStart, newWedding) > 0) {
      alert('O início do plano não pode ser depois do mês do casamento.');
      return;
    }

    const newCfg: Config = {
      goal: safeInt(goal),
      initial: safeInt(initial),
      start: newStart,
      wedding: newWedding,
      rate1: safeInt(rate1),
      rate2: safeInt(rate2),
      yellowPct: Math.max(1, Math.min(100, safeInt(yellowPct) || 90)),
      guests: safeInt(guests),
    };

    onSaveConfig(newCfg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-rose-100 shadow-xl max-w-xl w-full p-6 space-y-5 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 font-serif">
                Configurações do Plano
              </h2>
              <p className="text-xs text-slate-500">
                Ajuste os parâmetros financeiros e datas do casamento.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            
            <div>
              <label className="block text-slate-600 mb-1">Meta Total (R$)</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Valor Inicial Guardado (R$)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={initial}
                onChange={(e) => setInitial(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Início do Plano (YYYY-MM)</label>
              <input
                type="month"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Mês do Casamento (YYYY-MM)</label>
              <input
                type="month"
                required
                value={wedding}
                onChange={(e) => setWedding(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Alvo Mensal Fase 1 (2026) – R$</label>
              <input
                type="number"
                min="0"
                step="1"
                value={rate1}
                onChange={(e) => setRate1(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Alvo Mensal Fase 2 (2027+) – R$</label>
              <input
                type="number"
                min="0"
                step="1"
                value={rate2}
                onChange={(e) => setRate2(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Margem Amarela (% ex.: 90)</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={yellowPct}
                onChange={(e) => setYellowPct(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white text-slate-800 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Abaixo dessa porcentagem vira alerta vermelho.
              </span>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Número de Convidados</label>
              <input
                type="number"
                min="1"
                step="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:bg-white text-slate-800 font-bold"
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-rose-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Configurações
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
