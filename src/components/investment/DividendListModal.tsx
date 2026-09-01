import React, { useState } from 'react';
import { Dividend } from '../../types/investment';
import { useInvestment } from '../../context/InvestmentContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Edit3, Trash2, Calendar, DollarSign, Plus } from 'lucide-react';
import { DividendFormModal } from './DividendFormModal';

interface DividendListModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetTicker: string;
}

const DIVIDEND_TYPE_LABELS: Record<string, string> = {
  dividend: 'Dividendo',
  jcp: 'JCP',
  income: 'Rendimento',
  bonus: 'Bonificação',
};

export const DividendListModal: React.FC<DividendListModalProps> = ({
  isOpen,
  onClose,
  assetId,
  assetTicker,
}) => {
  const { dividends, deleteDividend } = useInvestment();
  const [isDividendFormOpen, setIsDividendFormOpen] = useState(false);
  const [dividendToEdit, setDividendToEdit] = useState<Dividend | null>(null);

  // Filtrar dividendos deste ativo
  const assetDividends = dividends.filter(d => d.assetId === assetId);

  const handleEditDividend = (dividend: Dividend) => {
    setDividendToEdit(dividend);
    setIsDividendFormOpen(true);
  };

  const handleCloseDividendForm = () => {
    setDividendToEdit(null);
    setIsDividendFormOpen(false);
  };

  const handleDeleteDividend = (dividend: Dividend) => {
    if (confirm(`Deseja realmente excluir este ${DIVIDEND_TYPE_LABELS[dividend.type]}?`)) {
      deleteDividend(dividend.id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const totalReceived = assetDividends.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Dividendos de ${assetTicker}`}
        subtitle={`Gerencie os proventos recebidos deste ativo`}
      >
        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total Recebido em Proventos:
              </span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalReceived)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {assetDividends.length} {assetDividends.length === 1 ? 'lançamento' : 'lançamentos'}
            </p>
          </div>

          {/* Botão Adicionar */}
          <Button
            type="button"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsDividendFormOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Adicionar Novo Provento
          </Button>

          {/* Lista de Dividendos */}
          {assetDividends.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Nenhum provento registrado ainda
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assetDividends
                .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                .map(dividend => (
                  <div
                    key={dividend.id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-2 py-1 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                          {DIVIDEND_TYPE_LABELS[dividend.type]}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDividend(dividend)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDividend(dividend)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Data de Pagamento
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatDate(dividend.paymentDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                          Valor por Ação/Cota
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(dividend.amountPerShare)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                          Quantidade
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {dividend.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          Total Recebido
                        </p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(dividend.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {dividend.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <strong>Obs:</strong> {dividend.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Botão Fechar */}
          <div className="pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Formulário de Dividendo */}
      <DividendFormModal
        isOpen={isDividendFormOpen}
        onClose={handleCloseDividendForm}
        dividendToEdit={dividendToEdit}
      />
    </>
  );
};
