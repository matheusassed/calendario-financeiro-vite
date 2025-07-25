import React from 'react'
import { Modal } from './Modal'
import { GitBranch, GitCommit, GitPullRequest } from 'lucide-react'

export function RecurrenceActionModal({
  isOpen,
  onClose,
  onConfirm,
  actionType = 'edit',
}) {
  if (!isOpen) {
    return null
  }

  const title =
    actionType === 'delete'
      ? 'Excluir Transação Recorrente'
      : 'Editar Transação Recorrente'
  const confirmText = actionType === 'delete' ? 'Excluir' : 'Editar'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="modal-body">
        Esta é uma transação recorrente. Como deseja aplicar esta alteração?
      </p>
      <div className="recurrence-action-options">
        <button
          onClick={() => onConfirm('one')}
          className="btn-secondary option-button"
        >
          <GitCommit size={20} />
          <span>{confirmText} Apenas Esta</span>
        </button>
        <button
          onClick={() => onConfirm('future')}
          className="btn-secondary option-button"
        >
          <GitPullRequest size={20} />
          <span>{confirmText} Esta e as Próximas</span>
        </button>
        <button
          onClick={() => onConfirm('all')}
          className="btn-secondary option-button"
        >
          <GitBranch size={20} />
          <span>{confirmText} Todas na Série</span>
        </button>
      </div>
    </Modal>
  )
}
