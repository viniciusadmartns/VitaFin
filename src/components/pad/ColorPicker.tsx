import React from 'react';
import { PadColor } from '../../types/pad';
import { Check } from 'lucide-react';

export interface PadColorConfig {
  id: PadColor;
  name: string;
  bgClass: string;
  borderClass: string;
  darkBgClass: string;
  darkBorderClass: string;
  dotClass: string;
  titleClass: string;
  contentClass: string;
}

export const PAD_COLORS: PadColorConfig[] = [
  {
    id: 'default',
    name: 'Padrão',
    bgClass: 'bg-white',
    borderClass: 'border-slate-200 shadow-sm hover:border-slate-300',
    darkBgClass: 'dark:bg-slate-900',
    darkBorderClass: 'dark:border-slate-800 dark:hover:border-slate-700',
    dotClass: 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600',
    titleClass: 'text-slate-900 dark:text-white',
    contentClass: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'amber',
    name: 'Amarelo Post-it',
    bgClass: 'bg-amber-100',
    borderClass: 'border-amber-300 shadow-sm hover:border-amber-400',
    darkBgClass: 'dark:bg-amber-950/80',
    darkBorderClass: 'dark:border-amber-600/80 dark:hover:border-amber-500',
    dotClass: 'bg-amber-300 border-amber-400',
    titleClass: 'text-amber-950 dark:text-amber-100',
    contentClass: 'text-amber-900 dark:text-amber-200',
  },
  {
    id: 'emerald',
    name: 'Verde Menta',
    bgClass: 'bg-emerald-100',
    borderClass: 'border-emerald-300 shadow-sm hover:border-emerald-400',
    darkBgClass: 'dark:bg-emerald-950/80',
    darkBorderClass: 'dark:border-emerald-600/80 dark:hover:border-emerald-500',
    dotClass: 'bg-emerald-300 border-emerald-400',
    titleClass: 'text-emerald-950 dark:text-emerald-100',
    contentClass: 'text-emerald-900 dark:text-emerald-200',
  },
  {
    id: 'blue',
    name: 'Azul Céu',
    bgClass: 'bg-blue-100',
    borderClass: 'border-blue-300 shadow-sm hover:border-blue-400',
    darkBgClass: 'dark:bg-blue-950/80',
    darkBorderClass: 'dark:border-blue-600/80 dark:hover:border-blue-500',
    dotClass: 'bg-blue-300 border-blue-400',
    titleClass: 'text-blue-950 dark:text-blue-100',
    contentClass: 'text-blue-900 dark:text-blue-200',
  },
  {
    id: 'purple',
    name: 'Lavanda',
    bgClass: 'bg-purple-100',
    borderClass: 'border-purple-300 shadow-sm hover:border-purple-400',
    darkBgClass: 'dark:bg-purple-950/80',
    darkBorderClass: 'dark:border-purple-600/80 dark:hover:border-purple-500',
    dotClass: 'bg-purple-300 border-purple-400',
    titleClass: 'text-purple-950 dark:text-purple-100',
    contentClass: 'text-purple-900 dark:text-purple-200',
  },
  {
    id: 'rose',
    name: 'Rosa Chiclete',
    bgClass: 'bg-rose-100',
    borderClass: 'border-rose-300 shadow-sm hover:border-rose-400',
    darkBgClass: 'dark:bg-rose-950/80',
    darkBorderClass: 'dark:border-rose-600/80 dark:hover:border-rose-500',
    dotClass: 'bg-rose-300 border-rose-400',
    titleClass: 'text-rose-950 dark:text-rose-100',
    contentClass: 'text-rose-900 dark:text-rose-200',
  },
  {
    id: 'orange',
    name: 'Laranja Pêssego',
    bgClass: 'bg-orange-100',
    borderClass: 'border-orange-300 shadow-sm hover:border-orange-400',
    darkBgClass: 'dark:bg-orange-950/80',
    darkBorderClass: 'dark:border-orange-600/80 dark:hover:border-orange-500',
    dotClass: 'bg-orange-300 border-orange-400',
    titleClass: 'text-orange-950 dark:text-orange-100',
    contentClass: 'text-orange-900 dark:text-orange-200',
  },
  {
    id: 'cyan',
    name: 'Turquesa',
    bgClass: 'bg-cyan-100',
    borderClass: 'border-cyan-300 shadow-sm hover:border-cyan-400',
    darkBgClass: 'dark:bg-cyan-950/80',
    darkBorderClass: 'dark:border-cyan-600/80 dark:hover:border-cyan-500',
    dotClass: 'bg-cyan-300 border-cyan-400',
    titleClass: 'text-cyan-950 dark:text-cyan-100',
    contentClass: 'text-cyan-900 dark:text-cyan-200',
  },
  {
    id: 'slate',
    name: 'Cinza Grafite',
    bgClass: 'bg-slate-200',
    borderClass: 'border-slate-300 shadow-sm hover:border-slate-400',
    darkBgClass: 'dark:bg-slate-800',
    darkBorderClass: 'dark:border-slate-600 dark:hover:border-slate-500',
    dotClass: 'bg-slate-300 border-slate-400 dark:bg-slate-700 dark:border-slate-500',
    titleClass: 'text-slate-900 dark:text-white',
    contentClass: 'text-slate-800 dark:text-slate-200',
  },
];

interface ColorPickerProps {
  selectedColor: PadColor;
  onSelectColor: (color: PadColor) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onSelectColor,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {PAD_COLORS.map((c) => {
        const isSelected = selectedColor === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectColor(c.id);
            }}
            className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full ${c.dotClass} border-2 flex items-center justify-center transition-all duration-150 ${
              isSelected
                ? 'scale-110 ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 shadow-sm'
                : 'hover:scale-110 opacity-90 hover:opacity-100'
            }`}
            title={c.name}
            aria-label={c.name}
          >
            {isSelected && (
              <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white stroke-[3]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
