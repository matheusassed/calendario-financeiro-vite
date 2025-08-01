/* eslint-disable no-unused-vars */
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
  // Validações
  if (!transaction || !transaction.id) {
    console.error('Transação inválida:', transaction)
    return []
  }

  if (!editOption) {
    console.error('editOption é obrigatório')
    return [transaction.id]
  }

  if (!allTransactions || !Array.isArray(allTransactions)) {
    console.error('allTransactions deve ser um array')
    return [transaction.id]
  }

  console.log('getAffectedInstances chamada:', {
    transactionId: transaction.id,
    isRecurring: isRecurringTransaction(transaction),
    recurrenceId: transaction.recurrenceId,
    editOption
  })

  if (!isRecurringTransaction(transaction)) {
    return [transaction.id]
  }

  const series = getRecurrenceSeries(transaction.recurrenceId, allTransactions)
  console.log('Série encontrada:', series.length, 'transações')

  const futureIds = series
    .filter(t => (t.recurrenceIndex || 0) >= currentIndex)
    .map(t => t.id)

  const allIds = series.map(t => t.id)

  const currentIndex = transaction.recurrenceIndex || 0

  switch (editOption) {
    case EDIT_OPTIONS.THIS_ONLY:
      return [transaction.id]

    case EDIT_OPTIONS.THIS_AND_FUTURE:
      console.log('IDs futuras:', futureIds)
      return futureIds

    case EDIT_OPTIONS.ALL:
      console.log('Todos os IDs:', allIds)
      return allIds

    default:
      console.warn('editOption não reconhecida:', editOption)
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

  return {
    ...cleanBaseTransaction,
    date: instanceDate,
    recurrenceId,
    recurrenceIndex: index,
    recurrenceRule: rule,
    isRecurring: true,
    // Recalcular o mês fiscal baseado na nova data
    fiscalMonth: formatFiscalMonth(instanceDate),
    // Adicionar timestamp de criação
    createdAt: new Date()
  }
}

/**
 * Formata um objeto Date para uma string no formato "YYYY-MM"
 * (Duplicado de helpers.js para evitar dependência circular)
 */
