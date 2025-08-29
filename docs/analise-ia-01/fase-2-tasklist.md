# Fase 2 - Tasklist de Implementação
## Correções Funcionais - Calendário Financeiro

**Branch**: `feature/fase2-correcoes-funcionais`  
**Data de Início**: 28/08/2025  
**Tempo Estimado**: 16-20 horas (2 sprints)  
**Responsável**: Dev Senior + Dev Pleno

---

## 🚨 **SPRINT 3: Validações e Tratamento de Dados (8-10h)**

### **3.1 Validação de Recorrência Inconsistente** ✅ CONCLUÍDA
- [x] **3.1.1** Analisar `src/utils/recurrence.js` e identificar funções de validação ✅
- [x] **3.1.2** Localizar função que valida regras de recorrência ✅
- [x] **3.1.3** Adicionar validação de startDate < endDate ✅
- [x] **3.1.4** Testar com recorrência inválida (startDate > endDate) ✅
- [x] **3.1.5** Validar que recorrências válidas continuam funcionando ✅
- [x] **3.1.6** Testar cenários edge cases (datas iguais, datas inválidas) ✅
- [x] **3.1.7** Confirmar que erro é exibido corretamente na UI ✅

**Tempo**: 5 horas  
**Status**: ✅ CONCLUÍDA  
**Risco**: MÉDIO - Pode afetar funcionalidade de recorrências

---

### **3.2 Tratamento de Timestamps Inconsistente** ✅ CONCLUÍDA
- [x] **3.2.1** Analisar `src/hooks/useFirestoreQuery.js` e identificar conversões de Timestamp ✅
- [x] **3.2.2** Localizar loop de conversão de dados do Firestore ✅
- [x] **3.2.3** Adicionar try-catch para conversão de Timestamp ✅
- [x] **3.2.4** Implementar logging de erro com logger padronizado ✅
- [x] **3.2.5** Testar com dados válidos para confirmar que não quebra ✅
- [x] **3.2.6** Testar com dados inválidos para validar tratamento de erro ✅
- [x] **3.2.7** Verificar se logs aparecem corretamente no console ✅

**Tempo**: 4 horas  
**Status**: ✅ CONCLUÍDA  
**Risco**: BAIXO - Apenas robustez

---

### **3.3 Falta de Validação de Dados de Entrada** ✅ CONCLUÍDA
- [x] **3.3.1** Analisar `src/utils/recurrence.js` e identificar funções sem validação ✅
- [x] **3.3.2** Localizar função `getAffectedInstances` e outras funções críticas ✅
- [x] **3.3.3** Adicionar validação para parâmetro `transaction` ✅
- [x] **3.3.4** Adicionar validação para parâmetro `editOption` ✅
- [x] **3.3.5** Adicionar validação para parâmetro `allTransactions` ✅
- [x] **3.3.6** Implementar retornos seguros para dados inválidos ✅
- [x] **3.3.7** Testar com dados inválidos para validar validações ✅
- [x] **3.3.8** Confirmar que funcionalidades existentes continuam funcionando ✅

**Tempo**: 6 horas  
**Status**: ✅ CONCLUÍDA  
**Risco**: BAIXO - Validações defensivas

---

## 🚀 **SPRINT 4: Console.log e Duplicações (8-10h)**

### **4.1 Console.log Direto em Produção** ✅ CONCLUÍDA
- [x] **4.1.1** Executar busca em todo projeto por `console.log` ✅
- [x] **4.1.2** Executar busca em todo projeto por `console.warn` ✅
- [x] **4.1.3** Executar busca em todo projeto por `console.error` ✅
- [x] **4.1.4** Identificar arquivos com console.log (mínimo 15 arquivos) ✅
- [x] **4.1.5** Substituir `console.log` por `logger.info` ou remover ✅
- [x] **4.1.6** Substituir `console.warn` por `logger.warn` ✅
- [x] **4.1.7** Substituir `console.error` por `logger.error` ✅
- [x] **4.1.8** Verificar se logger está sendo importado corretamente ✅
- [x] **4.1.9** Testar se logs aparecem corretamente ✅
- [x] **4.1.10** Confirmar que não quebra funcionalidades existentes ✅

