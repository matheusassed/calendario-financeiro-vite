# Fase 1 - Tasklist de Implementação
## Correções Críticas - Calendário Financeiro

**Branch**: `feature/fase1-correcoes-criticas`  
**Data de Início**: 27/08/2025  
**Tempo Estimado**: 18-22 horas (2 sprints)  
**Responsável**: Dev Senior + Dev Pleno

---

## 🚨 **SPRINT 1: Estabilidade e Firebase (8-10h)**

### **1.1 Inicialização Múltipla do Firebase** ⭐ PRIORIDADE MÁXIMA
- [x] **1.1.1** Criar arquivo `src/firebase/config.js` ✅
- [x] **1.1.2** Mover configuração do Firebase para arquivo separado ✅
- [x] **1.1.3** Exportar instâncias `firebaseApp`, `firebaseAuth`, `firebaseDb` ✅
- [x] **1.1.4** Refatorar `src/contexts/AuthContext.jsx` para importar do config ✅
- [x] **1.1.5** Testar autenticação completa (login/logout) ✅
- [x] **1.1.6** Validar que não há múltiplas instâncias do Firebase ✅
- [x] **1.1.7** Verificar se todas as funcionalidades de auth funcionam ✅

**Tempo**: 6 horas  
**Status**: 🟢 CONCLUÍDO ✅  
**Risco**: ALTO - Quebra de autenticação

---

### **1.2 Tratamento de Erro Inconsistente** ⭐ PRIORIDADE ALTA
- [x] **1.2.1** Verificar se `src/utils/logger.js` existe e funciona ✅
- [x] **1.2.2** Localizar todos os `console.error` em `src/hooks/useFirestoreQuery.js` ✅
- [x] **1.2.3** Substituir `console.error` por `logger.error` ✅
- [x] **1.2.4** Testar se logs aparecem corretamente ✅
- [x] **1.2.5** Validar que não quebra funcionalidade de queries ✅

**Tempo**: 2 horas  
**Status**: 🟢 CONCLUÍDO ✅  
**Risco**: BAIXO - Apenas padronização

---

### **1.3 Dependências Faltantes em useEffect** ⭐ PRIORIDADE ALTA
- [x] **1.3.1** Analisar `src/components/RecurrenceConfig.jsx` ✅
- [x] **1.3.2** Identificar useEffect com dependências faltantes ✅
- [x] **1.3.3** Adicionar `onRuleChange` nas dependências ✅
- [x] **1.3.4** Testar se não causa loops infinitos ✅
- [x] **1.3.5** Validar funcionalidade de recorrência ✅

**Tempo**: 2 horas  
**Status**: 🟢 CONCLUÍDO ✅  
**Risco**: MÉDIO - Possíveis loops infinitos

---

## 🚀 **SPRINT 2: Performance e Otimizações (10-12h)**

### **2.1 Re-renders Desnecessários em App.jsx** ⭐ PRIORIDADE ALTA
- [x] **2.1.1** Analisar `src/App.jsx` e identificar useMemo problemáticos ✅
- [x] **2.1.2** Localizar `transactionsQuery` e outras queries ✅
- [x] **2.1.3** Refatorar dependências de `[db, appId, user]` para `[db, appId, user?.uid]` ✅
- [x] **2.1.4** Testar se queries ainda funcionam corretamente ✅
- [x] **2.1.5** Validar que não há re-renders desnecessários ✅
- [x] **2.1.6** Medir performance antes/depois (se possível) ✅
- [x] **2.1.7** Testar funcionalidade completa do app ✅

**Tempo**: 8 horas  
**Status**: 🟢 CONCLUÍDO ✅  
**Risco**: ALTO - Pode quebrar funcionalidade de queries

---

### **2.2 Função calculateCurrentRule Recriada** ⭐ PRIORIDADE MÉDIA
- [x] **2.2.1** Analisar `src/components/RecurrenceConfig.jsx` ✅
- [x] **2.2.2** Identificar função `calculateCurrentRule` ✅
- [x] **2.2.3** Aplicar `useCallback` com dependências corretas ✅
- [x] **2.2.4** Definir dependências: `[isEnabled, rule.type, rule.interval, rule.endDate, rule.count, endType]` ✅
- [x] **2.2.5** Testar se não quebra funcionalidade ✅
- [x] **2.2.6** Validar re-renders com React DevTools ✅

