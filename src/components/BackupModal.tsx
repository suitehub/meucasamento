import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { DEFAULTS, STORAGE_KEY } from '../utils/helpers';
import { Download, Upload, Copy, Check, X, FileJson, Database, RefreshCw, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onImportState: (importedState: AppState) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  state,
  onImportState,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [localFoundData, setLocalFoundData] = useState<AppState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Set current state as formatted JSON
      setJsonText(JSON.stringify(state, null, 2));

      // Check if localStorage has existing indexcasamento data ('meu_casamento_v2')
      try {
        const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('meu_casamento');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && parsed.config) {
            setLocalFoundData(parsed);
          }
        }
      } catch {
        setLocalFoundData(null);
      }
    }
  }, [isOpen, state]);

  if (!isOpen) return null;

  // 1. Download .json file
  const handleDownloadFile = () => {
    const formatted = JSON.stringify(state, null, 2);
    const blob = new Blob([formatted], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu_casamento_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2. Copy JSON to Clipboard
  const handleCopyJson = () => {
    const formatted = JSON.stringify(state, null, 2);
    setJsonText(formatted);
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 3. Import from File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        applyImport(parsed);
      } catch (err) {
        alert('O arquivo selecionado não é um JSON de backup válido.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (e.target) e.target.value = '';
  };

  // 4. Import from Textarea
  const handleImportText = () => {
    if (!jsonText.trim()) {
      alert('Cole o JSON de backup antes de importar.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText.trim());
      applyImport(parsed);
    } catch (err) {
      alert('Não foi possível importar. Certifique-se de que o texto é um JSON válido.');
    }
  };

  // Helper to validate and set state
  const applyImport = (parsed: any) => {
    if (!parsed || typeof parsed !== 'object' || !parsed.config) {
      alert('Formato de dados inválido. O arquivo precisa conter a chave "config".');
      return;
    }

    const merged: AppState = structuredClone(DEFAULTS);
    merged.config = { ...merged.config, ...(parsed.config || {}) };
    merged.entries = { ...(parsed.entries || {}) };
    merged.budgets = Array.isArray(parsed.budgets) ? parsed.budgets : [];

    onImportState(merged);
    onClose();
    alert('Dados do seu casamento importados com sucesso!');
  };

  const handleImportLocalStorage = () => {
    if (!localFoundData) return;
    if (confirm('Deseja carregar os dados salvos do indexcasamento / LocalStorage original?')) {
      applyImport(localFoundData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-rose-100 shadow-xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 font-serif">
                Gerenciador de Backup (Exportar / Importar)
              </h2>
              <p className="text-xs text-slate-500">
                Guarde uma cópia segura dos seus lançamentos ou restaure dados do script original.
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

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* EXPORT OPTIONS */}
          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <Download className="w-4 h-4" /> Opções de Exportação
            </div>
            
            <button
              onClick={handleDownloadFile}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.99]"
            >
              <Download className="w-3.5 h-3.5" /> Baixar Arquivo .JSON
            </button>

            <button
              onClick={handleCopyJson}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-rose-50 text-slate-700 font-semibold text-xs rounded-xl border border-rose-200 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-rose-500" />}
              {copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto JSON'}
            </button>
          </div>

          {/* IMPORT OPTIONS */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Upload className="w-4 h-4 text-rose-500" /> Opções de Importação
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-rose-500" /> Carregar Arquivo .JSON
            </button>

            {localFoundData && (
              <button
                onClick={handleImportLocalStorage}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all"
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" /> Restaurar do LocalStorage ({Object.keys(localFoundData.entries || {}).length} meses)
              </button>
            )}
          </div>

        </div>

        {/* JSON Code Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600">
              Editor / Visualizador do Código JSON:
            </label>
            <span className="text-[10px] text-slate-400">Edite ou cole manualmente se preferir</span>
          </div>
          <textarea
            rows={7}
            spellCheck={false}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='O código JSON do seu app aparecerá aqui...'
            className="w-full p-3 text-xs font-mono bg-slate-900 text-emerald-400 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 leading-relaxed"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-rose-100">
          <p className="text-[11px] text-slate-400">
            Importar dados substitui os registros atuais.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleImportText}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar Texto
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

