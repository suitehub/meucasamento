import React, { useState } from 'react';
import { X, Lock, User as UserIcon, LogIn, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, pass: string) => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState('casamento');
  const [password, setPassword] = useState('261223');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha o usuário e a senha.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await onLogin(username, password);
      onClose();
    } catch (error) {
      console.error(error);
      setErrorMessage('Erro ao realizar o login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDefaults = () => {
    setUsername('casamento');
    setPassword('261223');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-xl border border-rose-100 max-w-md w-full p-6 overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500 rounded-2xl text-white shadow-sm">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-serif">
                Entrar no Meu Casamento
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sincronize seu planejamento entre PC e Celular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMessage ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Usuário / Login
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: casamento"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:border-rose-400 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ex: 261223"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:border-rose-400 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Preset info box */}
          <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-rose-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Usar dados padrão (<strong>casamento</strong> / <strong>261223</strong>)</span>
            </div>
            <button
              type="button"
              onClick={fillDefaults}
              className="px-2.5 py-1 bg-white text-rose-600 hover:bg-rose-100/50 border border-rose-200 rounded-lg text-[11px] font-bold transition-all shrink-0"
            >
              Preencher
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Entrando...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