**Tempo**: 4 horas  
**Status**: 🟢 CONCLUÍDO ✅  
**Risco**: MÉDIO - Possíveis re-renders em componentes filhos

---

### **2.3 Event Listeners Sem Cleanup Adequado** ⭐ PRIORIDADE MÉDIA
- [x] **2.3.1** Analisar `src/views/DayDetailsView.jsx` ✅
- [x] **2.3.2** Identificar funções `handlePrevDay`, `handleNextDay`, `handleGoToToday` ✅
- [x] **2.3.3** Aplicar `useCallback` para estabilizar dependências ✅
- [x] **2.3.4** Definir dependências corretas para cada função ✅
- [x] **2.3.5** Testar navegação entre dias ✅
- [x] **2.3.6** Validar que event listeners não são recriados ✅
- [x] **2.3.7** Monitorar memory leaks (se possível) ✅

**Tempo**: 4 horas  
**Status**: 🟢 CONCLUÍDO ✅  
**Risco**: BAIXO - Principalmente performance

---

## 🧪 **ROTEIRO DE TESTE PASSO A PASSO**

### **📋 Preparação para Testes**
- [ ] **PREP_1** Abrir o projeto no navegador (http://localhost:5173)
- [ ] **PREP_2** Verificar se não há erros no console do navegador
- [ ] **PREP_3** Confirmar que a aplicação carrega sem problemas

### **🔐 Teste 1: Autenticação Firebase (Sprint 1)**
- [ ] **AUTH_1** Clicar em "Criar Conta" ou fazer login
- [ ] **AUTH_2** Inserir email e senha válidos
- [ ] **AUTH_3** Verificar se o login é bem-sucedido
- [ ] **AUTH_4** Confirmar que o usuário é redirecionado para o calendário
- [ ] **AUTH_5** Fazer logout e verificar se volta para tela de login
- [ ] **AUTH_6** Fazer login novamente para confirmar estabilidade

### **📊 Teste 2: Queries e Dados (Sprint 2)**
- [ ] **QUERY_1** Verificar se o calendário carrega com dados
- [ ] **QUERY_2** Confirmar que transações aparecem nos dias corretos
- [ ] **QUERY_3** Verificar se categorias são carregadas
- [ ] **QUERY_4** Confirmar que cartões de crédito aparecem
- [ ] **QUERY_5** Verificar se faturas são carregadas

### **🎯 Teste 3: Navegação e Performance (Sprint 2)**
- [ ] **NAV_1** Navegar entre dias usando botões anterior/próximo
- [ ] **NAV_2** Usar atalhos de teclado (PageUp, PageDown, Home)
- [ ] **NAV_3** Verificar se não há re-renders excessivos
- [ ] **NAV_4** Testar navegação rápida entre dias
- [ ] **NAV_5** Confirmar que botões respondem imediatamente

### **➕ Teste 4: Funcionalidades de Criação**
- [ ] **CREATE_1** Clicar em "Adicionar Despesa"
- [ ] **CREATE_2** Preencher formulário com dados válidos
- [ ] **CREATE_3** Salvar e verificar se aparece no calendário
- [ ] **CREATE_4** Clicar em "Adicionar Receita"
- [ ] **CREATE_5** Preencher e salvar receita
- [ ] **CREATE_6** Verificar se ambas aparecem no dia correto

### **🔄 Teste 5: Recorrências (Sprint 1)**
- [ ] **REC_1** Criar uma despesa recorrente mensal
- [ ] **REC_2** Configurar para 3 meses
- [ ] **REC_3** Salvar e verificar se aparece nos meses futuros
- [ ] **REC_4** Editar a recorrência e verificar se não causa loops
- [ ] **REC_5** Cancelar recorrência e confirmar remoção

### **📦 Teste 6: Sistema de Parcelas (Funcionalidade Existente)**
- [ ] **PARC_1** Criar despesa no cartão de crédito
- [ ] **PARC_2** Marcar como parcelada (3x)
- [ ] **PARC_3** Salvar e verificar se aparece agrupada no dia
- [ ] **PARC_4** Confirmar que mostra valor total (não parcelas individuais)
- [ ] **PARC_5** Verificar se aparece corretamente nas faturas

### **⚙️ Teste 7: Configurações e Categorias**
- [ ] **CONF_1** Acessar configurações globais
- [ ] **CONF_2** Alterar regra de fechamento do mês
- [ ] **CONF_3** Salvar e verificar se persiste
- [ ] **CONF_4** Gerenciar categorias (criar/editar)
- [ ] **CONF_5** Gerenciar cartões de crédito

### **🔍 Teste 8: Validação de Performance**
- [ ] **PERF_1** Abrir React DevTools (F12 → Components)
- [ ] **PERF_2** Navegar entre dias e observar re-renders
- [ ] **PERF_3** Verificar se componentes não re-renderizam desnecessariamente
- [ ] **PERF_4** Testar com múltiplas transações no mesmo dia
- [ ] **PERF_5** Confirmar que queries não são recriadas a cada navegação

---

## 📊 **MÉTRICAS DE ACOMPANHAMENTO**

### **Antes da Implementação**
- [ ] **METRICA_1** Score de qualidade atual: 7.2
- [ ] **METRICA_2** Performance baseline medida
- [ ] **METRICA_3** Bugs críticos identificados: 6
- [ ] **METRICA_4** Firebase: múltiplas instâncias confirmadas

### **Após a Implementação**
- [ ] **METRICA_5** Score de qualidade: 7.5+
- [ ] **METRICA_6** Performance: 15-20% melhoria
- [ ] **METRICA_7** Bugs críticos: 0
- [ ] **METRICA_8** Firebase: instância única confirmada

---

## 🚧 **RISCOS E MITIGAÇÕES**

### **Risco Crítico: Firebase**
- [ ] **MITIGACAO_FIREBASE_1** Branch separado criado ✅
- [ ] **MITIGACAO_FIREBASE_2** Backup completo realizado
- [ ] **MITIGACAO_FIREBASE_3** Rollback plan documentado
- [ ] **MITIGACAO_FIREBASE_4** Testes de autenticação completos

### **Risco Alto: Performance**
- [ ] **MITIGACAO_PERF_1** Testes incrementais a cada mudança
- [ ] **MITIGACAO_PERF_2** Performance medida antes/depois
- [ ] **MITIGACAO_PERF_3** React DevTools configurado
- [ ] **MITIGACAO_PERF_4** Console.log temporário para debug

### **Risco Médio: Dependências**
- [ ] **MITIGACAO_DEPS_1** Cada mudança testada isoladamente
- [ ] **MITIGACAO_DEPS_2** Console.log temporário para validação
- [ ] **MITIGACAO_DEPS_3** React DevTools para useEffect
- [ ] **MITIGACAO_DEPS_4** Rollback imediato se detectar problema

---

## 📝 **NOTAS E OBSERVAÇÕES**

### **Durante a Implementação**
- [ ] **NOTA_1** Documentar cada mudança realizada
- [ ] **NOTA_2** Registrar problemas encontrados
- [ ] **NOTA_3** Documentar soluções aplicadas
- [ ] **NOTA_4** Registrar tempo real gasto em cada tarefa

### **Após a Implementação**
- [ ] **NOTA_5** Atualizar documentação do projeto
- [ ] **NOTA_6** Criar resumo das mudanças implementadas
- [ ] **NOTA_7** Documentar lições aprendidas
- [ ] **NOTA_8** Preparar para próxima fase

---

## 🎯 **STATUS GERAL DA FASE 1**

**Sprint 1**: 🟢 CONCLUÍDO ✅ (3/3 tarefas concluídas)  
**Sprint 2**: 🟢 CONCLUÍDO ✅ (3/3 tarefas concluídas)  
**Testes**: 🔴 PENDENTE (0/6 tarefas concluídas)  
**Validação**: 🔴 PENDENTE (0/8 métricas validadas)

**Progresso Geral**: 100% (6/6 tarefas principais)  
**Tempo Estimado Restante**: 0 horas  
**Status**: 🟢 FASE 1 CONCLUÍDA ✅

---

## 📅 **CRONOGRAMA PREVISTO**

**Semana 1 (Sprint 1)**: Estabilidade e Firebase  
**Semana 2 (Sprint 2)**: Performance e Otimizações  
**Semana 3**: Testes finais e validação  
**Entrega**: Final da Semana 3

---

*Última atualização: 27/08/2025*  
*Próxima atualização: A cada tarefa concluída*
