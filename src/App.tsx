import React, { useState, useEffect } from 'react';
import { AppState, Config } from './types';
import { loadState, saveState, totalAccumulated, safeInt } from './utils/helpers';
import { Navbar } from './components/Navbar';
import { SavingsTab } from './components/SavingsTab';
import { BudgetsTab } from './components/BudgetsTab';
import { ConfigModal } from './components/ConfigModal';
import { BackupModal } from './components/BackupModal';
import { ResetModal } from './components/ResetModal';
import { AdviceBanner } from './components/AdviceBanner';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [activeTab, setActiveTab] = useState<'cofrinho' | 'orcamentos'>('cofrinho');

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Auto-save on state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleManualSave = () => {
    saveState(state);
  };

  const handleSaveConfig = (newConfig: Config) => {
    setState((prev) => ({
      ...prev,
      config: newConfig,
    }));
  };

  const handleConfirmReset = () => {
    setState((prev) => ({
      ...prev,
      entries: {},
      budgets: [],
    }));
  };

  const total = totalAccumulated(state);
  const goal = safeInt(state.config.goal);
  const progressPct = goal > 0 ? (total / goal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/30 text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-800 pb-16">
      
      {/* Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
        progressPct={progressPct}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Advice & Inspiration Banner */}
        <AdviceBanner progressPct={progressPct} guests={state.config.guests} />

        {/* Tab Panels */}
        <AnimatePresence mode="wait">
          {activeTab === 'cofrinho' ? (
            <motion.div
              key="cofrinho"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SavingsTab state={state} setState={setState} onSave={handleManualSave} />
            </motion.div>
          ) : (
            <motion.div
              key="orcamentos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <BudgetsTab state={state} setState={setState} onSave={handleManualSave} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* App Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-slate-400 space-y-1">
        <p className="font-medium">
          Meu Casamento • Organização Financeira para Casais 💕
        </p>
        <p className="text-[11px] text-slate-400">
          Dados salvos localmente no navegador (Offline-First) • Lembre-se de fazer backup periodicamente.
        </p>
      </footer>

      {/* Modals */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={state.config}
        onSaveConfig={handleSaveConfig}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        state={state}
        onImportState={(newState) => setState(newState)}
      />

      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

    </div>
  );
}
