/**
 * Utilitários para cálculo e gerenciamento de compras parceladas
 */

import { formatFiscalMonth } from './helpers'

/**
 * Configurações de parcelamento
 */
export const INSTALLMENT_CONFIG = {
  MIN_INSTALLMENTS: 2,
  MAX_INSTALLMENTS: 24,
  MIN_INSTALLMENT_VALUE: 1.00
}

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

    dates.push(date)
  }

  return dates
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

/**
 * Cria uma instância de parcela
 * @param {Object} baseTransaction - Dados base da transação
 * @param {Object} installmentConfig - Configuração do parcelamento
 * @param {number} index - Índice da parcela (0-based)
 * @param {Date} invoiceDate - Data da fatura desta parcela
 * @param {number} installmentValue - Valor desta parcela específica
 * @param {string} installmentId - ID da série
 * @returns {Object} - Dados da parcela
 */
export const createInstallmentInstance = (
  baseTransaction,
  installmentConfig,
  index,
  invoiceDate,
  installmentValue,
  installmentId
) => {
  // eslint-disable-next-line no-unused-vars
  const { id, value, ...cleanBaseTransaction } = baseTransaction

  return {
    ...cleanBaseTransaction,
    value: installmentValue,
    date: new Date(invoiceDate), // Usar data da fatura para a parcela
    fiscalMonth: formatFiscalMonth(invoiceDate), // Mês fiscal baseado na fatura
    installmentId,
    installmentIndex: index + 1, // 1-based para o usuário
    installmentTotal: installmentConfig.installments,
    installmentValue: installmentValue,
    totalValue: installmentConfig.totalValue,
    originalPurchaseDate: installmentConfig.purchaseDate,
    isInstallment: true,
    // Modificar descrição para incluir parcela
    description: `${baseTransaction.description} (${index + 1}/${installmentConfig.installments})`,
    createdAt: new Date()
  }
}

/**
 * Gera todas as parcelas de uma compra
 * @param {Object} baseTransaction - Transação base
 * @param {Object} installmentConfig - Configuração do parcelamento
 * @returns {Array} - Array com todas as parcelas
 */
export const generateInstallmentSeries = (baseTransaction, installmentConfig) => {
  const validation = validateInstallmentConfig(installmentConfig)
  if (!validation.isValid) {
    throw new Error(`Configuração inválida: ${validation.errors.join(', ')}`)
  }

  const installmentId = generateInstallmentId()

  // Criar transação principal (compra) sem valor contabilizado
  const brlStringTotalValue = installmentConfig.totalValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  const brlStringInstallmentValue = installmentConfig.installmentValue.installmentValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  const mainTransaction = {
    ...baseTransaction,
    value: 0,
    isInstallmentMaster: true,
    installmentId,
    installmentTotal: installmentConfig.installments,
    description: `${baseTransaction.description} (Compra Parcelada) - ${brlStringTotalValue} em ${installmentConfig.installments}x de ${brlStringInstallmentValue}`,
    installmentValue: installmentConfig.installmentValue.installmentValue,
  }
  const { values } = calculateInstallments(installmentConfig.totalValue, installmentConfig.installments)
  const invoiceDates = getInstallmentDates(
    installmentConfig.purchaseDate,
    installmentConfig.card,
    installmentConfig.installments
  )

  const installments = []

  for (let i = 0; i < installmentConfig.installments; i++) {
    const installment = createInstallmentInstance(
      baseTransaction,
      installmentConfig,
      i,
      invoiceDates[i],
      values[i],
      installmentId
    )
    installments.push(installment)
  }

  return {
    mainTransaction,
    installments
  }
}

/**
 * Obtém informações resumidas de uma série de parcelas
 * @param {string} installmentId - ID da série
 * @param {Array} allTransactions - Todas as transações
 * @returns {Object} - Informações da série
 */
export const getInstallmentSeriesInfo = (installmentId, allTransactions) => {
  const series = getInstallmentSeries(installmentId, allTransactions)

  if (series.length === 0) {
    return null
  }

  const first = series[0]
  const totalPaid = series.reduce((sum, t) => sum + t.value, 0)

  return {
    installmentId,
    totalInstallments: first.installmentTotal,
    currentInstallments: series.length,
    totalValue: first.totalValue,
    totalPaid,
    remaining: first.totalValue - totalPaid,
    originalDate: first.originalPurchaseDate,
    description: first.description.replace(/\s*\(\d+\/\d+\)$/, ''), // Remover sufixo de parcela
    card: first.cardId
  }
}

/**
 * Cancela parcelas restantes de uma série
 * @param {string} installmentId - ID da série
 * @param {number} fromIndex - A partir de qual índice cancelar (1-based)
 * @param {Array} allTransactions - Todas as transações
 * @param {Object} db - Instância do Firestore
 * @param {string} collectionPath - Caminho da coleção
 * @returns {Promise<number>} - Número de parcelas canceladas
 */
export const cancelRemainingInstallments = async (
  installmentId,
  fromIndex,
  allTransactions,
  db,
  collectionPath
) => {
  const { writeBatch, doc } = await import('firebase/firestore')

  const series = getInstallmentSeries(installmentId, allTransactions)
  const toCancel = series.filter(t => t.installmentIndex >= fromIndex)

  if (toCancel.length === 0) {
    return 0
  }

  const batch = writeBatch(db)

  toCancel.forEach(installment => {
    const docRef = doc(db, collectionPath, installment.id)
    batch.delete(docRef)
  })

  await batch.commit()
  return toCancel.length
}

/**
 * Obtém a descrição legível de um parcelamento
 * @param {Object} installmentConfig - Configuração do parcelamento
 * @returns {string} - Descrição do parcelamento
 */
export const getInstallmentDescription = (installmentConfig) => {
  if (!installmentConfig) return ''

  const { values } = calculateInstallments(installmentConfig.totalValue, installmentConfig.installments)
  const hasRemainder = values[0] !== values[values.length - 1]

  if (hasRemainder) {
    return `${installmentConfig.installments}x de R$ ${values[0].toFixed(2)} (última: R$ ${values[values.length - 1].toFixed(2)})`
  }

  return `${installmentConfig.installments}x de R$ ${values[0].toFixed(2)}`
}

/**
 * Formata uma parcela para exibição
 * @param {Object} installment - Dados da parcela
 * @returns {string} - Texto formatado
 */
export const formatInstallmentDisplay = (installment) => {
  if (!isInstallmentTransaction(installment)) {
    return installment.description
  }

  return `${installment.description} (${installment.installmentIndex}/${installment.installmentTotal})`
}
