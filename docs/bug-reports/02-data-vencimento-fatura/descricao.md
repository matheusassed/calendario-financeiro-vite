Você deve propor uma correção de bug no projeto, considerando padrões e arquitetura documentados em @/docs.

**Descrição do bug**: Ao configurar um cartão de crédito onde o vencimento da fatura é no início do mês e o vencimento no final do mês, logicamente o vencimento deve no mês seguinte. Hoje se eu crio um cartão que o fechamento é no dia 27 e o vencimento dia 01, ao criar uma transação, o valor foi pra fatura no passado.

**Comportamento esperado**:
1. Criar cartão com fechamento no fim do mês e vencimento no mês seguinte
2. Criar uma transação
3. Fatura do mês seguinte alterada

**Passos para reproduzir**:
1. Criar cartão com fechamento no fim do mês e vencimento no mês seguinte
2. Criar uma transação
3. Obervar fatura no passado

**Arquivos afetados**:
- `src/utils/helpers.js` - Nova função `calculateInvoiceMonth`
- `src/utils/installments.js` - Lógica de parcelamento corrigida
- `src/views/ExpenseForm.jsx` - Lógica de compra simples corrigida

**Possíveis causas**:
- Erro na lógica de criação de fatura
- Não considerava que vencimentos no início do mês (dias 1-5) devem sempre ir para o mês seguinte

**Critérios de aceite**:
- [x] Bug corrigido ✅
- [x] Não quebra outras funcionalidades ✅
- [x] Testado em cenários similares ✅

**Solução Implementada**:
1. **Nova função utilitária**: `calculateInvoiceMonth()` em `helpers.js`
2. **Lógica inteligente**: Identifica automaticamente cartões com vencimento no início do mês (dias 1-5)
3. **Regra especial**: Para esses cartões, fatura sempre no mês seguinte ao fechamento
4. **Compatibilidade**: Mantém comportamento normal para cartões com vencimento no meio/fim do mês
5. **Consistência**: Aplica a mesma lógica para compras simples e parceladas

**Arquivos Modificados**:
- `src/utils/helpers.js` - Nova função `calculateInvoiceMonth`
- `src/utils/installments.js` - Função `getInstallmentDates` corrigida
- `src/views/ExpenseForm.jsx` - Lógica de compra simples corrigida

**Status**: 🟢 **RESOLVIDO** ✅

**Data de Resolução**: 27/08/2025
**Responsável**: Dev Senior + Dev Pleno
**Tempo Gasto**: 2 horas

➡️ **Formato de saída esperado**:
1. Hipótese da causa raiz
2. Explicação da solução proposta
3. Código sugerido nos arquivos relevantes
4. Checklist de testes a rodar

📋 **Checklist de Qualidade**:
- [ ] Código compila sem erros
- [ ] ESLint passa sem warnings novos
- [ ] Funcionalidade testada manualmente
- [ ] Não quebra funcionalidades existentes
- [ ] Segue padrões estabelecidos
- [ ] Documentação atualizada (se necessário)
- [ ] Nomes descritivos e sem abreviações
- [ ] Performance não degradada
- [ ] Logs de debug removidos ou convertidos para logger.js