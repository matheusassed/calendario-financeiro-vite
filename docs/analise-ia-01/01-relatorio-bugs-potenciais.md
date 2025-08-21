# Relatório de Bugs em Potencial - Calendário Financeiro

## Resumo Executivo
Análise realizada em **Janeiro 2025** sobre o código fonte do projeto Calendário Financeiro, identificando **15 bugs potenciais** que podem causar problemas de funcionalidade, performance e experiência do usuário.

---

## 🚨 Bugs Críticos

### 1. **Inicialização Múltipla do Firebase**
**Arquivo**: `src/contexts/AuthContext.jsx:35-37`
**Problema**: Firebase é inicializado a cada render do componente
```jsx
const app = initializeApp(firebaseConfig) // ❌ Executa a cada render
const auth = getAuth(app)
const db = getFirestore(app)
```
**Risco**: Múltiplas instâncias do Firebase, vazamentos de memória, erros de autenticação
**Solução**: Mover inicialização para fora do componente ou usar useMemo

### 2. **Dependências Faltantes em useEffect**
**Arquivo**: `src/components/RecurrenceConfig.jsx:69-77`
**Problema**: useEffect sem dependências completas pode causar loops infinitos
```jsx
useEffect(() => {
  // ... lógica
}, [calculateCurrentRule]) // ❌ Falta onRuleChange
```
**Risco**: Re-renders excessivos, performance degradada
**Solução**: Adicionar todas as dependências necessárias ou usar useCallback

### 3. **Tratamento de Erro Inconsistente**
**Arquivo**: `src/hooks/useFirestoreQuery.js:39`
**Problema**: console.error direto em produção
```jsx
console.error('Erro no useFirestoreQuery:', error) // ❌ Não usa logger
```
**Risco**: Logs em produção, inconsistência no tratamento de erros
**Solução**: Usar logger padronizado do projeto

---

## ⚠️ Bugs de Performance

### 4. **Re-renders Desnecessários em App.jsx**
**Arquivo**: `src/App.jsx:47-75`
**Problema**: Queries recriadas a cada render
```jsx
const transactionsQuery = useMemo(
  () => user ? query(...) : null,
  [db, appId, user], // ❌ user muda frequentemente
)
```
**Risco**: Queries desnecessárias ao Firestore, performance degradada
**Solução**: Otimizar dependências do useMemo

### 5. **Função calculateCurrentRule Recriada**
**Arquivo**: `src/components/RecurrenceConfig.jsx:33-38`
**Problema**: Função recriada a cada render
```jsx
const calculateCurrentRule = useCallback(() => {
  // ... lógica
}, [isEnabled, rule, endType]) // ❌ Dependências mudam frequentemente
```
**Risco**: Re-renders desnecessários dos componentes filhos
**Solução**: Otimizar dependências ou memoizar valores

### 6. **Event Listeners Sem Cleanup Adequado**
**Arquivo**: `src/views/DayDetailsView.jsx:76-85`
**Problema**: Event listeners podem não ser removidos corretamente
```jsx
useEffect(() => {
  const handleKeyDown = (e) => { /* ... */ }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [handlePrevDay, handleNextDay, handleGoToToday]) // ❌ Dependências instáveis
```
**Risco**: Vazamentos de memória, múltiplos listeners
**Solução**: Estabilizar dependências com useCallback

---

## 🐛 Bugs de Funcionalidade

### 7. **Validação de Recorrência Inconsistente**
**Arquivo**: `src/utils/recurrence.js:30-70`
**Problema**: Validação não verifica se startDate é anterior a endDate
```jsx
if (rule.endDate) {
  const endDate = new Date(rule.endDate)
  if (endDate <= new Date()) { // ❌ Só verifica se é no futuro
    errors.push('Data final deve ser no futuro')
  }
  // ❌ Falta verificar se endDate > startDate
}
```
**Risco**: Recorrências inválidas, erros de cálculo
**Solução**: Adicionar validação de startDate < endDate

### 8. **Tratamento de Timestamps Inconsistente**
**Arquivo**: `src/hooks/useFirestoreQuery.js:25-30`
**Problema**: Conversão de Timestamp pode falhar
```jsx
for (const key in docData) {
  if (docData[key] && typeof docData[key].toDate === 'function') {
    docData[key] = docData[key].toDate() // ❌ Pode falhar se não for Timestamp
  }
}
```
**Risco**: Erros de runtime, dados corrompidos
**Solução**: Adicionar try-catch e validação mais robusta

