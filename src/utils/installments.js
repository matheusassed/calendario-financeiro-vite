/**
 * Utilitários para cálculo e gerenciamento de compras parceladas
 */

/**
 * Calcula o valor de cada parcela
 * @param {number} totalValue - Valor total da compra
 * @param {number} installments - Número de parcelas
 * @returns {number} Valor de cada parcela
 */
export const calculateInstallments = (totalValue, installments) => {
  if (installments <= 0) return 0
  const value = totalValue / installments
  // Arredonda para 2 casas decimais e trata casos de divisão não exata
  const rounded = Math.round(value * 100) / 100
  return installments === 1 ? totalValue : rounded
}

/**
 * Gera as datas das parcelas baseado na data de compra e ciclo do cartão
 * @param {Date} purchaseDate - Data da compra original
 * @param {Object} card - Objeto do cartão de crédito
 * @param {number} installments - Número de parcelas
 * @returns {Date[]} Array de datas das parcelas
 */
export const getInstallmentDates = (purchaseDate, card, installments) => {
  if (!card || !card.invoiceCloseDay) {
    throw new Error('Cartão inválido ou sem dia de fechamento definido')
  }

  const dates = []
  const baseDate = new Date(purchaseDate)
  
  for (let i = 0; i < installments; i++) {
    const date = new Date(baseDate)
    date.setMonth(date.getMonth() + i)
    
    // Ajusta para o mês de fechamento correto
    if (date.getDate() > card.invoiceCloseDay) {
      date.setMonth(date.getMonth() + 1)
    }
    date.setDate(card.invoiceCloseDay)
    
    // Ensure we're using the correct fiscal month for the invoice
    const invoiceMonthDate = new Date(date)
    if (invoiceMonthDate.getDate() > card.invoiceCloseDay) {
      invoiceMonthDate.setMonth(invoiceMonthDate.getMonth() + 1)
    }
    invoiceMonthDate.setDate(card.invoiceCloseDay)

    dates.push(invoiceMonthDate)
  }

  return dates
}

/**
 * Gera uma série de transações parceladas
 * @param {Object} baseTransaction - Transação base (modelo para todas as parcelas)
 * @param {Object} config - Configuração do parcelamento
 * @param {number} config.totalValue - Valor total
 * @param {number} config.installments - Número de parcelas
 * @param {Object} config.card - Cartão de crédito usado
 * @returns {Object[]} Array de transações parceladas
 */
export const generateInstallmentSeries = (baseTransaction, config) => {
  const { totalValue, installments, card } = config
  const installmentValue = calculateInstallments(totalValue, installments)
  const dates = getInstallmentDates(baseTransaction.date, card, installments)
  const installmentId = `inst_${Date.now()}` // ID único para agrupar as parcelas

  return dates.map((date, index) => ({
    ...baseTransaction,
    id: `${baseTransaction.id}_${index + 1}`,
    date: date.toISOString(),
    installmentId,
    installmentIndex: index + 1,
    installmentTotal: installments,
    installmentValue: index === installments - 1 
      ? totalValue - (installmentValue * (installments - 1)) // Última parcela ajustada
      : installmentValue,
    totalValue,
    isInstallment: true,
    description: `${baseTransaction.description} (${index + 1}/${installments})`
  }))
}

/**
 * Valida os parâmetros de um parcelamento
 * @param {number} totalValue - Valor total
 * @param {number} installments - Número de parcelas
 * @param {Object} card - Cartão de crédito
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateInstallment = (totalValue, installments, card) => {
  const errors = []
  
  if (totalValue <= 0) {
    errors.push('O valor total deve ser maior que zero')
  }
  
  if (installments < 1 || installments > 24) {
    errors.push('O número de parcelas deve estar entre 1 e 24')
  }
  
  const installmentValue = calculateInstallments(totalValue, installments)
  if (installmentValue < 10) {
    errors.push('O valor mínimo por parcela é R$ 10,00')
  }
  
  if (!card || !card.id) {
    errors.push('Selecione um cartão de crédito válido')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
