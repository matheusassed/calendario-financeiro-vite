import React from 'react'
import { RefreshCw, AlertTriangle, Trash2 } from 'lucide-react'
import { EDIT_OPTIONS } from '../utils/recurrence'

export function RecurrenceEditModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
}) {
  if (!isOpen || !transaction) {
    return null
  }

  const handleOptionSelect = (option) => {
    onConfirm(option)
  }

  const getOptionDescription = (option) => {
    switch (option) {
      case EDIT_OPTIONS.THIS_ONLY:
        return 'Apenas esta transação será excluída. As outras instâncias da série permanecerão inalteradas.'
      case EDIT_OPTIONS.THIS_AND_FUTURE:
        return 'Esta transação e todas as futuras da série serão excluídas. As transações passadas permanecerão inalteradas.'
      case EDIT_OPTIONS.ALL:
        return 'Todas as transações desta série recorrente serão excluídas, incluindo passadas e futuras.'
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
            <Trash2 className="modal-icon delete" />
            <h3 className="modal-title">Excluir Transação Recorrente</h3>
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
              Esta transação faz parte de uma série recorrente. Quais transações
              você deseja excluir?
            </p>
          </div>

          <div className="edit-options">
            <button
              onClick={() => handleOptionSelect(EDIT_OPTIONS.THIS_ONLY)}
              className="edit-option-button delete-option"
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
              className="edit-option-button delete-option"
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
              className="edit-option-button delete-option"
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
