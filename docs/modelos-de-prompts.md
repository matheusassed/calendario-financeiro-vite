## Modelos de Prompts

### 🚀 **Implementar Nova Feature**

#### Template Básico
```
Implementar [NOME_DA_FEATURE] no projeto Calendário Financeiro.

**Objetivo**: [Descrição clara do que a feature deve fazer]

**Contexto**: [Por que é necessário, qual problema resolve]

**Arquivos a modificar**:
- [Lista de arquivos específicos]
- [Novos arquivos a criar]

**Critérios de aceite**:
- [ ] [Critério 1]
- [ ] [Critério 2]
- [ ] [Critério 3]

**Considerações técnicas**:
- [Impacto em dados/modelos]
- [Integração com componentes existentes]
- [Performance/UX]

**Documentação**: Atualizar [docs/arquivo.md] se necessário
```

#### Exemplo Prático
```
Implementar notificações de vencimento de faturas no projeto Calendário Financeiro.

**Objetivo**: Alertar usuários sobre faturas próximas do vencimento (3 dias antes)

**Contexto**: Usuários perdem prazos de pagamento, causando juros e multas

**Arquivos a modificar**:
- src/components/NotificationBanner.jsx (novo)
- src/views/CalendarView.jsx
- src/utils/helpers.js (função de cálculo de dias)
- docs/dados-e-modelagem.md (se necessário)

**Critérios de aceite**:
- [ ] Banner aparece 3 dias antes do vencimento
- [ ] Mostra valor e cartão da fatura
- [ ] Pode ser fechado pelo usuário
- [ ] Integra com sistema de cores existente

**Considerações técnicas**:
- Usar dados de invoices existentes
- Não impactar performance do calendário
- Seguir padrão de cores do index.css

**Documentação**: Atualizar docs/fluxos-chave.md com novo fluxo
```

---

### 🔧 **Implementar Melhoria**

#### Template Básico
```
Melhorar [COMPONENTE/FUNCIONALIDADE] no projeto Calendário Financeiro.

**Objetivo**: [O que será melhorado e como]

**Contexto**: [Problema atual ou oportunidade de melhoria]

**Arquivos a modificar**:
- [Arquivos específicos]

**Melhorias específicas**:
- [ ] [Melhoria 1]
- [ ] [Melhoria 2]
- [ ] [Melhoria 3]

**Critérios de aceite**:
- [ ] [Critério 1]
- [ ] [Critério 2]

**Considerações**:
- [Manter compatibilidade com funcionalidades existentes]
- [Não quebrar UX atual]
- [Seguir padrões estabelecidos]
```

#### Exemplo Prático
```
Melhorar acessibilidade dos modais no projeto Calendário Financeiro.

**Objetivo**: Tornar modais mais acessíveis com navegação por teclado e leitores de tela

**Contexto**: Usuários com necessidades especiais têm dificuldade para usar modais

**Arquivos a modificar**:
- src/components/Modal.jsx
- src/components/ConfirmModal.jsx
- src/components/RecurrenceEditModal.jsx

**Melhorias específicas**:
- [ ] Foco automático no primeiro elemento interativo
- [ ] Fechar com tecla ESC
- [ ] Trap de foco dentro do modal
- [ ] Rótulos ARIA adequados
- [ ] Navegação por Tab/Shift+Tab

**Critérios de aceite**:
- [ ] Testado com leitor de tela
- [ ] Navegação por teclado funcional
- [ ] Não quebra funcionalidades existentes

**Considerações**:
- Manter compatibilidade com funcionalidades existentes
- Seguir padrões de acessibilidade WCAG 2.1
- Testar em diferentes navegadores
```

---

### 🐛 **Corrigir Bug**

#### Template Básico
```
Corrigir bug em [COMPONENTE/FUNCIONALIDADE] no projeto Calendário Financeiro.

**Descrição do bug**: [O que está acontecendo de errado]

**Comportamento esperado**: [Como deveria funcionar]

**Passos para reproduzir**:
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Arquivos afetados**:
- [Arquivos onde o bug está]

**Possíveis causas**:
- [Hipótese 1]
- [Hipótese 2]

**Critérios de aceite**:
- [ ] [Bug corrigido]
- [ ] [Não quebra outras funcionalidades]
- [ ] [Testado em cenários similares]

**Considerações**:
- [Impacto em outras funcionalidades]
- [Dados que podem ser afetados]
```

#### Exemplo Prático
```
Corrigir bug de recorrências não calculando corretamente no projeto Calendário Financeiro.

**Descrição do bug**: Recorrências mensais não aparecem nos meses seguintes

**Comportamento esperado**: Recorrências devem aparecer em todos os meses até a data de fim

**Passos para reproduzir**:
1. Criar transação com recorrência mensal
2. Definir data de início: 2024-01-15
3. Definir data de fim: 2024-12-31
4. Verificar se aparece em fevereiro, março, etc.

**Arquivos afetados**:
- src/utils/recurrence.js
- src/components/RecurrenceConfig.jsx

**Possíveis causas**:
- Lógica de cálculo de datas incorreta
- Problema na validação de endDate

**Critérios de aceite**:
- [ ] Recorrências aparecem em todos os meses corretos
- [ ] Não quebra recorrências existentes
- [ ] Testado com diferentes frequências

**Considerações**:
- Verificar se afeta outras funcionalidades de data
- Testar com diferentes fusos horários
```

