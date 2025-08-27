## Dados e Modelagem

> Observação: nomes e formatos são sugestões para alinhar com Firestore; ajuste conforme o backend real.

### Usuário (`users/{userId}`)
- `displayName: string`
- `email: string`
- `settings: { currency: string, timezone: string, startOfWeek: number }`

### Categorias (`categories/{categoryId}`)
- `name: string`
- `type: 'income' | 'expense'`
- `color: string`
- `ownerId: string`

### Cartões de Crédito (`cards/{cardId}`)
- `name: string`
- `brand: string`
- `last4: string`
- `invoiceCloseDay: number`  (dia de fechamento da fatura)
- `dueDay: number`           (dia de vencimento)
- `ownerId: string`

### Faturas (`invoices/{invoiceId}`)
- `cardId: string`
- `month: string`       (YYYY-MM)
- `total: number`       (valor total da fatura)
- `status: 'open' | 'closed' | 'paid'`

### Transações (`transactions/{transactionId}`)
- `type: 'income' | 'expense'`
- `description: string`  (título/descrição da transação)
- `value: number`        (valor da transação)
- `date: string`         (YYYY-MM-DD)
- `categoryId: string`
- `notes?: string`
- `cardId?: string`      (para despesas no cartão)
- `invoiceId?: string`
- `recurrence?: Recurrence`
- `ownerId: string`

### Transações Parceladas
- `isInstallment: boolean`           (indica se é uma parcela)
- `installmentId: string`            (ID único da série de parcelas)
- `installmentIndex: number`         (índice da parcela: 1, 2, 3...)
- `installmentTotal: number`         (total de parcelas na série)
- `installmentValue: number`         (valor desta parcela específica)
- `totalValue: number`               (valor total da compra original)
- `originalPurchaseDate: string`     (data da compra original)
- `invoiceDate: Date`                (data da fatura desta parcela)
- `fiscalMonth: string`              (mês fiscal da fatura)

### Tipo `Recurrence`
```ts
interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;          // a cada N unidades
  byWeekday?: number[];      // 0..6
  byMonthday?: number[];     // 1..31
  startDate: string;         // YYYY-MM-DD
  endDate?: string;          // YYYY-MM-DD
}
```

### Índices sugeridos (Firestore)
- `transactions` por `ownerId`, `date`.
- `invoices` por `cardId`, `month`.
- `categories` por `ownerId`.
