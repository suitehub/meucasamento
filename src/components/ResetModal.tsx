import React from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-rose-100 shadow-xl max-w-md w-full p-6 space-y-4 overflow-hidden"
      >
        <div className="flex items-center gap-3 text-rose-600">
          <div className="p-3 bg-rose-100 rounded-2xl">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 font-serif">
              Confirmar Reinicialização
            </h2>
            <p className="text-xs text-slate-500">Ação irreversível</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
          Tem certeza de que deseja zerar <b>todos os lançamentos mensais</b> e{' '}
          <b>todos os orçamentos cadastrados</b>? Suas configurações de metas e datas serão mantidas.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Sim, Zerar Tudo
          </button>
        </div>
      </motion.div>
    </div>
  );
};
