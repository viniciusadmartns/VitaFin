import React, { useState } from 'react';
import { usePad } from '../../context/PadContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const TagManagerModal: React.FC<TagManagerModalProps> = ({ isOpen, onClose }) => {
  const { tags, addTag, deleteTag } = usePad();
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLOR_OPTIONS[0]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    addTag({
      name: newTagName.trim(),
      color: selectedColor,
    });
    setNewTagName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Marcadores (Tags)">
      <div className="space-y-6">
        {/* Criar nova Tag */}
        <form onSubmit={handleAdd} className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            Novo Marcador
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Trabalho, Ideias, Estudos..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newTagName.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
            >
              Criar
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cor:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {TAG_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full border border-black/10 transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-amber-500 ring-offset-1' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </form>

        {/* Lista de tags existentes */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Marcadores Cadastrados ({tags.length})
          </h4>

          {tags.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-3 text-center">
              Nenhum marcador criado ainda.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {tags.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {t.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteTag(t.id)}
                    className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Excluir marcador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
