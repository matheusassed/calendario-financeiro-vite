## Contexto do Projeto

- **Nome**: Calendário Financeiro
- **Objetivo**: Visualizar e gerenciar receitas, despesas e faturas em uma visão de calendário, com suporte a recorrências e cartões de crédito.
- **Usuários-alvo**:
  - **Pessoas físicas**: controle de gastos e planejamento mensal.
  - **Microempreendedores**: visão rápida de fluxo de caixa e vencimentos.

### Escopo (versão atual)
- Autenticação via `AuthContext` (provável Firebase Auth).
- Persistência e leitura com hooks `useFirestoreQuery`/`useFirestoreDocument` (provável Firestore).
- Telas principais: `CalendarView`, `DayDetailsView`, `InvoiceDetailsView`, `SettingsView`.
- Formulários: `ExpenseForm`, `RevenueForm`.
- Gestão: `CategoryManagement`, `CreditCardManagement`, `GlobalSettings`.
- Recorrências: `RecurrenceConfig`, `RecurrenceEditModal`, `RecurrenceEditOptions`.

### Fora de escopo (por enquanto)
- Multi-tenant avançado, relatórios complexos e exportações fiscais.
- Integrações bancárias automáticas.

### Stack e decisões
- **Frontend**: Vite + React.
- **Estado**: Context API (ex.: `AuthContext`), estado local dos componentes.
- **Dados**: Hooks customizados para Firestore.
- **Estilo**: `index.css` (sem framework CSS).
- **Linguagem**: JavaScript.

### Métricas de sucesso
- Rapidez para registrar lançamentos.
- Clareza da visão mensal e de vencimentos.
- Baixa fricção em ajustar recorrências.
