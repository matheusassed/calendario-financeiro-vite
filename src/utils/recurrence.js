/**
 * Calcula a próxima data de ocorrência com base numa regra.
 * @param {{type: string, interval: number, endDate?: string}} recurrenceRule - A regra.
 * @param {Date} lastDate - A data da última ocorrência.
 * @returns {Date|null} - A próxima data ou null se a série terminou.
 */
export function calculateNextOccurrence(recurrenceRule, lastDate) {
  const nextDate = new Date(lastDate.getTime())

  if (recurrenceRule.type === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + recurrenceRule.interval)
  } else if (recurrenceRule.type === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + recurrenceRule.interval)
  } else {
    return null // Tipo de recorrência não suportado
  }

  // Verifica se a próxima data ultrapassa a data final
  if (recurrenceRule.endDate) {
    const endDate = new Date(recurrenceRule.endDate + 'T23:59:59')
    if (nextDate > endDate) {
      return null
    }
  }

  return nextDate
}

/**
 * Gera as instâncias de uma transação recorrente.
 * Por simplicidade, vamos gerar por um período fixo (ex: 2 anos) se não houver data final.
 * @param {object} baseTransaction - A transação base com a recurrenceRule.
 * @returns {Array} - Um array de objetos de transação para a série.
 */
export function generateRecurrenceSeries(baseTransaction) {
  const series = []
  let currentDate = baseTransaction.date
  let currentIndex = 0

  // Define um limite de segurança para recorrências sem data final
  const safetyLimit = new Date()
  safetyLimit.setFullYear(safetyLimit.getFullYear() + 5)
  const endDate = baseTransaction.recurrenceRule.endDate
    ? new Date(baseTransaction.recurrenceRule.endDate + 'T23:59:59')
    : safetyLimit

  while (currentDate <= endDate) {
    series.push({
      ...baseTransaction,
      date: new Date(currentDate.getTime()), // Cria uma nova instância da data
      recurrenceIndex: currentIndex,
    })

    const nextDate = calculateNextOccurrence(
      baseTransaction.recurrenceRule,
      currentDate,
    )
    if (nextDate) {
      currentDate = nextDate
      currentIndex++
    } else {
      break // Sai do loop se não houver próxima data
    }
  }

  return series
}