const formatFiscalMonth = (date) => {
  if (!date) {
    console.warn('Data inválida para formatFiscalMonth:', date)
    return new Date().toISOString().substring(0, 7) // fallback para ano-mês atual
  }

  if (typeof date.getFullYear !== 'function') {
    console.warn('Objeto date inválido:', date)
    return new Date().toISOString().substring(0, 7)
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

/**
 * Atualiza múltiplas transações recorrentes de acordo com a opção selecionada
 * @param {Object} editedTransaction - Transação editada com novos valores
 * @param {string} editOption - Opção de edição (THIS_ONLY, THIS_AND_FUTURE, ALL)
 * @param {Array} allTransactions - Todas as transações disponíveis
 * @param {Object} db - Instância do Firestore
 * @param {string} collectionPath - Caminho da coleção no Firestore
 * @returns {Promise<number>} - Número de transações atualizadas
 */
export const updateRecurringSeries = async (
  editedTransaction,
  editOption,
  allTransactions,
  db,
  collectionPath
) => {
  // Validações de entrada
  if (!editedTransaction) {
    throw new Error('editedTransaction é obrigatório')
  }
  if (!editOption) {
    throw new Error('editOption é obrigatório')
  }
  if (!allTransactions || !Array.isArray(allTransactions)) {
    throw new Error('allTransactions deve ser um array')
  }
  if (!db) {
    throw new Error('db (Firestore) é obrigatório')
  }
  if (!collectionPath || typeof collectionPath !== 'string') {
    throw new Error(`collectionPath inválido: ${collectionPath}`)
  }

  const { writeBatch, doc } = await import('firebase/firestore')

  console.log('updateRecurringSeries chamada com:', {
    editedTransaction: editedTransaction.id,
    editOption,
    collectionPath,
    allTransactionsCount: allTransactions.length
  })

  const affectedIds = getAffectedInstances(editedTransaction, editOption, allTransactions)
  console.log('IDs afetados:', affectedIds)

  if (affectedIds.length === 0) {
    console.warn('Nenhuma transação afetada encontrada')
    return 0
  }

  const batch = writeBatch(db)

  // Preparar dados para atualização (remover campos que não devem ser propagados)
  const {
    id,
    recurrenceId,
    recurrenceIndex,
    recurrenceRule,
    isRecurring,
    createdAt,
    ...updateData
  } = editedTransaction

  console.log('Dados para atualização:', updateData)

  // Para cada transação afetada
  affectedIds.forEach((transactionId, index) => {
    console.log(`Processando transação ${index + 1}/${affectedIds.length}: ${transactionId}`)

    // Validar se o transactionId é válido
    if (!transactionId || typeof transactionId !== 'string') {
      console.error(`ID de transação inválido: ${transactionId}`)
      return
    }

    try {
      const docRef = doc(db, collectionPath, transactionId)
      console.log('Referência do documento criada:', docRef.path)

      const originalTransaction = allTransactions.find(t => t.id === transactionId)
      if (!originalTransaction) {
        console.warn(`Transação original não encontrada para ID: ${transactionId}`)
        return
      }

      if (editOption === EDIT_OPTIONS.THIS_ONLY) {
        // Para "apenas esta", aplicar dados exatos mantendo metadados de recorrência
        const finalData = {
          ...updateData,
          fiscalMonth: formatFiscalMonth(updateData.date || originalTransaction.date)
        }
        console.log(`Atualizando ${transactionId} (THIS_ONLY):`, finalData)
        batch.update(docRef, finalData)
      } else {
        // Para "esta e futuras" ou "todas"
        const updatedData = { ...updateData }

        // Se a data mudou, calcular nova data baseada no offset
        if (updateData.date && updateData.date.getTime() !== originalTransaction.date.getTime()) {
          const dateDifference = updateData.date.getTime() - originalTransaction.date.getTime()
          const newDate = new Date(originalTransaction.date.getTime() + dateDifference)
          updatedData.date = newDate
          updatedData.fiscalMonth = formatFiscalMonth(newDate)
        } else {
          // Manter data original e recalcular fiscal month
          updatedData.fiscalMonth = formatFiscalMonth(originalTransaction.date)
        }

        console.log(`Atualizando ${transactionId} (${editOption}):`, updatedData)
        batch.update(docRef, updatedData)
      }
    } catch (error) {
      console.error(`Erro ao processar transação ${transactionId}:`, error)
      throw error
    }
  })

  console.log('Executando batch commit...')
  await batch.commit()
  console.log(`${affectedIds.length} transações atualizadas com sucesso`)

  return affectedIds.length
}

/**
 * Quebra uma série recorrente criando uma nova série a partir de uma instância
 * @param {Object} transaction - Transação a partir da qual criar nova série
 * @param {Object} newData - Novos dados para a transação
 * @param {string} editOption - Opção de edição
 * @param {Array} allTransactions - Todas as transações
 * @param {Object} db - Instância do Firestore
 * @param {string} collectionPath - Caminho da coleção
 * @returns {Promise<number>} - Número de transações afetadas
 */
export const breakRecurrenceSeries = async (
  transaction,
  newData,
  editOption,
  allTransactions,
  db,
  collectionPath
) => {
  const { writeBatch, doc } = await import('firebase/firestore')

  if (editOption === EDIT_OPTIONS.THIS_ONLY) {
    // Remove da série atual e cria transação independente
    const batch = writeBatch(db)
    const docRef = doc(db, collectionPath, transaction.id)

    // Remove campos de recorrência
    const {
      recurrenceId,
      recurrenceIndex,
      recurrenceRule,
      isRecurring,
      ...independentData
    } = newData

    const finalData = {
      ...independentData,
      recurrenceId: null,
      recurrenceIndex: null,
      recurrenceRule: null,
      isRecurring: false,
      fiscalMonth: formatFiscalMonth(independentData.date || transaction.date)
    }

    batch.update(docRef, finalData)
    await batch.commit()
    return 1
  }

  if (editOption === EDIT_OPTIONS.THIS_AND_FUTURE) {
    // Criar nova série para esta e futuras
    const series = getRecurrenceSeries(transaction.recurrenceId, allTransactions)
    const currentIndex = transaction.recurrenceIndex || 0
    const affectedTransactions = series.filter(t => (t.recurrenceIndex || 0) >= currentIndex)

    const batch = writeBatch(db)
    const newRecurrenceId = generateRecurrenceId()

    affectedTransactions.forEach((t, index) => {
      const docRef = doc(db, collectionPath, t.id)

      // Remove campos específicos da transação original
      const { id, createdAt, ...baseData } = newData

      const updatedData = {
        ...baseData,
        recurrenceId: newRecurrenceId,
        recurrenceIndex: index,
        date: t.date, // Manter datas originais
        fiscalMonth: formatFiscalMonth(t.date)
      }

      batch.update(docRef, updatedData)
    })

    await batch.commit()
    return affectedTransactions.length
  }

  // Para ALL, usar a função normal de update
  return updateRecurringSeries(newData, editOption, allTransactions, db, collectionPath)
}

/**
 * Quebra uma série recorrente criando uma nova série a partir de uma instância
 * @param {string} recurrenceId - ID da série
 * @param {Array} allTransactions - Todas as transações
 * @returns {Array} - Transações da série ordenadas por índice
 */
export const debugRecurrenceSeries = (recurrenceId, allTransactions) => {
  const series = getRecurrenceSeries(recurrenceId, allTransactions)
  console.log(`Série ${recurrenceId}:`, {
    total: series.length,
    transactions: series.map(t => ({
      id: t.id,
      index: t.recurrenceIndex,
      date: t.date.toISOString().split('T')[0],
      description: t.description,
      value: t.value
    }))
  })
  return series
}