## Fluxos-Chave

### Login
1. Usuário acessa `LoginScreen`.
2. `AuthContext` autentica (ex.: Firebase Auth) e disponibiliza `user` para o app.

### Carregar Calendário
1. Em `CalendarView`, ler `transactions` do mês atual via `useFirestoreQuery`.
2. Renderizar marcadores por dia; clique abre `DayDetailsView`.

### Criar Despesa/Receita
1. Abrir `ExpenseForm`/`RevenueForm`.
2. Validar campos e salvar em `transactions`.
3. Se houver `cardId`, associar à fatura (`invoices`) do mês correto.

### Recorrência
1. Configurar em `RecurrenceConfig` ou editar em `RecurrenceEditModal`.
2. `utils/recurrence.js` calcula próximas ocorrências.
3. Estratégia: materializar parcelas futuras ou gerar sob demanda na UI.

### Compra Parcelada
1. Em `ExpenseForm`, selecionar cartão de crédito e marcar "Parcelar compra".
2. Configurar número de parcelas (2-24) via `InstallmentConfig`.
3. `utils/installments.js` gera todas as parcelas com datas de fatura corretas.
4. Cada parcela é salva individualmente no Firestore para controle de faturas.
5. No `DayDetailsView`, parcelas são agrupadas visualmente por `installmentId`.
6. Exibição consolidada: uma linha com valor total e quantidade de parcelas.

### Detalhes de Fatura
1. `InvoiceDetailsView` filtra `transactions` por `cardId` e `month`.
2. Exibe total, status e permite marcar `paid`.

### Configurações
- `SettingsView` agrega `GlobalSettings`, `CategoryManagement`, `CreditCardManagement`.
