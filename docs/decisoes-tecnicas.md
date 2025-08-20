## Decisões Técnicas e Trade-offs

### Por que essas escolhas?

#### 1. **Vite + React (sem Next.js)**
- **Prós**: Build rápido, HMR eficiente, configuração simples
- **Contras**: Sem SSR, roteamento manual
- **Justificativa**: App interno focado em funcionalidade, não SEO

#### 2. **Context API vs Redux/Zustand**
- **Prós**: Nativo React, simples para auth e settings
- **Contras**: Pode causar re-renders desnecessários
- **Justificativa**: Estado global mínimo (apenas auth), resto local

#### 3. **Hooks Customizados para Firestore**
- **Prós**: Encapsula lógica de dados, reutilizável
- **Contras**: Menos flexível que query builders
- **Justificativa**: Padrão consistente, fácil de testar

#### 4. **JavaScript vs TypeScript**
- **Prós**: JS é mais rápido para prototipagem
- **Contras**: Menos segurança de tipos, refactoring arriscado
- **Justificativa**: Migração incremental planejada

#### 5. **CSS puro vs Framework**
- **Prós**: Sem dependências, controle total
- **Contras**: Mais trabalho para manter consistência
- **Justificativa**: App simples, não precisa de design system complexo

### Alternativas Consideradas

#### Estado
- **Redux Toolkit**: Overkill para estado atual
- **Zustand**: Boa alternativa se Context API causar problemas

#### Dados
- **React Query**: Excelente para cache e sincronização
- **SWR**: Alternativa mais leve ao React Query

#### Estilo
- **Tailwind**: Produtividade alta, mas bundle maior
- **Styled Components**: CSS-in-JS, mas complexidade adicional

### Pontos de melhoria
- Performance degradada (re-renders excessivos)
- Bundle size muito grande
- Complexidade de estado aumentando
- Necessidade de SSR/SSG
