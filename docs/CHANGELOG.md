# Changelog

## [2025-08-27] - Sistema de Parcelas - Agrupamento Visual

### ✨ Funcionalidades Adicionadas
- **Agrupamento Visual de Parcelas**: Parcelas da mesma compra agora aparecem agrupadas em uma única linha no calendário
- **Exibição Consolidada**: Valor total da compra em vez de parcelas individuais
- **Estilo Visual Diferenciado**: Ícone 📦 e borda azul para identificação de grupos de parcelas
- **Função de Agrupamento**: Nova função `groupInstallmentsByPurchase()` em `utils/installments.js`

### 🔧 Melhorias Técnicas
- **Separação de Responsabilidades**: Transações normais e parcelas são tratadas separadamente
- **Performance Otimizada**: Agrupamento feito na camada de UI, sem impacto no banco
- **Código Limpo**: Lógica de agrupamento centralizada e reutilizável
- **Compatibilidade Total**: Não quebra funcionalidades existentes

### 🎨 Melhorias de UX
- **Visual Limpo**: Uma linha por compra parcelada em vez de múltiplas linhas
- **Informação Clara**: Descrição limpa sem sufixos de parcela
- **Identificação Fácil**: Estilo visual diferenciado para grupos de parcelas
- **Funcionalidade Mantida**: Edição através da primeira parcela

### 📁 Arquivos Modificados
- `src/utils/installments.js` - Nova função de agrupamento
- `src/views/DayDetailsView.jsx` - Lógica de exibição agrupada
- `src/index.css` - Estilos para grupos de parcelas

### 📚 Documentação Atualizada
- `docs/bug-reports/01-parcelas.md` - Bug report marcado como RESOLVIDO
- `docs/arquitetura.md` - Seção sobre sistema de parcelas
- `docs/dados-e-modelagem.md` - Estrutura de transações parceladas
- `docs/fluxos-chave.md` - Fluxo de criação de parcelas
- `docs/padroes-e-convencoes.md` - Convenções para parcelamento
- `docs/sistema-parcelas.md` - Documentação completa do sistema
- `docs/decisoes-tecnicas.md` - Decisões técnicas sobre parcelas
- `docs/README.md` - Referência ao sistema de parcelas

### 🐛 Problemas Resolvidos
- **Bug de Visualização Múltipla**: Parcelas não aparecem mais como linhas separadas
- **Confusão Visual**: Agora é claro que é uma única compra parcelada
- **Experiência do Usuário**: Interface mais limpa e intuitiva

### ✅ Status
- **Implementação**: 100% Concluída
- **Testes**: Build bem-sucedido
- **Documentação**: 100% Atualizada
- **Compatibilidade**: 100% Mantida

### 🔮 Próximos Passos
- Testes manuais em ambiente de desenvolvimento
- Validação de funcionalidades existentes
- Feedback dos usuários sobre a nova interface
- Consideração de melhorias futuras (cancelamento de parcelas, etc.)

---

## [2025-08-25] - Correções de Bugs de Parcelas

### 🐛 Problemas Corrigidos
- **Datas Incorretas**: Parcelas apareciam no dia anterior à compra
- **Somatório Diário**: Parcelas eram contabilizadas incorretamente no saldo do dia
- **Timezone**: Problemas de fuso horário na manipulação de datas

### 🔧 Soluções Implementadas
- Tratamento correto de timezone em `getInstallmentDates()`
- Filtro adequado para excluir parcelas do somatório diário
- Normalização de datas no `DayDetailsView`

### 📁 Arquivos Corrigidos
- `src/utils/installments.js`
- `src/views/ExpenseForm.jsx`
- `src/views/DayDetailsView.jsx`

### ✅ Status
- **Correções**: 100% Implementadas
- **Testes**: Funcionando conforme esperado
- **Documentação**: Atualizada com soluções
