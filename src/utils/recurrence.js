/**
 * Utilitários para gerenciamento de transações recorrentes
 */

/**
 * Tipos de recorrência disponíveis
 */
export const RECURRENCE_TYPES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
}

/**
 * Opções para modificação de séries recorrentes
 */
export const EDIT_OPTIONS = {
  THIS_ONLY: 'this_only',
  THIS_AND_FUTURE: 'this_and_future',
  ALL: 'all'
}

/**
 * Valida uma regra de recorrência
 * @param {Object} rule - A regra de recorrência
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export const validateRecurrenceRule = (rule) => {
  const errors = []

  if (!rule) {
    errors.push('Regra de recorrência é obrigatória')
    return { isValid: false, errors }
  }

  if (!Object.values(RECURRENCE_TYPES).includes(rule.type)) {
    errors.push('Tipo de recorrência inválido')
  }

  if (!rule.interval || rule.interval < 1) {
    errors.push('Intervalo deve ser maior que zero')
  }

  if (rule.type === RECURRENCE_TYPES.CUSTOM && !rule.interval) {
    errors.push('Intervalo é obrigatório para recorrência personalizada')
  }

  // Validar data final OU contador
  if (!rule.endDate && !rule.count) {
    errors.push('Deve especificar uma data final ou número de ocorrências')
  }

  if (rule.endDate && rule.count) {
    errors.push('Especifique apenas data final OU número de ocorrências')
  }

  if (rule.endDate) {
    const endDate = new Date(rule.endDate)
    if (endDate <= new Date()) {
      errors.push('Data final deve ser no futuro')
    }
  }

  if (rule.count && rule.count < 2) {
    errors.push('Número de ocorrências deve ser pelo menos 2')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calcula a próxima data com base na regra de recorrência
 * @param {Date} currentDate - Data atual
 * @param {Object} rule - Regra de recorrência
 * @returns {Date} - Próxima data
 */
export const calculateNextDate = (currentDate, rule) => {
  const nextDate = new Date(currentDate)

  switch (rule.type) {
    case RECURRENCE_TYPES.MONTHLY:
      nextDate.setMonth(nextDate.getMonth() + (rule.interval || 1))
      break
    case RECURRENCE_TYPES.YEARLY:
      nextDate.setFullYear(nextDate.getFullYear() + (rule.interval || 1))
      break
    case RECURRENCE_TYPES.CUSTOM:
      // Para custom, tratamos como mensal por padrão
      nextDate.setMonth(nextDate.getMonth() + (rule.interval || 1))
      break
    default:
      throw new Error(`Tipo de recorrência não suportado: ${rule.type}`)
  }

  return nextDate
}

/**
 * Gera todas as datas de uma série recorrente
 * @param {Date} startDate - Data inicial
 * @param {Object} rule - Regra de recorrência
 * @param {number} maxInstances - Máximo de instâncias (padrão: 12)
 * @returns {Date[]} - Array com todas as datas
 */
export const generateRecurrenceDates = (startDate, rule, maxInstances = 12) => {
  const validation = validateRecurrenceRule(rule)
  if (!validation.isValid) {
    throw new Error(`Regra inválida: ${validation.errors.join(', ')}`)
  }

  const dates = [new Date(startDate)]
  let currentDate = new Date(startDate)
  let instanceCount = 1

  const endDate = rule.endDate ? new Date(rule.endDate) : null
  const maxCount = rule.count || maxInstances

  while (instanceCount < maxCount) {
    currentDate = calculateNextDate(currentDate, rule)

    // Verificar se excedeu a data limite
    if (endDate && currentDate > endDate) {
      break
    }

    // Verificar se excedeu o limite de instâncias
    if (instanceCount >= maxInstances) {
      break
    }

    dates.push(new Date(currentDate))
    instanceCount++
  }

  return dates
}

/**
 * Cria um ID único para uma série recorrente
 * @returns {string} - ID único
 */