**Tempo**: 8 horas  
**Status**: ✅ CONCLUÍDA  
**Risco**: BAIXO - Padronização

---

### **4.2 Função formatFiscalMonth Duplicada** ✅ CONCLUÍDA
- [x] **4.2.1** Confirmar que `formatFiscalMonth` existe em `src/utils/helpers.js` ✅
- [x] **4.2.2** Localizar função duplicada em `src/utils/recurrence.js` ✅
- [x] **4.2.3** Remover função duplicada de `recurrence.js` ✅
- [x] **4.2.4** Adicionar import de `formatFiscalMonth` em `recurrence.js` ✅
- [x] **4.2.5** Verificar se não há outros arquivos usando a função duplicada ✅
- [x] **4.2.6** Testar se funcionalidades de recorrência continuam funcionando ✅
- [x] **4.2.7** Confirmar que build não quebra ✅

**Tempo**: 2 horas  
**Status**: ✅ CONCLUÍDA  
**Risco**: BAIXO - Eliminação de duplicação

---

### **4.3 Imports Relativos Inconsistentes** ✅ CONCLUÍDA
- [x] **4.3.1** Analisar estrutura de imports em todo projeto ✅
- [x] **4.3.2** Identificar padrão de imports (relativos vs absolutos) ✅
- [x] **4.3.3** Configurar path mapping no Vite (se necessário) ✅
- [x] **4.3.4** Padronizar imports para usar caminhos absolutos ✅
- [x] **4.3.5** Atualizar imports em `src/components/` ✅
- [x] **4.3.6** Atualizar imports em `src/views/` ✅
- [x] **4.3.7** Atualizar imports em `src/hooks/` ✅
- [x] **4.3.8** Atualizar imports em `src/utils/` ✅
- [x] **4.3.9** Verificar se build não quebra ✅
- [x] **4.3.10** Testar funcionalidades principais para confirmar funcionamento ✅

**Tempo**: 6 horas  
**Status**: ✅ CONCLUÍDA  
**Risco**: MÉDIO - Pode quebrar imports

---

## 🧪 **ROTEIRO DE TESTE PASSO A PASSO**

