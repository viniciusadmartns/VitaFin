import React, { createContext, useContext, useState, ReactNode } from 'react';

type AppModule = 'vitafin' | 'vitainvest';

interface AppModuleContextType {
  currentModule: AppModule;
  setModule: (module: AppModule) => void;
  moduleConfig: {
    name: string;
    shortName: string;
    subtitle: string;
    gradient: string;
    accentColor: string;
    accentLight: string;
    icon: string;
    terminology: {
      expense: string;
      expenses: string;
      newExpense: string;
      category: string;
      categories: string;
      total: string;
      budget: string;
    };
  };
}

const AppModuleContext = createContext<AppModuleContextType | undefined>(undefined);

export const useAppModule = () => {
  const context = useContext(AppModuleContext);
  if (!context) {
    throw new Error('useAppModule deve ser usado dentro de AppModuleProvider');
  }
  return context;
};

const MODULE_CONFIGS = {
  vitafin: {
    name: 'VitaFin',
    shortName: 'Fin',
    subtitle: 'Gestão financeira inteligente',
    gradient: 'from-emerald-500 to-teal-500',
    accentColor: 'emerald',
    accentLight: 'emerald-50',
    icon: '💰',
    terminology: {
      expense: 'Gasto',
      expenses: 'Gastos',
      newExpense: 'Novo Gasto',
      category: 'Categoria',
      categories: 'Categorias',
      total: 'Total Gasto',
      budget: 'Orçamento',
    }
  },
  vitainvest: {
    name: 'VitaInvest',
    shortName: 'Invest',
    subtitle: 'Gestão de investimentos inteligente',
    gradient: 'from-blue-500 to-purple-600',
    accentColor: 'blue',
    accentLight: 'blue-50',
    icon: '📈',
    terminology: {
      expense: 'Aporte',
      expenses: 'Investimentos',
      newExpense: 'Novo Aporte',
      category: 'Tipo de Ativo',
      categories: 'Tipos de Ativo',
      total: 'Total Investido',
      budget: 'Meta de Investimento',
    }
  },
};

export const AppModuleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentModule, setCurrentModule] = useState<AppModule>(() => {
    const saved = localStorage.getItem('vita-current-module');
    return (saved as AppModule) || 'vitafin';
  });

  const setModule = (module: AppModule) => {
    setCurrentModule(module);
    localStorage.setItem('vita-current-module', module);
  };

  const moduleConfig = MODULE_CONFIGS[currentModule];

  return (
    <AppModuleContext.Provider value={{ currentModule, setModule, moduleConfig }}>
      {children}
    </AppModuleContext.Provider>
  );
};
