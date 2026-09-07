import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, X, Copy, Check } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');
  const [copied, setCopied] = useState(false);

  // Calcular com segurança
  const calculateResult = useCallback((expression: string) => {
    try {
      if (!expression.trim()) return '0';
      // Permite apenas números, operadores e parênteses
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/,/g, '.')
        .replace(/[^0-9+\-*/().%]/g, '');

      if (!sanitized) return '0';

      // Tratar porcentagem se aplicável (ex: 50*10% -> 50*0.1)
      const parsedWithPercent = sanitized.replace(/([0-9.]+)%/g, '($1/100)');

      // eslint-disable-next-line no-new-func
      const calc = new Function(`return ${parsedWithPercent}`)();
      if (typeof calc === 'number' && !isNaN(calc) && isFinite(calc)) {
        // Formatar para até 8 casas decimais sem zeros extras
        return Number(calc.toFixed(8)).toString();
      }
      return 'Erro';
    } catch {
      return 'Erro';
    }
  }, []);

  const handleInput = useCallback(
    (val: string) => {
      if (val === 'C') {
        setExpr('');
        setResult('0');
      } else if (val === '⌫') {
        setExpr((prev) => {
          const next = prev.slice(0, -1);
          setResult(next ? calculateResult(next) : '0');
          return next;
        });
      } else if (val === '=') {
        if (expr) {
          const res = calculateResult(expr);
          setResult(res);
          if (res !== 'Erro') {
            setExpr(res);
          }
        }
      } else if (val === '+/-') {
        setExpr((prev) => {
          if (!prev) return '-';
          if (prev.startsWith('-')) return prev.slice(1);
          return '-' + prev;
        });
      } else {
        setExpr((prev) => {
          const next = prev + val;
          // Se for operador, não atualiza o resultado parcial ainda
          if (!['+', '-', '×', '÷', '*'].includes(val)) {
            const preview = calculateResult(next);
            if (preview !== 'Erro') setResult(preview);
          }
          return next;
        });
      }
    },
    [expr, calculateResult]
  );

  const handleCopy = () => {
    const textToCopy = result !== '0' && result !== 'Erro' ? result : expr;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  // Suporte a teclado físico
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleInput('=');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleInput('⌫');
      } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '%'].includes(e.key)) {
        handleInput(e.key);
      } else if (e.key === '.' || e.key === ',') {
        handleInput('.');
      } else if (e.key === '+') {
        handleInput('+');
      } else if (e.key === '-') {
        handleInput('-');
      } else if (e.key === '*' || e.key === 'x') {
        handleInput('×');
      } else if (e.key === '/') {
        handleInput('÷');
      } else if (e.key.toLowerCase() === 'c') {
        handleInput('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleInput]);

  if (!isOpen) return null;

  const buttons = [
    { label: 'C', type: 'action' },
    { label: '⌫', type: 'action' },
    { label: '%', type: 'action' },
    { label: '÷', type: 'operator' },
    { label: '7', type: 'num' },
    { label: '8', type: 'num' },
    { label: '9', type: 'num' },
    { label: '×', type: 'operator' },
    { label: '4', type: 'num' },
    { label: '5', type: 'num' },
    { label: '6', type: 'num' },
    { label: '-', type: 'operator' },
    { label: '1', type: 'num' },
    { label: '2', type: 'num' },
    { label: '3', type: 'num' },
    { label: '+', type: 'operator' },
    { label: '+/-', type: 'num' },
    { label: '0', type: 'num' },
    { label: '.', type: 'num' },
    { label: '=', type: 'equals' },
  ];

  return (
    <>
      {/* Backdrop transparente para fechar ao clicar fora em telas menores */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none"
        onClick={onClose}
      />

      {/* Painel Flutuante da Calculadora */}
      <div className="fixed top-20 right-4 sm:right-8 z-50 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-200/90 dark:border-slate-800 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 select-none">
        {/* Header do card */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Calculadora
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                copied
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Copiar resultado"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Fechar calculadora"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="bg-slate-100/80 dark:bg-slate-950 rounded-2xl p-3.5 text-right border border-slate-200 dark:border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 dark:text-slate-500 h-5 truncate font-mono">
            {expr || '0'}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-amber-400 truncate tracking-tight font-mono">
            {result || '0'}
          </div>
        </div>

        {/* Grid de Teclas */}
        <div className="grid grid-cols-4 gap-1.5">
          {buttons.map((btn, idx) => {
            const isOp = btn.type === 'operator';
            const isAction = btn.type === 'action';
            const isEquals = btn.type === 'equals';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleInput(btn.label)}
                className={`h-11 sm:h-12 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center shadow-xs ${
                  isEquals
                    ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black shadow-md shadow-amber-500/30 text-base'
                    : isOp
                    ? 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60'
                    : isAction
                    ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
