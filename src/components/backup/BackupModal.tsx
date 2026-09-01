import React, { useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useFinance } from '../../context/FinanceContext';
import { exportBackupJSON, validateAndParseBackup } from '../../utils/export';
import {
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { expenses, categories, budgets, importData, resetToDefaults } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleExportJSON = () => {
    try {
      exportBackupJSON(expenses, categories, budgets);
      setMessage({ text: 'Backup exportado com sucesso!', type: 'success' });
    } catch {
      setMessage({ text: 'Erro ao exportar backup.', type: 'error' });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = validateAndParseBackup(content);
        importData(parsed);
        setMessage({
          text: `Backup restaurado com sucesso! (${parsed.expenses?.length || 0} gastos, ${parsed.categories?.length || 0} categorias)`,
          type: 'success',
        });
      } catch (err: any) {
        setMessage({
          text: err.message || 'Falha ao importar o arquivo.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gerenciamento de Dados & Backup"
        subtitle="Exporte seus registros, restaure dados ou reinicie o aplicativo"
        maxWidth="md"
      >
        <div className="space-y-4">
          {message && (
            <div
              className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Current stats info */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-around text-center">
            <div>
              <span className="block text-lg font-bold text-slate-900 dark:text-white">
                {expenses.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Gastos Totais
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="block text-lg font-bold text-slate-900 dark:text-white">
                {categories.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Categorias
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="block text-lg font-bold text-slate-900 dark:text-white">
                {budgets.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Metas
              </span>
            </div>
          </div>

          {/* Export card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Exportar Backup (JSON)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gera um arquivo de segurança com todas as suas despesas e tipos de gastos.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
            >
              Exportar
            </Button>
          </div>

          {/* Import card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Restaurar Backup (JSON)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecione um arquivo de backup previamente exportado.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Importar
            </Button>
          </div>

          {/* Reset card */}
          <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-950/80 bg-rose-50/30 dark:bg-rose-950/20 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Restaurar Padrões de Fábrica
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Limpa os dados atuais e restaura as categorias padrão iniciais.
              </p>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
            >
              Restaurar
            </Button>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetToDefaults();
          setMessage({ text: 'Dados restaurados para o estado inicial!', type: 'success' });
        }}
        title="Restaurar Configurações Padrão"
        message="Esta ação substituirá os gastos e categorias pelos exemplos iniciais. Deseja continuar?"
        confirmText="Sim, Restaurar"
      />
    </>
  );
};
