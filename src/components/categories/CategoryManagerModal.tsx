import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Category } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { renderCategoryIcon } from '../../utils/icons';
import { Plus, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react';
import { CategoryModal } from './CategoryModal';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewCategory?: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { categories, expenses, deleteCategory } = useFinance();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleNew = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const initiateDelete = (cat: Category) => {
    setCategoryToDelete(cat);
    setErrorMessage('');
    const otherCategories = categories.filter((c) => c.id !== cat.id);
    if (otherCategories.length > 0) {
      setReassignTargetId(otherCategories[0].id);
    }
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;

    const linkedCount = expenses.filter((e) => e.categoryId === categoryToDelete.id).length;

    if (linkedCount > 0 && !reassignTargetId) {
      setErrorMessage('Por favor, selecione para qual categoria transferir os gastos existentes.');
      return;
    }

    const result = deleteCategory(
      categoryToDelete.id,
      linkedCount > 0 ? reassignTargetId : undefined
    );

    if (!result.success) {
      setErrorMessage(result.error || 'Não foi possível excluir esta categoria.');
      return;
    }

    setCategoryToDelete(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Tipos de Gasto (Categorias)"
        subtitle="Gerencie e personalize todas as categorias para lançar seus gastos"
        maxWidth="xl"
      >
        <div className="space-y-4">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {categories.length} categoria(s) cadastrada(s)
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleNew}
            >
              Novo Tipo de Gasto
            </Button>
          </div>

          {/* List of Categories */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            {categories.map((cat) => {
              const expenseCount = expenses.filter((e) => e.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      {renderCategoryIcon(cat.icon, 'w-5 h-5')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {cat.name}
                        </span>
                        {cat.isDefault && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                            Padrão
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {expenseCount} {expenseCount === 1 ? 'gasto registrado' : 'gastos registrados'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                      title="Editar categoria"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => initiateDelete(cat)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="Excluir categoria"
                      disabled={categories.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8">
              <Tag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhuma categoria encontrada.</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Concluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        categoryToEdit={editingCategory}
      />

      {/* Delete Confirmation Dialog with Reassign */}
      {categoryToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setCategoryToDelete(null)}
          title="Excluir Tipo de Gasto"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs leading-relaxed">
                Você está prestes a excluir a categoria <strong>{categoryToDelete.name}</strong>.
              </p>
            </div>

            {(() => {
              const count = expenses.filter((e) => e.categoryId === categoryToDelete.id).length;
              if (count > 0) {
                return (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Existem <strong>{count}</strong> gasto(s) vinculados a esta categoria. Escolha para onde transferi-los:
                    </p>
                    <select
                      value={reassignTargetId}
                      onChange={(e) => setReassignTargetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      {categories
                        .filter((c) => c.id !== categoryToDelete.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            Mover para: {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                );
              }
              return (
                <p className="text-xs text-slate-500">
                  Nenhum gasto está vinculado a esta categoria. Ela será removida com segurança.
                </p>
              );
            })()}

            {errorMessage && (
              <p className="text-xs text-rose-500 font-medium">{errorMessage}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCategoryToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={confirmDelete}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
