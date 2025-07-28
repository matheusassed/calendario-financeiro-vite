import React from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { EDIT_OPTIONS } from '../utils/recurrence'

export function RecurrenceEditModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  operation = 'edit', // 'edit' ou 'delete'
}) {
  if (!isOpen || !transaction) {
    return null
  }

  const isEdit = operation === 'edit'

  const handleOptionSelect = (option) => {
    onConfirm(option)
  }

  const getOptionDescription = (option) => {
    switch (option) {
      case EDIT_OPTIONS.THIS_ONLY:
        return isEdit
          ? 'Apenas esta transação será modificada. As outras instâncias da série permanecerão inalteradas.'
          : 'Apenas esta transação será excluída. As outras instâncias da série permanecerão inalteradas.'

      case EDIT_OPTIONS.THIS_AND_FUTURE:
        return isEdit
          ? 'Esta transação e todas as futuras da série serão modificadas. As transações passadas permanecerão inalteradas.'
          : 'Esta transação e todas as futuras da série serão excluídas. As transações passadas permanecerão inalteradas.'

      case EDIT_OPTIONS.ALL:
        return isEdit
          ? 'Todas as transações desta série recorrente serão modificadas, incluindo passadas e futuras.'
          : 'Todas as transações desta série recorrente serão excluídas, incluindo passadas e futuras.'

      default:
        return ''
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content recurrence-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <RefreshCw className="modal-icon recurrence" />
            <h3 className="modal-title">
              {isEdit ? 'Editar' : 'Excluir'} Transação Recorrente
            </h3>
          </div>
        </div>

        <div className="modal-body">
          <div className="transaction-info">
            <h4>Transação Selecionada:</h4>
            <div className="transaction-summary">
              <span className="transaction-desc">
                {transaction.description}
              </span>
              <span className="transaction-date">
                {formatDate(transaction.date)}
              </span>
              <span className="transaction-amount">
                R$ {transaction.value?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="warning-section">
            <AlertTriangle className="warning-icon" />
            <p>
              Esta transação faz parte de uma série recorrente. Como você
              gostaria de proceder?
            </p>
          </div>

          <div className="edit-options">
            <button
              onClick={() => handleOptionSelect(EDIT_OPTIONS.THIS_ONLY)}
              className="edit-option-button"
            >
              <div className="option-header">
                <span className="option-title">Apenas Esta</span>
                <span className="option-badge this-only">1 transação</span>
              </div>
              <p className="option-description">
                {getOptionDescription(EDIT_OPTIONS.THIS_ONLY)}
              </p>
            </button>

            <button
              onClick={() => handleOptionSelect(EDIT_OPTIONS.THIS_AND_FUTURE)}
              className="edit-option-button"
            >
              <div className="option-header">
                <span className="option-title">Esta e Futuras</span>
                <span className="option-badge this-future">Múltiplas</span>
              </div>
              <p className="option-description">
                {getOptionDescription(EDIT_OPTIONS.THIS_AND_FUTURE)}
              </p>
            </button>

            <button
              onClick={() => handleOptionSelect(EDIT_OPTIONS.ALL)}
              className="edit-option-button"
            >
              <div className="option-header">
                <span className="option-title">Toda a Série</span>
                <span className="option-badge all">Todas</span>
              </div>
              <p className="option-description">
                {getOptionDescription(EDIT_OPTIONS.ALL)}
              </p>
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
