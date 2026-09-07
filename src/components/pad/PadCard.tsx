import React, { useState } from 'react';
import { PadNote, PadColor } from '../../types/pad';
import { usePad } from '../../context/PadContext';
import { ColorPicker, PAD_COLORS } from './ColorPicker';
import {
  Pin,
  Trash2,
  Tag,
  CheckSquare,
} from 'lucide-react';

interface PadCardProps {
  note: PadNote;
  onEdit: (id: string) => void;
}

export const PadCard: React.FC<PadCardProps> = ({
  note,
  onEdit,
}) => {
  const { updateNote, deleteNote, tags } = usePad();
  const [showColors, setShowColors] = useState(false);

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNote(note.id, { isPinned: !note.isPinned });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Excluir esta anotação?')) {
      deleteNote(note.id);
    }
  };

  const handleColorSelect = (e: React.MouseEvent, c: PadColor) => {
    e.stopPropagation();
    updateNote(note.id, { color: c });
    setShowColors(false);
  };

  const colorObj = PAD_COLORS.find((c) => c.id === note.color) || PAD_COLORS[0];

  return (
    <div
      className={`group relative rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
        colorObj.bgClass
      } ${colorObj.borderClass} ${colorObj.darkBgClass} ${colorObj.darkBorderClass}`}
      onClick={() => onEdit(note.id)}
    >
      {/* Pinned Ribbon */}
      {note.isPinned && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 z-10" />
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0.5">
        <div className="flex items-center gap-0.5 z-10 relative">
          <button
            onClick={handleTogglePin}
            className={`p-1.5 rounded-md transition-colors ${
              note.isPinned
                ? 'text-amber-500'
                : `${colorObj.contentClass} opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10`
            }`}
            title={note.isPinned ? 'Fixado' : 'Fixar'}
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColors(!showColors);
            }}
            className={`p-1.5 rounded-md transition-colors ${colorObj.contentClass} opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10`}
            title="Mudar cor"
          >
            <Tag className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded-md transition-colors ${colorObj.contentClass} opacity-60 hover:opacity-100 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40`}
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Picker Popup */}
      {showColors && (
        <div
          className="absolute z-20 top-8 right-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <ColorPicker
            selectedColor={note.color}
            onSelectColor={(c) => handleColorSelect({ stopPropagation: () => {} } as React.MouseEvent, c)}
          />
        </div>
      )}

      {/* Title */}
      <div className="px-3.5 pt-1">
        <h3 className={`text-base font-bold leading-snug line-clamp-2 ${colorObj.titleClass}`}>
          {note.title || 'Sem título'}
        </h3>
      </div>

      {/* Content */}
      {note.content ? (
        <div className="px-3.5 pt-2 pb-2">
          <p className={`text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap ${colorObj.contentClass}`}>
            {note.content}
          </p>
        </div>
      ) : null}

      {/* Checklist Preview */}
      {note.checklist && note.checklist.length > 0 && (
        <div className="px-3.5 pb-2 space-y-1">
          {note.checklist.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                item.completed ? 'bg-amber-500 border-amber-600' : 'bg-transparent border-slate-400 dark:border-slate-500'
              }`}>
                {item.completed && (
                  <CheckSquare className="w-2.5 h-2.5 text-white" />
                )}
              </div>
              <span className={`truncate ${item.completed ? 'line-through opacity-60' : ''} ${colorObj.contentClass}`}>
                {item.text}
              </span>
            </div>
          ))}
          {note.checklist.length > 3 && (
            <span className={`text-[10px] opacity-70 ${colorObj.contentClass}`}>+{note.checklist.length - 3} mais</span>
          )}
        </div>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex items-center gap-1 px-3.5 pb-3 flex-wrap">
          {note.tags.map((tagName) => {
            const tagObj = tags.find((t) => t.name === tagName);
            return (
              <span
                key={tagName}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: tagObj ? `${tagObj.color}30` : '#64748b30',
                  color: tagObj ? tagObj.color : '#64748b',
                }}
              >
                #{tagName}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
