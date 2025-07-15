/**
 * Retorna o número de dias em um determinado mês e ano.
 * @param {number} year - O ano.
 * @param {number} month - O mês (0-11).
 * @returns {number} - O número de dias.
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Retorna o dia da semana para o primeiro dia de um mês.
 * @param {number} year - O ano.
 * @param {number} month - O mês (0-11).
 * @returns {number} - O dia da semana (0 para Domingo, 1 para Segunda, etc.).
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

/**
 * Formata um objeto Date para uma string no formato "YYYY-MM".
 * @param {Date} date - O objeto Date a ser formatado.
 * @returns {string} - A data formatada.
 */
export const formatFiscalMonth = (date) => {
  if (!date || typeof date.getFullYear !== 'function') {
    return '';
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};