export const generateRecurrenceId = () => {
  return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Verifica se uma transação faz parte de uma série recorrente
 * @param {Object} transaction - Transação
 * @returns {boolean}
 */
export const isRecurringTransaction = (transaction) => {
  return !!(transaction.recurrenceId && transaction.isRecurring)
}

/**
 * Obtém todas as transações de uma série recorrente
 * @param {string} recurrenceId - ID da série
 * @param {Array} allTransactions - Todas as transações
 * @returns {Array} - Transações da série ordenadas por índice
 */
export const getRecurrenceSeries = (recurrenceId, allTransactions) => {
  return allTransactions
    .filter(t => t.recurrenceId === recurrenceId)
    .sort((a, b) => (a.recurrenceIndex || 0) - (b.recurrenceIndex || 0))
}

/**
 * Calcula quais instâncias devem ser afetadas por uma operação
 * @param {Object} transaction - Transação sendo editada
 * @param {string} editOption - Opção de edição (THIS_ONLY, THIS_AND_FUTURE, ALL)
 * @param {Array} allTransactions - Todas as transações
 * @returns {Array} - IDs das transações que devem ser afetadas
 */
export const getAffectedInstances = (transaction, editOption, allTransactions) => {
  if (!isRecurringTransaction(transaction)) {
    return [transaction.id]
  }

  const series = getRecurrenceSeries(transaction.recurrenceId, allTransactions)
  const currentIndex = transaction.recurrenceIndex || 0

  switch (editOption) {
    case EDIT_OPTIONS.THIS_ONLY:
      return [transaction.id]

    case EDIT_OPTIONS.THIS_AND_FUTURE:
      return series
        .filter(t => (t.recurrenceIndex || 0) >= currentIndex)
        .map(t => t.id)

    case EDIT_OPTIONS.ALL:
      return series.map(t => t.id)

    default:
      return [transaction.id]
  }
}

/**
 * Cria os dados base para uma transação recorrente
 * @param {Object} baseTransaction - Dados base da transação
 * @param {Object} rule - Regra de recorrência
 * @param {Date} instanceDate - Data desta instância
 * @param {number} index - Índice na série
 * @param {string} recurrenceId - ID da série
 * @returns {Object} - Dados da transação recorrente
 */
export const createRecurrenceInstance = (
  baseTransaction,
  rule,
  instanceDate,
  index,
  recurrenceId
) => {
  const { id, ...cleanBaseTransaction } = baseTransaction

  if (id){
    console.log('Criando instância de recorrência:', id)
  }

  return {
    ...cleanBaseTransaction,
    date: instanceDate,
    recurrenceId,
    recurrenceIndex: index,
    recurrenceRule: rule,
    isRecurring: true,
    fiscalMonth: formatFiscalMonth(instanceDate),
    createdAt: new Date()
  }
}

/**
 * Formata um objeto Date para uma string no formato "YYYY-MM"
 * (Duplicado de helpers.js para evitar dependência circular)
 */
const formatFiscalMonth = (date) => {
  if (!date || typeof date.getFullYear !== 'function') {
    return ''
  }
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Obtém a descrição legível de uma regra de recorrência
 * @param {Object} rule - Regra de recorrência
 * @returns {string} - Descrição da regra
 */
export const getRecurrenceDescription = (rule) => {
  if (!rule) return ''

  const { type, interval = 1, endDate, count } = rule

  let description = ''

  switch (type) {
    case RECURRENCE_TYPES.MONTHLY:
      description = interval === 1 ? 'Mensalmente' : `A cada ${interval} meses`
      break
    case RECURRENCE_TYPES.YEARLY:
      description = interval === 1 ? 'Anualmente' : `A cada ${interval} anos`
      break
    case RECURRENCE_TYPES.CUSTOM:
      description = `A cada ${interval} meses`
      break
    default:
      description = 'Recorrência personalizada'
  }

  if (endDate) {
    const formattedDate = new Date(endDate).toLocaleDateString('pt-BR')
    description += ` até ${formattedDate}`
  } else if (count) {
    description += ` por ${count} vezes`
  }

  return description
}