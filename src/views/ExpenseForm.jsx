import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { formatFiscalMonth, calculateCloseDate } from '../utils/helpers'
import toast from 'react-hot-toast'

export function ExpenseForm({
  onSave,
  onCancel,
  categories,
  creditCards,
  initialData,
  globalSettings,
}) {
  const { db, user, appId } = useAuth()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    value: '',
    paymentMethod: 'cash',
    categoryId: '',
    cardId: '',
    fiscalMonth: formatFiscalMonth(new Date()),
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditing = !!initialData

  // Lógica para sugerir o Mês Fiscal
  useEffect(() => {
    if (isEditing) return

    const transactionDate = new Date(formData.date + 'T12:00:00')
    let suggestedFiscalMonth = formatFiscalMonth(transactionDate) // Padrão

    if (formData.paymentMethod === 'credit' && formData.cardId) {
      const card = creditCards.find((c) => c.id === formData.cardId)
      if (card && card.invoiceCloseDay) {
        if (transactionDate.getDate() > card.invoiceCloseDay) {
          const nextMonth = new Date(transactionDate)
          nextMonth.setMonth(nextMonth.getMonth() + 1)
          suggestedFiscalMonth = formatFiscalMonth(nextMonth)
        }
      }
    } else if (globalSettings && globalSettings.monthCloseRule) {
      const closeDate = calculateCloseDate(
        globalSettings.monthCloseRule,
        transactionDate,
      )
      if (transactionDate > closeDate) {
        const nextMonth = new Date(transactionDate)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        suggestedFiscalMonth = formatFiscalMonth(nextMonth)
      }
    }

    setFormData((prev) => ({ ...prev, fiscalMonth: suggestedFiscalMonth }))
  }, [
    formData.date,
    formData.paymentMethod,
    formData.cardId,
    globalSettings,
    creditCards,
    isEditing,
  ])

  useEffect(() => {
    if (isEditing) {
      setFormData({
        date: initialData.date.toISOString().split('T')[0],
        description: initialData.description || '',
        value: initialData.value || '',
        paymentMethod: initialData.paymentMethod || 'cash',
        categoryId: initialData.categoryId || '',
        cardId: initialData.cardId || '',
        fiscalMonth:
          initialData.fiscalMonth || formatFiscalMonth(initialData.date),
      })
    }
  }, [initialData, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.description || !formData.value || !formData.categoryId) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    setError('')
    setLoading(true)

    const loadingToast = toast.loading(
      isEditing ? 'A atualizar despesa...' : 'A guardar despesa...',
    )
    try {
      const transactionDate = new Date(formData.date + 'T12:00:00')

      const dataToSave = {
        userId: user.uid,
        type: 'expense',
        description: formData.description,
        value: parseFloat(formData.value),
        date: transactionDate,
        fiscalMonth: formData.fiscalMonth,
        paymentMethod: formData.paymentMethod,
        categoryId: formData.categoryId,
        cardId: formData.paymentMethod === 'credit' ? formData.cardId : '',
      }

      if (isEditing) {
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${user.uid}/transactions`,
          initialData.id,
        )
        await updateDoc(docRef, dataToSave)
        toast.success('Despesa atualizada com sucesso!', { id: loadingToast })
      } else {
        await addDoc(
          collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
          dataToSave,
        )
        toast.success('Despesa adicionada com sucesso!', { id: loadingToast })
      }

      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao guardar despesa:', err)
      toast.error('Ocorreu um erro ao guardar a despesa.', { id: loadingToast })
      setError('Ocorreu um erro ao guardar a despesa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`page-content ${isEditing ? 'form-in-modal' : ''}`}>
      {!isEditing && <h1 className="form-title">Adicionar Nova Despesa</h1>}
      <form onSubmit={handleSubmit} className="transaction-form">
        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="value">Valor (R$)</label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Data</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Categoria</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Forma de Pagamento</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="cash">Dinheiro</option>
            <option value="debit">Débito</option>
            <option value="credit">Crédito</option>
          </select>
        </div>

        {formData.paymentMethod === 'credit' && (
          <div className="form-group">
            <label htmlFor="cardId">Cartão de Crédito</label>
            <select
              id="cardId"
              name="cardId"
              value={formData.cardId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Selecione um cartão
              </option>
              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="fiscalMonth">Mês Fiscal</label>
          <input
            type="month"
            id="fiscalMonth"
            name="fiscalMonth"
            value={formData.fiscalMonth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? 'A guardar...'
              : isEditing
                ? 'Guardar Alterações'
                : 'Guardar Despesa'}
          </button>
        </div>
      </form>
    </div>
  )
}
