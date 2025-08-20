## Migração para TypeScript (Plano Incremental)

### Passo 1: Tooling
- Adicionar dependências: `typescript`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react-swc` (se necessário).
- Criar `tsconfig.json` com `strict: true` (ou progressivo com `skipLibCheck: true`).

### Passo 2: Tipos de Domínio
- Definir tipos em `src/types/` (ex.: `Transaction`, `Invoice`, `Card`, `Category`, `Recurrence`).
- Tipar helpers em `utils/` primeiro (`recurrence.ts`).

### Passo 3: Migração por bordas
- Converter `utils/*.js` para `.ts`.
- Converter `hooks/*.js` para `.ts` com generics (`useFirestoreQuery<T>`).
- Converter componentes folha para `.tsx` e subir até `views/`.

### Passo 4: Integração e Lint
- Ajustar ESLint para TypeScript (parser e plugins TS).
- Corrigir `any` e casts inseguros.

### Passo 5: Tipagem de Dados
- Mapear modelos Firestore para tipos TS e validadores leves (ex.: Zod opcional).

### Exemplo de tipos
```ts
export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  byWeekday?: number[];
  byMonthday?: number[];
  startDate: string; // ISO date
  endDate?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;  // título/descrição da transação
  value: number;        // valor da transação
  date: string;         // ISO
  categoryId: string;
  notes?: string;
  cardId?: string;
  invoiceId?: string;
  recurrence?: Recurrence;
  ownerId: string;
}
```
