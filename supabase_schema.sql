-- ==============================================================================
-- 🌿 VitaFin & 📈 VitaInvest - Script de Criação & Atualização do Banco de Dados (Supabase PostgreSQL)
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Clique em "+ New query" (Nova consulta)
-- 4. Cole todo este código SQL abaixo e clique no botão "Run" (Executar)
-- ==============================================================================

-- 1. Habilitar extensão de UUID (caso não esteja ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 🌿 1. TABELAS DO VITAFIN (Finanças Pessoais)
-- ==============================================================================

-- Tabela de Categorias (Despesas & Receitas)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT DEFAULT 'expense', -- 'expense' ou 'income'
    is_default BOOLEAN DEFAULT FALSE,
    budget_limit NUMERIC(12,2) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Garantir coluna 'type' caso a tabela já exista de versões anteriores
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense';

-- Tabela de Lançamentos (Despesas & Receitas com parcelamento)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    date DATE NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    type TEXT DEFAULT 'expense', -- 'expense' ou 'income'
    payment_method TEXT DEFAULT 'pix',
    notes TEXT DEFAULT NULL,
    installment_group_id TEXT DEFAULT NULL,
    installment_number INTEGER DEFAULT NULL,
    total_installments INTEGER DEFAULT NULL,
    installment_total_amount NUMERIC(12,2) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Garantir coluna 'type' caso a tabela já exista de versões anteriores
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense';

-- Tabela de Metas / Orçamento Mensal
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Formato 'YYYY-MM', ex: '2026-08'
    limit_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_month_budget UNIQUE (user_id, month)
);

-- ==============================================================================
-- 📈 2. TABELAS DO VITAINVEST (Investimentos, Ativos, Transações e Proventos)
-- ==============================================================================

-- Tabela de Ativos da Carteira (Ações, FIIs, Renda Fixa, ETFs, Criptos, etc.)
CREATE TABLE IF NOT EXISTS public.investment_assets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'stock', 'fund', 'fixed-income', 'crypto', 'reit', 'etf', 'other'
    quantity NUMERIC(15,4) NOT NULL DEFAULT 0,
    average_price NUMERIC(15,4) NOT NULL DEFAULT 0,
    current_price NUMERIC(15,4) NOT NULL DEFAULT 0,
    total_invested NUMERIC(15,2) NOT NULL DEFAULT 0,
    current_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    profit_loss NUMERIC(15,2) NOT NULL DEFAULT 0,
    profit_loss_percent NUMERIC(10,4) NOT NULL DEFAULT 0,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela de Transações de Investimento (Compra e Venda)
