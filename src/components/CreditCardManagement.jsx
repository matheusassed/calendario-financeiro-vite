import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore'
import { logger } from '../utils/logger'
import toast from 'react-hot-toast'
import { Plus, Trash2, CreditCard } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'

export function CreditCardManagement({ creditCards }) {
  const { db, user, appId } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    invoiceCloseDay: '',
    invoiceDueDay: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCard = async (e) => {
    e.preventDefault()
    if (
      !formData.name.trim() ||
      !formData.invoiceCloseDay ||
      !formData.invoiceDueDay
    ) {
      setError('Por favor, preencha todos os campos.')
      return
    }
    setLoading(true)
    setError('')
    const loadingToast = toast.loading('A adicionar cartão...')
    try {
      await addDoc(
        collection(db, `artifacts/${appId}/users/${user.uid}/creditCards`),
        {
          name: formData.name.trim(),
          invoiceCloseDay: parseInt(formData.invoiceCloseDay, 10),
          invoiceDueDay: parseInt(formData.invoiceDueDay, 10),
        },
      )
      toast.success('Cartão adicionado!', { id: loadingToast })
      setFormData({ name: '', invoiceCloseDay: '', invoiceDueDay: '' }) // Limpa o formulário
    } catch (err) {
      logger.error('Erro ao adicionar cartão:', err)
      toast.error('Não foi possível adicionar o cartão.', { id: loadingToast })
    }
    setLoading(false)
  }

  const handleDeleteClick = (card) => {
    setCardToDelete(card)
    setIsModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!cardToDelete) return

    const loadingToast = toast.loading('A excluir cartão...')
    try {
      await deleteDoc(
        doc(
          db,
          `artifacts/${appId}/users/${user.uid}/creditCards`,
          cardToDelete.id,
        ),
      )
      toast.success('Cartão excluído!', { id: loadingToast })
    } catch (err) {
      logger.error('Erro ao excluir cartão:', err)
      toast.error('Não foi possível excluir o cartão.', { id: loadingToast })
    } finally {
      setIsModalOpen(false)
      setCardToDelete(null)
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        <p>Tem a certeza que deseja excluir o cartão "{cardToDelete?.name}"?</p>
      </ConfirmModal>

      <div className="settings-card">
        <h2 className="settings-title">Gerir Cartões de Crédito</h2>
        <form onSubmit={handleAddCard} className="add-item-form-grid">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome do cartão (ex: Nubank)"
            className="add-item-input"
          />
          <input
            type="number"
            name="invoiceCloseDay"
            value={formData.invoiceCloseDay}
            onChange={handleChange}
            placeholder="Dia do fecho"
            min="1"
            max="31"
            className="add-item-input"
          />
          <input
            type="number"
            name="invoiceDueDay"
            value={formData.invoiceDueDay}
            onChange={handleChange}
            placeholder="Dia do vencimento"
            min="1"
            max="31"
            className="add-item-input"
          />
          <button type="submit" className="add-item-button" disabled={loading}>
            <Plus size={20} />
            <span>{loading ? 'A adicionar...' : 'Adicionar'}</span>
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}

        <ul className="item-list">
          {creditCards.length === 0 && (
            <p>Nenhum cartão de crédito registado.</p>
          )}
          {creditCards.map((card) => (
            <li key={card.id} className="item-list-entry">
              <div className="item-details">
                <CreditCard size={20} />
                <span>{card.name}</span>
              </div>
              <div className="item-details">
                <span className="item-label">
                  Fecha dia: {card.invoiceCloseDay}
                </span>
                <span className="item-label">
                  Vence dia: {card.invoiceDueDay}
                </span>
                <button
                  onClick={() => handleDeleteClick(card)}
                  className="delete-button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
