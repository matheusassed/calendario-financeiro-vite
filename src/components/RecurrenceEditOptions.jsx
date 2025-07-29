import React, { useState } from 'react'
import { RefreshCw, AlertTriangle, Edit3 } from 'lucide-react'
import { EDIT_OPTIONS } from '../utils/recurrence'

export function RecurrenceEditOptions({
  isOpen,
  onClose,
  onConfirm,
  transaction,
}) {
  const [selectedOption, setSelectedOption] = useState(EDIT_OPTIONS.THIS_ONLY)
  const [isAdvanced, setIsAdvanced] = useState(false)

  if (!isOpen || !transaction) {
    return null
  }

  const handleConfirm = () => {
    onConfirm(selectedOption, isAdvanced)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getOptionDescription = (option, advanced = false) => {
    if (advanced) {
      switch (option) {
        case EDIT_OPTIONS.THIS_ONLY:
          return 'Remove esta transação da série recorrente, tornando-a independente.'
        case EDIT_OPTIONS.THIS_AND_FUTURE:
          return 'Cria uma nova série recorrente a partir desta transação com as alterações.'
        case EDIT_OPTIONS.ALL:
          return 'Aplica as alterações a toda a série recorrente existente.'
        default:
          return ''
      }
    }

    switch (option) {
      case EDIT_OPTIONS.THIS_ONLY:
        return 'Apenas esta transação será modificada. As outras permanecerão inalteradas.'
      case EDIT_OPTIONS.THIS_AND_FUTURE:
        return 'Esta transação e todas as futuras serão modificadas. As passadas permanecerão inalteradas.'
      case EDIT_OPTIONS.ALL:
        return 'Todas as transações desta série recorrente serão modificadas.'
      default:
        return ''
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content recurrence-edit-options-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Edit3 className="modal-icon edit" />
            <h3 className="modal-title">Editar Transação Recorrente</h3>
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
              gostaria de aplicar as alterações?
            </p>
          </div>

          <div className="edit-options">
            <label
              className={`edit-option-radio ${selectedOption === EDIT_OPTIONS.THIS_ONLY ? 'selected' : ''}`}
            >
              <input
                type="radio"
                value={EDIT_OPTIONS.THIS_ONLY}
                checked={selectedOption === EDIT_OPTIONS.THIS_ONLY}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <div className="option-content">
                <div className="option-header">
                  <span className="option-title">Apenas Esta</span>
                  <span className="option-badge this-only">1 transação</span>
                </div>
                <p className="option-description">
                  {getOptionDescription(EDIT_OPTIONS.THIS_ONLY, isAdvanced)}
                </p>
              </div>
            </label>

            <label
              className={`edit-option-radio ${selectedOption === EDIT_OPTIONS.THIS_AND_FUTURE ? 'selected' : ''}`}
            >
              <input
                type="radio"
                value={EDIT_OPTIONS.THIS_AND_FUTURE}
                checked={selectedOption === EDIT_OPTIONS.THIS_AND_FUTURE}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <div className="option-content">
                <div className="option-header">
                  <span className="option-title">Esta e Futuras</span>
                  <span className="option-badge this-future">Múltiplas</span>
                </div>
                <p className="option-description">
                  {getOptionDescription(
                    EDIT_OPTIONS.THIS_AND_FUTURE,
                    isAdvanced,
                  )}
                </p>
              </div>
            </label>

            <label
              className={`edit-option-radio ${selectedOption === EDIT_OPTIONS.ALL ? 'selected' : ''}`}
            >
              <input
                type="radio"
                value={EDIT_OPTIONS.ALL}
                checked={selectedOption === EDIT_OPTIONS.ALL}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <div className="option-content">
                <div className="option-header">
                  <span className="option-title">Toda a Série</span>
                  <span className="option-badge all">Todas</span>
                </div>
                <p className="option-description">
                  {getOptionDescription(EDIT_OPTIONS.ALL, isAdvanced)}
                </p>
              </div>
            </label>
          </div>

          <div className="advanced-options">
            <label className="advanced-toggle">
              <input
                type="checkbox"
                checked={isAdvanced}
                onChange={(e) => setIsAdvanced(e.target.checked)}
              />
              <span>Opções avançadas</span>
            </label>

            {isAdvanced && (
              <div className="advanced-info">
                <p>
                  <strong>Nota:</strong> As opções avançadas podem quebrar ou
                  criar novas séries recorrentes dependendo da sua escolha. Use
                  com cuidado.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="btn-primary">
            Continuar Edição
          </button>
        </div>
      </div>
    </div>
  )
}