CREATE TABLE IF NOT EXISTS public.investment_transactions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL REFERENCES public.investment_assets(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    type TEXT NOT NULL, -- 'buy' ou 'sell'
    quantity NUMERIC(15,4) NOT NULL,
    price NUMERIC(15,4) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    fees NUMERIC(12,2) DEFAULT 0,
    date DATE NOT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Proventos / Dividendos / Rendimentos
CREATE TABLE IF NOT EXISTS public.investment_dividends (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL REFERENCES public.investment_assets(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    type TEXT NOT NULL, -- 'dividend', 'jcp', 'income', 'bonus'
    amount_per_share NUMERIC(15,4) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    quantity NUMERIC(15,4) NOT NULL,
    payment_date DATE NOT NULL,
    reference_date DATE DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 🔒 POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- Garante que cada usuário acesse apenas seus próprios dados e finanças.
-- ==============================================================================

-- 1. RLS VitaFin
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Políticas para Categorias
DROP POLICY IF EXISTS "Usuários podem visualizar suas próprias categorias" ON public.categories;
CREATE POLICY "Usuários podem visualizar suas próprias categorias"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar suas próprias categorias" ON public.categories;
CREATE POLICY "Usuários podem cadastrar suas próprias categorias"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias categorias" ON public.categories;
CREATE POLICY "Usuários podem atualizar suas próprias categorias"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir suas próprias categorias" ON public.categories;
CREATE POLICY "Usuários podem excluir suas próprias categorias"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para Despesas e Receitas
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios gastos" ON public.expenses;
CREATE POLICY "Usuários podem visualizar seus próprios gastos"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar seus próprios gastos" ON public.expenses;
CREATE POLICY "Usuários podem cadastrar seus próprios gastos"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios gastos" ON public.expenses;
CREATE POLICY "Usuários podem atualizar seus próprios gastos"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus próprios gastos" ON public.expenses;
CREATE POLICY "Usuários podem excluir seus próprios gastos"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para Orçamentos
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios orçamentos" ON public.budgets;
CREATE POLICY "Usuários podem visualizar seus próprios orçamentos"
    ON public.budgets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar/atualizar seus próprios orçamentos" ON public.budgets;
CREATE POLICY "Usuários podem cadastrar/atualizar seus próprios orçamentos"
    ON public.budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus orçamentos" ON public.budgets;
CREATE POLICY "Usuários podem atualizar seus orçamentos"
    ON public.budgets FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus orçamentos" ON public.budgets;
CREATE POLICY "Usuários podem excluir seus orçamentos"
    ON public.budgets FOR DELETE
    USING (auth.uid() = user_id);

-- 2. RLS VitaInvest
ALTER TABLE public.investment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_dividends ENABLE ROW LEVEL SECURITY;

-- Políticas para Ativos (investment_assets)
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios ativos" ON public.investment_assets;
CREATE POLICY "Usuários podem visualizar seus próprios ativos"
    ON public.investment_assets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar seus próprios ativos" ON public.investment_assets;
CREATE POLICY "Usuários podem cadastrar seus próprios ativos"
    ON public.investment_assets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios ativos" ON public.investment_assets;
CREATE POLICY "Usuários podem atualizar seus próprios ativos"
    ON public.investment_assets FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus próprios ativos" ON public.investment_assets;
CREATE POLICY "Usuários podem excluir seus próprios ativos"
    ON public.investment_assets FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para Transações (investment_transactions)
DROP POLICY IF EXISTS "Usuários podem visualizar suas próprias transações de investimento" ON public.investment_transactions;
CREATE POLICY "Usuários podem visualizar suas próprias transações de investimento"
    ON public.investment_transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar suas próprias transações de investimento" ON public.investment_transactions;
CREATE POLICY "Usuários podem cadastrar suas próprias transações de investimento"
    ON public.investment_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias transações de investimento" ON public.investment_transactions;
CREATE POLICY "Usuários podem atualizar suas próprias transações de investimento"
    ON public.investment_transactions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir suas próprias transações de investimento" ON public.investment_transactions;
CREATE POLICY "Usuários podem excluir suas próprias transações de investimento"
    ON public.investment_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para Proventos (investment_dividends)
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios proventos" ON public.investment_dividends;
CREATE POLICY "Usuários podem visualizar seus próprios proventos"
    ON public.investment_dividends FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem cadastrar seus próprios proventos" ON public.investment_dividends;
CREATE POLICY "Usuários podem cadastrar seus próprios proventos"
    ON public.investment_dividends FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios proventos" ON public.investment_dividends;
CREATE POLICY "Usuários podem atualizar seus próprios proventos"
    ON public.investment_dividends FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus próprios proventos" ON public.investment_dividends;
CREATE POLICY "Usuários podem excluir seus próprios proventos"
    ON public.investment_dividends FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- ⚡ ÍNDICES PARA ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_installment ON public.expenses(installment_group_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month);

-- Índices VitaInvest
CREATE INDEX IF NOT EXISTS idx_invest_assets_user ON public.investment_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_invest_assets_ticker ON public.investment_assets(ticker);
CREATE INDEX IF NOT EXISTS idx_invest_transactions_user ON public.investment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_invest_transactions_asset ON public.investment_transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_invest_transactions_date ON public.investment_transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_invest_dividends_user ON public.investment_dividends(user_id);
CREATE INDEX IF NOT EXISTS idx_invest_dividends_asset ON public.investment_dividends(asset_id);
CREATE INDEX IF NOT EXISTS idx_invest_dividends_date ON public.investment_dividends(user_id, payment_date);

-- ==============================================================================
-- ✨ CRIAÇÃO AUTOMÁTICA DE CATEGORIAS PADRÃO PARA NOVOS USUÁRIOS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (id, user_id, name, color, icon, type, is_default)
    VALUES
        -- Despesas
        ('cat-alimentacao-' || NEW.id, NEW.id, 'Alimentação', '#EF4444', 'utensils', 'expense', true),
        ('cat-compras-' || NEW.id, NEW.id, 'Compras & Roupas', '#14B8A6', 'shopping-bag', 'expense', true),
        ('cat-educacao-' || NEW.id, NEW.id, 'Educação & Estudos', '#EC4899', 'graduation-cap', 'expense', true),
        ('cat-lazer-' || NEW.id, NEW.id, 'Lazer & Entretenimento', '#8B5CF6', 'film', 'expense', true),
        ('cat-moradia-' || NEW.id, NEW.id, 'Moradia & Contas', '#3B82F6', 'home', 'expense', true),
        ('cat-outros-' || NEW.id, NEW.id, 'Outros / Diversos', '#64748B', 'more-horizontal', 'expense', true),
        ('cat-saude-' || NEW.id, NEW.id, 'Saúde & Farmácia', '#10B981', 'heart-pulse', 'expense', true),
        ('cat-mercado-' || NEW.id, NEW.id, 'Supermercado', '#F97316', 'shopping-cart', 'expense', true),
        ('cat-transporte-' || NEW.id, NEW.id, 'Transporte & Carro', '#F59E0B', 'car', 'expense', true),
        -- Receitas
        ('cat-salario-' || NEW.id, NEW.id, 'Salário & Remuneração', '#10B981', 'banknote', 'income', true),
        ('cat-freelance-' || NEW.id, NEW.id, 'Freelance & Serviços', '#3B82F6', 'briefcase', 'income', true),
        ('cat-investimentos-' || NEW.id, NEW.id, 'Rendimentos & Dividendos', '#8B5CF6', 'trending-up', 'income', true),
        ('cat-vendas-' || NEW.id, NEW.id, 'Vendas & Negócios', '#F59E0B', 'shopping-bag', 'income', true),
        ('cat-bonus-' || NEW.id, NEW.id, 'Bônus & Prêmios', '#EC4899', 'gift', 'income', true),
        ('cat-outras-entradas-' || NEW.id, NEW.id, 'Outras Receitas', '#14B8A6', 'wallet', 'income', true)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_add_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_add_categories
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_categories();