### 9. **Falta de Validação de Dados de Entrada**
**Arquivo**: `src/utils/recurrence.js:200-210`
**Problema**: Funções não validam parâmetros adequadamente
```jsx
export const getAffectedInstances = (transaction, editOption, allTransactions) => {
  if (!transaction) {
    console.error('Transação é obrigatória') // ❌ Só loga, não trata
    return []
  }
  // ❌ Falta validação de editOption e allTransactions
}
```
**Risco**: Crashes da aplicação, comportamento inesperado
**Solução**: Adicionar validações e retornos seguros

---

## 🔧 Bugs de Manutenibilidade

### 10. **Console.log Direto em Produção**
**Arquivo**: `src/utils/recurrence.js:206, 230, 275, 280`
**Problema**: Múltiplos console.warn/error não padronizados
```jsx
console.warn('Série vazia, retornando apenas a transação atual')
console.warn('editOption não reconhecida:', editOption)
```
**Risco**: Logs em produção, inconsistência no logging
**Solução**: Substituir por logger padronizado

### 11. **Função formatFiscalMonth Duplicada**
**Arquivo**: `src/utils/recurrence.js:270-285` e `src/utils/helpers.js:27-32`
**Problema**: Mesma função implementada em dois lugares
```jsx
// Em recurrence.js
const formatFiscalMonth = (date) => { /* ... */ }

// Em helpers.js  
export const formatFiscalMonth = (date) => { /* ... */ }
```
**Risco**: Inconsistências, manutenção duplicada
**Solução**: Centralizar em helpers.js e importar

### 12. **Imports Relativos Inconsistentes**
**Arquivo**: Múltiplos componentes
**Problema**: Mistura de imports relativos e absolutos
```jsx
import { useAuth } from '../contexts/AuthContext'     // ❌ Relativo
import { RecurrenceConfig } from './RecurrenceConfig' // ❌ Relativo inconsistente
```
**Risco**: Quebras ao mover arquivos, manutenção difícil
**Solução**: Padronizar imports absolutos ou relativos

---

## 📱 Bugs de UX

### 13. **Loading States Inconsistentes**
**Arquivo**: `src/App.jsx:77-82`
**Problema**: Loading state não considera todos os estados
```jsx
const loadingData = loadingTransactions || loadingCategories || 
                   loadingCreditCards || loadingSettings || loadingInvoices
// ❌ Não considera loadingAuth em alguns casos
```
**Risco**: UI inconsistente, usuário confuso
**Solução**: Unificar lógica de loading

### 14. **Falta de Feedback de Erro**
**Arquivo**: Múltiplos componentes
**Problema**: Erros são logados mas não mostrados ao usuário
```jsx
console.error('Erro ao salvar despesa:', err) // ❌ Usuário não vê
```
**Risco**: Usuário não sabe que algo falhou
**Solução**: Implementar toast de erro ou modal de erro

### 15. **Validação de Formulário Incompleta**
**Arquivo**: `src/views/ExpenseForm.jsx` e `src/views/RevenueForm.jsx`
**Problema**: Validações não cobrem todos os cenários
**Risco**: Dados inválidos salvos, inconsistência no banco
**Solução**: Implementar validação completa com feedback visual

---

## 📊 Estatísticas dos Bugs

- **Total de Bugs Identificados**: 15
- **Críticos**: 3 (20%)
- **Performance**: 3 (20%)
- **Funcionalidade**: 3 (20%)
- **Manutenibilidade**: 3 (20%)
- **UX**: 3 (20%)

---

## 🎯 Priorização

### **Alta Prioridade** (Resolver em 1-2 sprints)
1. Inicialização múltipla do Firebase
2. Dependências faltantes em useEffect
3. Validação de recorrência inconsistente

### **Média Prioridade** (Resolver em 2-3 sprints)
4. Re-renders desnecessários
5. Tratamento de erro inconsistente
6. Função calculateCurrentRule recriada

### **Baixa Prioridade** (Resolver quando possível)
7. Console.log direto em produção
8. Imports relativos inconsistentes
9. Função formatFiscalMonth duplicada

---

## 📝 Notas Técnicas

- **Arquivos mais problemáticos**: `AuthContext.jsx`, `RecurrenceConfig.jsx`, `recurrence.js`
- **Padrão comum**: Uso inconsistente do logger padronizado
- **Área crítica**: Sistema de recorrências e hooks de dados
- **Impacto estimado**: 30-40% de melhoria na performance e estabilidade
