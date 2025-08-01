/**
 * Retorna o número de dias em um determinado mês e ano.
 * @param {number} year - O ano.
 * @param {number} month - O mês (0-11).
 * @returns {number} - O número de dias.
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Retorna o dia da semana para o primeiro dia de um mês.
 * @param {number} year - O ano.
 * @param {number} month - O mês (0-11).
 * @returns {number} - O dia da semana (0 para Domingo, 1 para Segunda, etc.).
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay()
}

/**
 * Formata um objeto Date para uma string no formato "YYYY-MM".
 * @param {Date} date - O objeto Date a ser formatado.
 * @returns {string} - A data formatada.
 */
export const formatFiscalMonth = (date) => {
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
 * NOVO: Calcula a data de fechamento real com base numa regra.
 * @param {{type: string, value: number}} settings - A regra de configuração.
 * @param {Date} referenceDate - A data de referência para determinar o mês e o ano.
 * @returns {Date} A data de fechamento calculada.
 */
export const calculateCloseDate = (settings, referenceDate) => {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()

  if (settings.type === 'day') {
    return new Date(year, month, settings.value)
  }

  if (settings.type === 'last_business_day') {
    let date = new Date(year, month + 1, 0) // Começa no último dia do mês
    let businessDaysFound = 0
    while (businessDaysFound <= settings.value) {
      const dayOfWeek = date.getDay()
      if (dayOfWeek > 0 && dayOfWeek < 6) {
        // É um dia útil (Seg-Sex)
        businessDaysFound++
      }
      if (businessDaysFound <= settings.value) {
        date.setDate(date.getDate() - 1)
      }
    }
    return date
  }

  return new Date(year, month, 25) // Fallback
}
