## Prompts de Exemplo

### 1) Adicionar campo de observação em transações
- Objetivo: permitir `notes` em `ExpenseForm` e `RevenueForm`.
- Arquivos:
  - `views/ExpenseForm.jsx`, `views/RevenueForm.jsx`
  - `docs/dados-e-modelagem.md` (atualizar)
- Critérios de aceite: campo opcional, persistido e exibido em `DayDetailsView`.

### Prompt
"""
Adicionar o campo opcional `notes` às transações. Atualize os formulários `ExpenseForm` e `RevenueForm`, persista no Firestore e exiba em `DayDetailsView`. Garanta que a listagem no calendário exiba um ícone quando houver observação. Atualize `docs/dados-e-modelagem.md`.
"""

### 2) Ajustar recorrência mensal por dia da semana
- Objetivo: suportar "toda 2ª sexta-feira do mês".
- Arquivos: `utils/recurrence.js`, `RecurrenceConfig.jsx`.
- Aceite: cálculo correto por 6 meses, testes de unidade básicos.

### 3) Melhorar acessibilidade de modais
- Objetivo: focar primeiro elemento interativo, fechar por ESC.
- Arquivos: `components/Modal.jsx`, `ConfirmModal.jsx`.
- Aceite: navegação por teclado e rótulos ARIA adequados.
