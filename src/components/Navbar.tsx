import React from 'react';
import { Heart, Settings, Download, RotateCcw, PiggyBank, Receipt, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'cofrinho' | 'orcamentos';
  setActiveTab: (tab: 'cofrinho' | 'orcamentos') => void;
  onOpenConfig: () => void;
  onOpenBackup: () => void;
  onOpenReset: () => void;
  progressPct: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenConfig,
  onOpenBackup,
  onOpenReset,
  progressPct,
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-30 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-rose-200 ring-2 ring-rose-200/50">
                <Heart className="w-5 h-5 fill-white text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-serif">
                    Meu Casamento
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <Sparkles className="w-3 h-3" /> {Math.min(100, Math.round(progressPct))}% Concluído
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Controle do cofrinho mensal e orçamentos do grande dia
                </p>
              </div>
            </div>

            {/* Mobile Header Buttons */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={onOpenConfig}
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenBackup}
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                title="Backup"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs & Actions */}
          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            <nav className="flex p-1 bg-rose-50/80 rounded-2xl border border-rose-100">
              <button
                onClick={() => setActiveTab('cofrinho')}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === 'cofrinho'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-300'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-white/60'
                }`}
              >
                <PiggyBank className="w-4 h-4" />
                Cofrinho
              </button>

              <button
                onClick={() => setActiveTab('orcamentos')}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === 'orcamentos'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-300'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-white/60'
                }`}
              >
                <Receipt className="w-4 h-4" />
                Orçamentos
              </button>
            </nav>

            {/* Desktop Header Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onOpenConfig}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-2xs"
              >
                <Settings className="w-3.5 h-3.5 text-rose-500" />
                Configurações
              </button>

              <button
                onClick={onOpenBackup}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" />
                Backup
              </button>

              <button
                onClick={onOpenReset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-2xs"
                title="Zera lançamentos mensais e orçamentos"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                Reset
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