### **📋 Preparação para Testes**
- [ ] **PREP_1** Abrir o projeto no navegador (http://localhost:5173)
- [ ] **PREP_2** Verificar se não há erros no console do navegador
- [ ] **PREP_3** Confirmar que a aplicação carrega sem problemas

### **🔐 Teste 1: Validações de Recorrência (Sprint 3)**
- [ ] **REC_1** Acessar formulário de despesa
- [ ] **REC_2** Marcar "Transação Recorrente"
- [ ] **REC_3** Definir data de início: 2025-12-15
- [ ] **REC_4** Definir data de fim: 2025-12-10 (antes da data de início)
- [ ] **REC_5** Verificar se erro é exibido: "Data final deve ser posterior à data inicial"
- [ ] **REC_6** Corrigir data de fim para 2025-12-20
- [ ] **REC_7** Verificar se recorrência é aceita

### **⏰ Teste 2: Tratamento de Timestamps (Sprint 3)**
- [ ] **TIME_1** Verificar se dados do Firestore são carregados corretamente
- [ ] **TIME_2** Confirmar que datas aparecem formatadas corretamente
- [ ] **TIME_3** Verificar se não há erros de conversão no console
- [ ] **TIME_4** Testar com diferentes tipos de dados (transações, categorias, cartões)

### **📝 Teste 3: Validações de Dados (Sprint 3)**
- [ ] **VAL_1** Testar funcionalidades de recorrência com dados válidos
- [ ] **VAL_2** Verificar se validações não quebram funcionalidades existentes
- [ ] **VAL_3** Confirmar que erros são tratados graciosamente

### **📊 Teste 4: Console.log Padronizado (Sprint 4)**
- [ ] **LOG_1** Abrir console do navegador (F12)
- [ ] **LOG_2** Navegar pela aplicação e verificar se não há console.log direto
- [ ] **LOG_3** Confirmar que logs aparecem através do logger padronizado
- [ ] **LOG_4** Testar funcionalidades críticas (criar, editar, excluir)

### **🔗 Teste 5: Imports Consistentes (Sprint 4)**
- [ ] **IMP_1** Verificar se aplicação carrega sem erros de import
- [ ] **IMP_2** Testar funcionalidades principais
- [ ] **IMP_3** Confirmar que build não quebra
- [ ] **IMP_4** Verificar se não há warnings de imports no console

---

## 📊 **MÉTRICAS DE ACOMPANHAMENTO**

### **Antes da Implementação**
- [ ] **METRICA_1** Score de qualidade atual: 7.5+
- [ ] **METRICA_2** Bugs funcionais identificados: 3
- [ ] **METRICA_3** Console.log em produção: Presente
- [ ] **METRICA_4** Funções duplicadas: 1

### **Após a Implementação**
- [ ] **METRICA_5** Score de qualidade: 7.8+
- [ ] **METRICA_6** Bugs funcionais: 0
- [ ] **METRICA_7** Console.log: 100% padronizado
- [ ] **METRICA_8** Duplicações: 0

---

## 🚧 **RISCOS E MITIGAÇÕES**

### **Risco Alto: Validações de Recorrência**
- [ ] **MITIGACAO_REC_1** Branch separado criado
- [ ] **MITIGACAO_REC_2** Backup completo realizado
- [ ] **MITIGACAO_REC_3** Testes incrementais a cada mudança
- [ ] **MITIGACAO_REC_4** Rollback plan documentado

### **Risco Médio: Imports e Console.log**
- [ ] **MITIGACAO_IMP_1** Mudanças incrementais por arquivo
- [ ] **MITIGACAO_IMP_2** Testes após cada arquivo modificado
- [ ] **MITIGACAO_IMP_3** Commit por arquivo para facilitar rollback
- [ ] **MITIGACAO_IMP_4** Validação de build após cada mudança

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
- [ ] **NOTA_8** Preparar para próxima fase (Fase 3)

---

## 🎯 **STATUS GERAL DA FASE 2**

**Sprint 3**: 🔴 PENDENTE (0/3 tarefas concluídas)  
**Sprint 4**: 🔴 PENDENTE (0/3 tarefas concluídas)  
**Testes**: 🔴 PENDENTE (0/5 grupos de teste concluídos)  
**Validação**: 🔴 PENDENTE (0/8 métricas validadas)

**Progresso Geral**: 0% (0/6 tarefas principais)  
**Tempo Estimado Restante**: 16-20 horas  
**Status**: 🔴 FASE 2 INICIADA

---

## 📅 **CRONOGRAMA PREVISTO**

**Semana 3 (Sprint 3)**: Validações e Tratamento de Dados  
**Semana 4 (Sprint 4)**: Console.log e Duplicações  
**Semana 5**: Testes finais e validação  
**Entrega**: Final da Semana 5

---

## 🔄 **DEPENDÊNCIAS DA FASE 1**

### **Arquivos que Dependem da Fase 1**
- ✅ `src/utils/logger.js` - Logger padronizado implementado
- ✅ `src/firebase/config.js` - Firebase configurado corretamente
- ✅ `src/utils/helpers.js` - Funções utilitárias funcionando

### **Funcionalidades que Dependem da Fase 1**
- ✅ Sistema de autenticação estável
- ✅ Queries otimizadas funcionando
- ✅ Sistema de parcelas funcionando
- ✅ Correção de data de vencimento implementada

---

*Última atualização: 28/08/2025*  
*Próxima atualização: A cada tarefa concluída*
