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
 * @returns {Object} - {installmentValue: number, remainder: number, values: number[]}
 */
export const calculateInstallments = (totalValue, installments) => {
  if (!totalValue || !installments || installments < 1) {
    return { installmentValue: 0, remainder: 0, values: [] }
  }

  // Calcular valor base da parcela (sem arredondamento)
  const baseValue = totalValue / installments
  const installmentValue = Math.floor(baseValue * 100) / 100 // Truncar para 2 decimais
  const remainder = totalValue - (installmentValue * installments)

  // Criar array com valores das parcelas
  const values = Array(installments).fill(installmentValue)
  
  // Distribuir o resto nas últimas parcelas (centavos)
  const remainderCents = Math.round(remainder * 100)
  if (remainder > 0) {
    for (let i = installments - remainderCents; i < installments; i++) {
      values[i] += 0.01
    }
  }

  return {
    installmentValue: installmentValue,
    remainder: remainderCents || 0,
    values: values.map(v => Math.round(v * 100) / 100) // Garantir 2 decimais
  }
}

/**
 * Calcula as datas das faturas para cada parcela
 * @param {Date} purchaseDate - Data da compra
 * @param {Object} card - Dados do cartão de crédito
 * @param {number} installments - Número de parcelas
 * @returns {Date[]} - Array com as datas das faturas
 */
export const getInstallmentDates = (purchaseDate, card, installments) => {
  if (!purchaseDate || !card || !installments) {
    return []
  }

  const dates = []
  let currentDate = new Date(purchaseDate)

  // Determinar em qual fatura a primeira parcela vai entrar
  let firstInvoiceMonth = new Date(currentDate)
  
  // Se a compra foi depois do fechamento, vai para a próxima fatura
  if (currentDate.getDate() > card.invoiceCloseDay) {
    firstInvoiceMonth.setMonth(firstInvoiceMonth.getMonth() + 1)
  }

  // Gerar datas das próximas faturas
  for (let i = 0; i < installments; i++) {
    const invoiceDate = new Date(firstInvoiceMonth)
    invoiceDate.setMonth(invoiceDate.getMonth() + i)
    dates.push(invoiceDate)
  }

  return dates
}

/**
 * Valida uma configuração de parcelamento
 * @param {Object} config - Configuração do parcelamento
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export const validateInstallmentConfig = (config) => {
  const errors = []

  if (!config) {
    errors.push('Configuração de parcelamento é obrigatória')
    return { isValid: false, errors }
  }

  if (!config.totalValue || config.totalValue <= 0) {
    errors.push('Valor total deve ser maior que zero')
  }

  if (!config.installments || config.installments < INSTALLMENT_CONFIG.MIN_INSTALLMENTS) {
    errors.push(`Número mínimo de parcelas: ${INSTALLMENT_CONFIG.MIN_INSTALLMENTS}`)
  }

  if (config.installments > INSTALLMENT_CONFIG.MAX_INSTALLMENTS) {
    errors.push(`Número máximo de parcelas: ${INSTALLMENT_CONFIG.MAX_INSTALLMENTS}`)
  }

  if (config.totalValue && config.installments) {
    const { installmentValue } = calculateInstallments(config.totalValue, config.installments)
    if (installmentValue < INSTALLMENT_CONFIG.MIN_INSTALLMENT_VALUE) {
      errors.push(`Valor mínimo por parcela: R$ ${INSTALLMENT_CONFIG.MIN_INSTALLMENT_VALUE.toFixed(2)}`)
    }
  }

  if (!config.card || !config.card.id) {
    errors.push('Cartão de crédito é obrigatório')
  }

  if (!config.purchaseDate) {
    errors.push('Data da compra é obrigatória')
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const purchase = new Date(config.purchaseDate)
    purchase.setHours(0, 0, 0, 0)
    
    if (purchase > today) {
      errors.push('Data da compra não pode ser no futuro')
    }
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
