import React, { useState, useEffect } from 'react';
import { usePad } from '../../context/PadContext';
import { PadCard } from './PadCard';
import { PadModal } from './PadModal';
import { Search, Pin } from 'lucide-react';
import { CalculatorModal } from './CalculatorModal';

export const PadDashboard: React.FC = () => {
  const {
    notes,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    tags,
    openEditNote,
    isModalOpen,
    activeNoteId,
    closeNoteModal,
    viewMode,
    toggleViewMode,
  } = usePad();

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsCalculatorOpen(true);
    const handleToggle = () => toggleViewMode();
    window.addEventListener('open-calculator', handleOpen);
    window.addEventListener('toggle-vitapad-view', handleToggle);
    return () => {
      window.removeEventListener('open-calculator', handleOpen);
      window.removeEventListener('toggle-vitapad-view', handleToggle);
    };
  }, [toggleViewMode]);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      !searchQuery ||
      (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (n.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6">
      {/* Barra de busca + tags */}
      <div className="flex flex-col gap-3">
        {/* Busca e Visualização */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0 bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm transition-colors">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar notas, tags, conteúdo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm font-medium text-amber-950 dark:text-amber-50 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors shrink-0"
            >
              Limpar
            </button>
          )}
        </div>
        </div>

        {/* Tags filtro */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                !selectedTag
                  ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
              }`}
            >
              Todas
            </button>
            {tags.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
                className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                  selectedTag === t.name
                    ? 'text-white shadow-sm shadow-amber-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                }`}
                style={
                  selectedTag === t.name
                    ? { backgroundColor: t.color, borderColor: t.color }
                    : { color: t.color, borderColor: t.color + '50' }
                }
              >
                #{t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blocos de notas */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600">
          <p className="text-base font-medium text-slate-500 dark:text-slate-400">Nenhuma anotação encontrada.</p>
          <p className="text-xs mt-1">Tente outro termo ou crie uma nova nota.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest px-1">
                <Pin className="w-4 h-4" /> Fixadas
              </h3>
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3 max-w-4xl mx-auto"}>
                {pinnedNotes.map((note) => (
                  <PadCard key={note.id} note={note} onEdit={openEditNote} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {pinnedNotes.length > 0 && (
              <h3 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest px-1">
                Outras
              </h3>
            )}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3 max-w-4xl mx-auto"}>
              {otherNotes.map((note) => (
                <PadCard key={note.id} note={note} onEdit={openEditNote} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Nota */}
      <PadModal isOpen={isModalOpen} onClose={closeNoteModal} noteId={activeNoteId} />

      {/* Calculadora Flutuante */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
};
