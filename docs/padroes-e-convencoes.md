## Padrões e Convenções

### Código
- Componentes React em PascalCase.
- Funções/variáveis descritivas; evitar abreviações.
- Preferir early-return e funções puras em `utils/`.

### Estado
- Contextos apenas para estado realmente global (ex.: auth, preferências).
- Demais estados locais ao componente pai mais próximo.

### Estrutura
- `views/`: páginas de alto nível.
- `components/`: blocos reutilizáveis (sem dependência de rota).
- `hooks/`: acesso a dados e side-effects.
- `utils/`: lógica pura reutilizável.

### Estilo e UI
- Usar `index.css` e classes utilitárias consistentes.
- Mensagens e textos em português (pt-BR) por padrão.

### Datas e Moedas
- Datas em ISO (`YYYY-MM-DD`) na camada de dados.
- Ajustar fuso-horário via `settings.timezone` quando necessário.
- Moedas centralizadas por `settings.currency`.

### Revisões
- Commits pequenos e descritivos.
- Atualizar `docs/` quando houver mudança estrutural.

### Logging e Debug
- **Logging**: Usar `src/utils/logger.js` para logs padronizados.
- **Desenvolvimento**: Logs de debug só aparecem em `import.meta.env.DEV`.
- **Produção**: Apenas logs de erro e warning são exibidos.
- **Console.log**: Evitar uso direto, preferir logger padronizado.
