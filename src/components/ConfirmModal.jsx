import React from 'react'
import { AlertTriangle } from 'lucide-react'

export function ConfirmModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <AlertTriangle className="modal-icon" />
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
