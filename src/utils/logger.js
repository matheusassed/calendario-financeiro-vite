/**
 * Utilitário de logging padronizado para o projeto
 * Permite controlar logs por ambiente e tipo
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
}

const isDevelopment = import.meta.env.DEV

/**
 * Logger principal que só exibe logs em desenvolvimento
 */
export const logger = {
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args)
  },
  
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  
  info: (message, ...args) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },
  
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  }
}

/**
 * Logger específico para recorrências (só em desenvolvimento)
 */
export const recurrenceLogger = {
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[RECURRENCE] ${message}`, ...args)
    }
  }
}

/**
 * Logger específico para parcelamentos (só em desenvolvimento)
 */
export const installmentLogger = {
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[INSTALLMENT] ${message}`, ...args)
    }
  }
}
