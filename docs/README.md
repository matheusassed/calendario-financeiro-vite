## Documentação do Projeto: Calendário Financeiro

Este diretório reúne documentos para entender rapidamente o contexto, a arquitetura e as decisões do projeto. Use estes arquivos como base viva e mantenha-os atualizados conforme o código evolui.

- **Leia primeiro**:
  - [Contexto do Projeto](./contexto-do-projeto.md)
  - [Arquitetura](./arquitetura.md)
- **Referências rápidas**:
  - [Modelos de Dados](./dados-e-modelagem.md)
  - [Fluxos-Chave](./fluxos-chave.md)
  - [Padrões e Convenções](./padroes-e-convencoes.md)
  - [Sistema de Parcelas](./sistema-parcelas.md)
  - [Guia para IA](./guia-para-ia.md)
  - [Migração para TypeScript](./migracao-typescript.md)
  - [Prompts de Exemplo](./prompts-de-exemplo.md)
- **Suporte e Decisões**:
  - [Troubleshooting](./troubleshooting.md)
  - [Decisões Técnicas](./decisoes-tecnicas.md)
- **Templates de Trabalho**:
  - [Modelos de Prompts](./modelos-de-prompts.md)

```
Estrutura atual do código (resumo)
src/
  App.jsx
  index.css
  main.jsx
  components/
    CategoryManagement.jsx
    ConfirmModal.jsx
    CreditCardManagement.jsx
    GlobalSettings.jsx
    LoginScreen.jsx
    Modal.jsx
    RecurrenceConfig.jsx
    RecurrenceEditModal.jsx
    RecurrenceEditOptions.jsx
    Sidebar.jsx
    TodayButton.jsx
    ViewModeSwitch.jsx
  contexts/
    AuthContext.jsx
  hooks/
    useFirestoreDocument.js
    useFirestoreQuery.js
  utils/
    helpers.js
    recurrence.js
  views/
    CalendarView.jsx
    DayDetailsView.jsx
    ExpenseForm.jsx
    InvoiceDetailsView.jsx
    RevenueForm.jsx
    SettingsView.jsx
```

Mantenha estes documentos curtos, práticos e sincronizados com o código.
