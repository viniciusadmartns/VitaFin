import React, { useState, useEffect } from 'react';
import { ChecklistItem, PadColor } from '../../types/pad';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { usePad } from '../../context/PadContext';
import { ColorPicker } from './ColorPicker';
import {
  Pin,
  Trash2,
  Copy,
  ListChecks,
  FileText,
  Plus,
  X,
  Tag as TagIcon,
} from 'lucide-react';

interface PadModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string | null;
}

type Mode = 'text' | 'checklist';

export const PadModal: React.FC<PadModalProps> = ({ isOpen, onClose, noteId }) => {
  const { notes, updateNote, deleteNote, addNote, tags } = usePad();
  const [mode, setMode] = useState<Mode>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<PadColor>('default');
  const [isPinned, setIsPinned] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const isEditing = Boolean(noteId);
  const note = notes.find((n) => n.id === noteId);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setColor(note.color || 'default');
        setIsPinned(note.isPinned || false);
        setChecklist(note.checklist || []);
        setSelectedTags(note.tags || []);
        setMode(note.checklist && note.checklist.length > 0 ? 'checklist' : 'text');
      } else {
        setTitle('');
        setContent('');
        setColor('default');
        setIsPinned(false);
        setChecklist([]);
        setSelectedTags([]);
        setMode('text');
      }
      setNewItemText('');
    }
  }, [noteId, isOpen, note]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const hasChecklist = checklist.length > 0;

    // Se estiver criando e nada foi preenchido, apenas fecha sem criar nota fantasma
    if (!isEditing && !trimmedTitle && !trimmedContent && !hasChecklist) {
      onClose();
      return;
    }

    if (isEditing && note) {
      updateNote(note.id, {
        title: trimmedTitle,
        content: trimmedContent,
        color,
        isPinned,
        checklist,
        tags: selectedTags,
      });
    } else if (!isEditing) {
      addNote({
        title: trimmedTitle,
        content: trimmedContent,
        color,
        isPinned,
        isArchived: false,
        isFavorite: false,
        tags: selectedTags,
        checklist,
        orderIndex: 0,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (note && window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      deleteNote(note.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    if (note) {
      addNote({
        title: (title ? title + ' (cópia)' : 'Cópia'),
        content,
        color,
        isPinned,
        isArchived: false,
        isFavorite: false,
        tags: selectedTags,
        checklist,
        orderIndex: 0,
      });
      onClose();
    }
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newItemText.trim();
    if (!text) return;
    setChecklist((prev) => [
      ...prev,
      { id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, text, completed: false },
    ]);
    setNewItemText('');
  };

  const handleToggleItem = (id: string) => {
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  };

  const handleRemoveItem = (id: string) => {
    setChecklist((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSave}
      title={isEditing ? 'Editar Anotação' : 'Nova Anotação'}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Header com ações */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isPinned
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isPinned ? 'Desafixar nota' : 'Fixar no topo'}
            >
              <Pin className="w-4 h-4" />
              <span>{isPinned ? 'Fixada' : 'Fixar'}</span>
            </button>

            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  title="Duplicar anotação"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Toggle Modo: Texto / Checklist */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                mode === 'text'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-amber-600 dark:text-amber-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Texto
            </button>
            <button
              type="button"
              onClick={() => setMode('checklist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                mode === 'checklist'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-amber-600 dark:text-amber-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" /> Checklist
            </button>
          </div>
        </div>

        {/* Título */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (opcional)..."
            className="w-full text-lg sm:text-xl font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Conteúdo */}
        {mode === 'text' ? (
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite suas anotações, ideias, lembretes..."
              rows={6}
              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none transition-colors leading-relaxed"
            />
          </div>
        ) : (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {checklist.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic py-3 text-center font-medium">
                Nenhum item na lista de tarefas. Adicione itens abaixo.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm group"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <span
                      className={`flex-1 text-sm font-medium ${
                        item.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="opacity-70 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleAddChecklistItem} className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Adicionar tarefa..."
                className="flex-1 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Cor do Bloco */}
        <div className="space-y-1.5 pt-1">
          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Cor do Bloco (Post-it)
          </h4>
          <ColorPicker selectedColor={color} onSelectColor={setColor} />
        </div>

        {/* Marcadores */}
        {tags.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-amber-500" />
              Marcadores
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((t) => {
                const isSelected = selectedTags.includes(t.name);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.name)}
                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'ring-2 ring-amber-500/50 shadow-sm'
                        : 'opacity-70 hover:opacity-100 bg-white dark:bg-slate-900'
                    }`}
                    style={{
                      backgroundColor: isSelected ? t.color : undefined,
                      borderColor: t.color,
                      color: isSelected ? '#ffffff' : t.color,
                    }}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold px-5"
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
