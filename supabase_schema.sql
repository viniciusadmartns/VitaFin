-- ==============================================================================
-- 🌿 VitaFin - Script de Criação do Banco de Dados (Supabase PostgreSQL)
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Clique em "+ New query" (Nova consulta)
-- 4. Cole todo este código SQL abaixo e clique no botão "Run" (Executar)
-- ==============================================================================

-- 1. Habilitar extensão de UUID (caso não esteja ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Categorias / Tipos de Gasto
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    budget_limit NUMERIC(12,2) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de Gastos / Despesas (com suporte a parcelamento)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    date DATE NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    payment_method TEXT DEFAULT 'credit',
    notes TEXT DEFAULT NULL,
    installment_group_id TEXT DEFAULT NULL,
    installment_number INTEGER DEFAULT NULL,
    total_installments INTEGER DEFAULT NULL,
    installment_total_amount NUMERIC(12,2) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Tabela de Metas / Orçamento Mensal
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Formato 'YYYY-MM', ex: '2026-08'
    limit_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_month_budget UNIQUE (user_id, month)
);

-- ==============================================================================
-- 🔒 POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- Garante que cada usuário acesse apenas seus próprios dados e finanças.
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Políticas para Categorias
CREATE POLICY "Usuários podem visualizar suas próprias categorias"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem cadastrar suas próprias categorias"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias categorias"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para Despesas
CREATE POLICY "Usuários podem visualizar seus próprios gastos"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem cadastrar seus próprios gastos"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios gastos"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios gastos"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para Orçamentos
CREATE POLICY "Usuários podem visualizar seus próprios orçamentos"
    ON public.budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem cadastrar/atualizar seus próprios orçamentos"
    ON public.budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus orçamentos"
    ON public.budgets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus orçamentos"
    ON public.budgets FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- ⚡ ÍNDICES PARA ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_installment ON public.expenses(installment_group_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month);

-- ==============================================================================
-- ✨ CRIAÇÃO AUTOMÁTICA DE CATEGORIAS PADRÃO PARA NOVOS USUÁRIOS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (id, user_id, name, color, icon, is_default)
    VALUES
        ('cat-food-' || NEW.id, NEW.id, 'Alimentação & Refeições', '#10B981', 'utensils', true),
        ('cat-market-' || NEW.id, NEW.id, 'Supermercado & Feira', '#06B6D4', 'shopping-cart', true),
        ('cat-home-' || NEW.id, NEW.id, 'Moradia & Contas Fixas', '#3B82F6', 'home', true),
        ('cat-transport-' || NEW.id, NEW.id, 'Transporte & Combustível', '#F59E0B', 'car', true),
        ('cat-health-' || NEW.id, NEW.id, 'Saúde & Farmácia', '#EF4444', 'heart-pulse', true),
        ('cat-leisure-' || NEW.id, NEW.id, 'Lazer & Entretenimento', '#8B5CF6', 'gamepad-2', true),
        ('cat-tech-' || NEW.id, NEW.id, 'Tecnologia & Conexão', '#6366F1', 'laptop', true),
        ('cat-shopping-' || NEW.id, NEW.id, 'Compras & Vestuário', '#EC4899', 'shopping-bag', true),
        ('cat-education-' || NEW.id, NEW.id, 'Educação & Trabalho', '#14B8A6', 'graduation-cap', true),
        ('cat-pets-' || NEW.id, NEW.id, 'Família & Pets', '#F97316', 'paw-print', true),
        ('cat-finance-' || NEW.id, NEW.id, 'Bancos & Investimentos', '#059669', 'credit-card', true),
        ('cat-others-' || NEW.id, NEW.id, 'Outros / Diversos', '#475569', 'more-horizontal', true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparado sempre que um usuário se cadastra no Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created_add_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_add_categories
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_categories();
