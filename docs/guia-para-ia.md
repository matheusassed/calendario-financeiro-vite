## Guia para IA

### Objetivo
Permitir que IAs compreendam rapidamente o projeto e proponham mudanças seguras, consistentes e incrementais.

### Contexto mínimo para qualquer tarefa
- Descrever o objetivo do usuário e o impacto esperado.
- Apontar arquivos-alvo (por exemplo, `views/CalendarView.jsx`, `utils/recurrence.js`).
- Indicar quaisquer efeitos em dados (ex.: novos campos em `transactions`).

### Limites e segurança
- Não alterar sem necessidade: `AuthContext.jsx`, hooks de dados e contratos de modelos.
- Qualquer mudança em modelos deve atualizar `docs/dados-e-modelagem.md`.
- Manter mensagens de UI em pt-BR e acessíveis.

### Definition of Done
- Código compila (Vite) e lint sem erros novos.
- Funções críticas possuem testes ou exemplos de uso em docs.
- Documentação atualizada (esta pasta `docs/`).

### Estilo de código
- Seguir `padroes-e-convencoes.md`.
- Criar nomes claros e evitar abreviações.

### Checklist rápido antes de concluir
- Impacto em dados considerado?
- Estados e props minimizados e coesos?
- Regressões em `CalendarView`/`DayDetailsView`?
