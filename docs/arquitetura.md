## Arquitetura

### Visão Geral
- Aplicação SPA em React, construída com Vite.
- Camadas:
  - **UI/Views**: componentes em `views/` e `components/`.
  - **Estado/Contexto**: `contexts/AuthContext.jsx` e estado local de componentes.
  - **Dados**: hooks `useFirestoreQuery.js` e `useFirestoreDocument.js` encapsulam acesso ao Firestore.
  - **Utilitários**: `utils/helpers.js` e `utils/recurrence.js` para lógica de apoio.

### Mapa de Pastas
```
src/
  views/            # Telas (alto nível)
  components/       # Componentes reutilizáveis e modais
  contexts/         # Context API (ex.: autenticação)
  hooks/            # Hooks de dados (Firestore)
  utils/            # Helpers e regras de negócio pontuais
```

### Componentes Principais
- `CalendarView`: visão mensal, navegação por datas e marcadores de lançamentos.
- `DayDetailsView`: detalhes de um dia específico (lista de lançamentos).
- `InvoiceDetailsView`: visão de faturas (cartões de crédito).
- `SettingsView`: preferências, categorias, cartões e parâmetros globais.

### Dados e Sincronização
- Hooks de dados provêm coleções/documentos. A UI assina atualizações e re-renderiza.
- Normalização mínima: documentos por coleção (ex.: `transactions`, `categories`, `cards`, `invoices`).

### Recorrências
- `utils/recurrence.js` concentra regras de repetição (ex.: mensal, semanal, dia do mês).
- Edição de recorrências via `RecurrenceEditModal` e `RecurrenceEditOptions`.

### Parcelamento
- `utils/installments.js` gerencia compras parceladas no cartão de crédito.
- Sistema de agrupamento visual para exibir parcelas consolidadas no calendário.
- Cada parcela mantém referência individual para faturas, mas exibição agrupada na UI.
- Suporte a até 24 parcelas com cálculo automático de valores e datas de vencimento.

### Autenticação
- `AuthContext.jsx` provê usuário atual e guards de rota/tela.

### Erros, Logs e Resiliência
- Exceções capturadas no nível de hook/ação. Mensagens de erro em UI (ex.: `ConfirmModal`/`Modal`).

### Decisões Futuras
- Adotar TypeScript e tipar hooks e modelos.
- Introduzir testes unitários para `utils/recurrence.js` e helpers críticos.