---

### 🔄 **Refatorar Código**

#### Template Básico
```
Refatorar [COMPONENTE/ARQUIVO] no projeto Calendário Financeiro.

**Objetivo**: [Por que refatorar - legibilidade, performance, manutenibilidade]

**Contexto**: [Problemas atuais ou oportunidades de melhoria]

**Arquivos a refatorar**:
- [Arquivos específicos]

**Mudanças propostas**:
- [ ] [Mudança 1]
- [ ] [Mudança 2]
- [ ] [Mudança 3]

**Critérios de aceite**:
- [ ] [Critério 1]
- [ ] [Critério 2]

**Considerações**:
- [Manter funcionalidade existente]
- [Não quebrar testes]
- [Seguir padrões estabelecidos]
- [Documentar mudanças significativas]
```

#### Exemplo Prático
```
Refatorar CategoryManagement.jsx no projeto Calendário Financeiro.

**Objetivo**: Melhorar legibilidade e separar responsabilidades

**Contexto**: Componente muito grande com muitas responsabilidades

**Arquivos a refatorar**:
- src/components/CategoryManagement.jsx
- src/components/CategoryForm.jsx (novo)
- src/components/CategoryList.jsx (novo)

**Mudanças propostas**:
- [ ] Separar formulário em componente próprio
- [ ] Separar lista em componente próprio
- [ ] Extrair lógica de negócio para hooks customizados
- [ ] Simplificar estado local

**Critérios de aceite**:
- [ ] Funcionalidade idêntica ao original
- [ ] Componentes menores e mais focados
- [ ] Código mais legível e testável
- [ ] Seguir padrões de nomenclatura

**Considerações**:
- Manter compatibilidade com props existentes
- Não quebrar integração com outros componentes
- Seguir padrões estabelecidos em padroes-e-convencoes.md
```

---

### 👀 **Code Review**

#### Template Básico
```
Fazer code review das mudanças em [COMPONENTE/ARQUIVO] no projeto Calendário Financeiro.

**Contexto**: [O que foi implementado/modificado]

**Arquivos alterados**:
- [Lista de arquivos modificados]

**Foco da revisão**:
- [ ] [Aspecto 1 - ex: funcionalidade]
- [ ] [Aspecto 2 - ex: performance]
- [ ] [Aspecto 3 - ex: segurança]
- [ ] [Aspecto 4 - ex: acessibilidade]

**Critérios de revisão**:
- [ ] Código segue padrões estabelecidos
- [ ] Funcionalidade implementada corretamente
- [ ] Não quebra funcionalidades existentes
- [ ] Documentação atualizada se necessário
- [ ] Testes adequados (se aplicável)

**Considerações específicas**:
- [Impacto em dados/modelos]
- [Integração com componentes existentes]
- [Performance/UX]
- [Segurança (se aplicável)]
```

#### Exemplo Prático
```
Fazer code review das mudanças em NotificationBanner.jsx no projeto Calendário Financeiro.

**Contexto**: Implementação de notificações de vencimento de faturas

**Arquivos alterados**:
- src/components/NotificationBanner.jsx (novo)
- src/views/CalendarView.jsx (integração)
- src/utils/helpers.js (função de cálculo)

**Foco da revisão**:
- [ ] Funcionalidade implementada corretamente
- [ ] Performance não impactada
- [ ] Acessibilidade adequada
- [ ] Integração com sistema existente

**Critérios de revisão**:
- [ ] Código segue padrões estabelecidos
- [ ] Notificações aparecem no momento correto
- [ ] Não quebra funcionalidades existentes
- [ ] Documentação atualizada
- [ ] Testado manualmente

**Considerações específicas**:
- Verificar se não causa re-renders excessivos
- Confirmar integração com sistema de cores
- Validar cálculo de datas (fuso horário)
- Testar com diferentes cenários de fatura
```

---

### 📋 **Checklist de Qualidade**

#### Para Todas as Tarefas
- [ ] Código compila sem erros (Vite)
- [ ] ESLint passa sem warnings novos
- [ ] Funcionalidade testada manualmente
- [ ] Não quebra funcionalidades existentes
- [ ] Segue padrões estabelecidos
- [ ] Documentação atualizada (se necessário)
- [ ] Nomes descritivos e sem abreviações
- [ ] Mensagens em português (pt-BR)
- [ ] Acessibilidade considerada
- [ ] Performance não degradada

#### Para Mudanças em Dados
- [ ] Modelos atualizados em docs/dados-e-modelagem.md
- [ ] Fluxos atualizados em docs/fluxos-chave.md
- [ ] Índices do Firestore considerados
- [ ] Regras de segurança atualizadas (se necessário)

#### Para Novos Componentes
- [ ] Segue padrão de nomenclatura
- [ ] Props bem definidas e tipadas (se TS)
- [ ] Estado local minimizado
- [ ] Reutilizável quando apropriado
- [ ] Integra com sistema de cores existente
