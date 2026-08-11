import React, { useState, useEffect, useRef } from 'react';
import { AppState, Config } from './types';
import { loadState, saveState, totalAccumulated, safeInt } from './utils/helpers';
import { Navbar } from './components/Navbar';
import { SavingsTab } from './components/SavingsTab';
import { BudgetsTab } from './components/BudgetsTab';
import { ConfigModal } from './components/ConfigModal';
import { BackupModal } from './components/BackupModal';
import { ResetModal } from './components/ResetModal';
import { LoginModal } from './components/LoginModal';
import { AdviceBanner } from './components/AdviceBanner';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  signInWithCredentials,
  logoutUser,
  saveWeddingToFirestore,
  getWeddingFromFirestore,
  subscribeToWedding
} from './firebase';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [activeTab, setActiveTab] = useState<'cofrinho' | 'orcamentos'>('cofrinho');
  const [user, setUser] = useState<User | null>(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Ref to track if data change is from local user interaction vs cloud sync
  const isCloudSyncRef = useRef(false);

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time updates when user is logged in
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToWedding(user.uid, (cloudState) => {
      isCloudSyncRef.current = true;
      setState(cloudState);
      saveState(cloudState);
      setTimeout(() => {
        isCloudSyncRef.current = false;
      }, 300);
    });

    return () => unsubscribe();
  }, [user]);

  // Auto-save state to localStorage and Firestore
  useEffect(() => {
    saveState(state);

    if (user && !isCloudSyncRef.current) {
      saveWeddingToFirestore(user.uid, state);
    }
  }, [state, user]);

  const handleManualSave = () => {
    saveState(state);
    if (user) {
      saveWeddingToFirestore(user.uid, state);
    }
  };

  const handleLogin = async (username: string, pass: string) => {
    const loggedUser = await signInWithCredentials(username, pass);
    if (loggedUser) {
      const cloudData = await getWeddingFromFirestore(loggedUser.uid);
      if (cloudData) {
        isCloudSyncRef.current = true;
        setState(cloudData);
        saveState(cloudData);
        setTimeout(() => {
          isCloudSyncRef.current = false;
        }, 300);
      } else {
        await saveWeddingToFirestore(loggedUser.uid, state);
      }
    }
  };

  const handleImportBackup = (newState: AppState) => {
    setState(newState);
    saveState(newState);
    if (user) {
      saveWeddingToFirestore(user.uid, newState);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
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
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
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
          {user
            ? `Sincronizado na Nuvem (Firebase) para a conta ${user.email?.split('@')[0] || 'casamento'}`
            : 'Dados salvos localmente no navegador (Offline-First) • Clique em Login para sincronizar na nuvem.'}
        </p>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

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
        onImportState={handleImportBackup}
        user={user}
      />

      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

    </div>
  );
}

