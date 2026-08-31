# 🌿 VitaFin - Controle Financeiro Pessoal Inteligente

Uma aplicação web moderna, intuitiva e completa para controle de despesas e finanças mensais.

---

## ✨ Funcionalidades Principais

### 1. 📝 Cadastro Completo de Gastos do Mês
- **Data do Gasto**: Calendário com atalhos rápidos ("Hoje", "Ontem").
- **Tipo de Gasto (Categoria)**: Seletor visual com ícones e cores temáticas + atalho para criar e gerenciar tipos na hora.
- **Nome do Gasto / Descrição**: Identificação clara da despesa (ex: Supermercado, Almoço, Gasolina, Farmácia, Smartphone).
- **Valor do Gasto**: Input formatado em Real brasileiro (`R$ 0,00`).
- **Forma de Pagamento**: PIX, Cartão de Crédito, Cartão de Débito, Dinheiro ou **Parcelado**.

### 2. 💳 Sistema Inteligente de Parcelamento
- **Cálculo Automático**: Calcule o total da compra e valor mensal de cada parcela instantaneamente com total em destaque no topo.
- **Número de Parcelas**: Escolha rápida (2x a 24x ou personalizado até 72x).
- **Agendamento nos Próximos Meses**: Ao lançar um gasto parcelado, o VitaFin gera e agenda automaticamente cada parcela no seu respectivo mês subsequente (ex: `Notebook (1/6)`, `Notebook (2/6)`).
- **Gerenciamento de Exclusão**: Opção de excluir apenas a parcela selecionada ou cancelar todas as parcelas da compra.

### 3. 🏷️ Cadastro e Gestão de Tipos de Gasto (Categorias)
- **Biblioteca Expandida de Ícones**: Mais de 70 ícones modernos divididos por áreas (Alimentação, Moradia, Transporte, Saúde, Lazer, Tecnologia, Compras, Família, Pets, Finanças e Educação).
- **Cores Personalizadas**: Paleta selecionada com seletor hexadecimal livre.
- **Edição e Exclusão com Segurança**: Altere nome, cor e ícone a qualquer momento ou transfira gastos existentes para outra categoria antes de remover.

### 4. 📊 Dashboard e Indicadores em Tempo Real
- **Métricas do Mês**: Total gasto, média diária de consumo, maior despesa e quantidade de lançamentos.
- **Gráfico de Rosca / Pizza (Recharts)**: Proporção de gastos por tipo de gasto com porcentagens, valores e ranking.
- **Gráfico de Barras Diárias (Recharts)**: Acompanhamento da evolução dos gastos ao longo dos dias do mês com linha de média diária.
- **Meta / Orçamento Mensal**: Defina um teto de gastos para o mês com alertas visuais e barra de progresso.

### 5. 🔍 Filtros Avançados e Busca
- Navegação entre meses com seletor interativo (`< Mês Anterior | Mês Atual | Próximo Mês >`).
- Busca em tempo real por nome, notas ou categoria.
- Filtro por tipo de gasto específico e por forma de pagamento (PIX, Crédito, Débito, Dinheiro, Parcelado).
- Ordenação por data (mais recente/antiga), valor (maior/menor) e nome alfabético.

### 6. 💾 Exportação, Backup e Personalização
- **Exportação CSV**: Baixe seus gastos em planilha compatível com Microsoft Excel.
- **Backup JSON**: Exporte e importe todos os seus dados para segurança.
- **Dark Mode / Light Mode**: Alternância de tema claro e escuro.
- **Persistência Local**: Todos os dados são salvos no `localStorage` do seu navegador.

---

## 🚀 Como Executar o Projeto

1. Instalar as dependências:
```bash
npm install
```

2. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abrir no navegador:
Acesse `http://localhost:5173` no seu navegador.

4. Gerar build de produção:
```bash
npm run build
```
