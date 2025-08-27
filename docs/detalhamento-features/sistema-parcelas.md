# Sistema de Parcelas

## Visão Geral

O sistema de parcelas permite criar compras no cartão de crédito divididas em múltiplas faturas, com exibição visual agrupada no calendário.

## Funcionalidades

### Criação de Parcelas
- **Configuração**: 2 a 24 parcelas por compra
- **Valor**: Cálculo automático com distribuição de centavos
- **Datas**: Baseadas no dia de fechamento do cartão
- **Faturas**: Cada parcela é associada à fatura correta

### Exibição Visual
- **Agrupamento**: Parcelas aparecem consolidadas no dia da compra
- **Valor Total**: Exibe o valor total da compra, não individual
- **Descrição Limpa**: Sem sufixos de parcela na visualização
- **Estilo Diferenciado**: Ícone 📦 e borda azul para identificação

## Arquitetura

### Componentes Principais
- `InstallmentConfig`: Configuração de parcelamento
- `ExpenseForm`: Criação de despesas parceladas
- `DayDetailsView`: Exibição agrupada no calendário

### Utilitários
- `utils/installments.js`: Lógica de cálculo e agrupamento
- `groupInstallmentsByPurchase()`: Função de agrupamento visual

### Estrutura de Dados
```javascript
// Exemplo de parcela
{
  id: "parcela_id",
  isInstallment: true,
  installmentId: "compra_abc123",
  installmentIndex: 1,
  installmentTotal: 3,
  installmentValue: 40.00,
  totalValue: 120.00,
  description: "teste (1/3)",
  date: "2025-04-02T15:00:00.000Z",
  invoiceDate: "2025-04-02T15:00:00.000Z",
  fiscalMonth: "2025-04"
}
```

## Fluxo de Funcionamento

### 1. Criação
1. Usuário seleciona cartão de crédito
2. Marca "Parcelar compra"
3. Define número de parcelas
4. Sistema gera todas as parcelas
5. Cada parcela é salva individualmente

### 2. Exibição
1. `DayDetailsView` recebe transações do dia
2. Separa transações normais de parcelas
3. Agrupa parcelas por `installmentId`
4. Renderiza grupos consolidados
5. Mantém funcionalidade de edição

### 3. Faturas
1. Cada parcela tem `invoiceDate` e `fiscalMonth`
2. Sistema associa parcelas às faturas corretas
3. Controle individual para pagamentos
4. Agrupamento apenas na camada de apresentação

## Vantagens da Implementação

### Para o Usuário
- **Visual Limpo**: Uma linha por compra parcelada
- **Informação Clara**: Valor total e quantidade de parcelas
- **Fácil Identificação**: Estilo visual diferenciado
- **Funcionalidade Completa**: Edição e controle mantidos

### Para o Sistema
- **Flexibilidade**: Controle individual de cada parcela
- **Consistência**: Dados estruturados para faturas
- **Performance**: Agrupamento na camada de UI
- **Manutenibilidade**: Código limpo e focado

## Casos de Uso

### Compra Simples
- 1 parcela = compra normal no cartão
- Aparece como transação individual
- Contabiliza normalmente na fatura

### Compra Parcelada
- 2+ parcelas = compra parcelada
- Aparece agrupada no calendário
- Cada parcela em fatura separada
- Valor total visível no dia da compra

### Edição
- Editar primeira parcela modifica todas
- Descrição e categoria sincronizadas
- Valores e parcelas mantidos
- Histórico preservado

## Configurações

### Limites
- **Mínimo**: 2 parcelas
- **Máximo**: 24 parcelas
- **Valor mínimo por parcela**: R$ 1,00

### Validações
- Cartão de crédito obrigatório
- Data de compra válida
- Valor total positivo
- Número de parcelas dentro dos limites

## Troubleshooting

### Problemas Comuns
1. **Parcelas não aparecem agrupadas**
   - Verificar se `installmentId` está sendo gerado
   - Confirmar que `isInstallment: true`

2. **Valor total incorreto**
   - Verificar função `calculateInstallments`
   - Confirmar distribuição de centavos

3. **Datas incorretas**
   - Verificar `getInstallmentDates`
   - Confirmar configuração do cartão

### Logs Úteis
- Console: "Erro ao gerar preview de parcelas"
- Console: "Configuração de parcelamento inválida"
- Toast: "Compra parcelada em Xx criada com sucesso!"

## Futuras Melhorias

### Funcionalidades
- [ ] Cancelamento de parcelas futuras
- [ ] Alteração de número de parcelas
- [ ] Histórico de alterações
- [ ] Relatórios de parcelamento

### Técnicas
- [ ] Cache de grupos de parcelas
- [ ] Otimização de queries
- [ ] Validações mais robustas
- [ ] Testes automatizados
