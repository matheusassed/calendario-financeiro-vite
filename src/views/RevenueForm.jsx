import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { formatFiscalMonth, calculateCloseDate } from '../utils/helpers'
import toast from 'react-hot-toast'

export function RevenueForm({
  onSave,
  onCancel,
  initialData,
  globalSettings,
  selectedDate,
}) {
  const { db, user, appId } = useAuth()
  const [formData, setFormData] = useState({
    date: initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : selectedDate
        ? selectedDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    description: '',
    value: '',
    fiscalMonth: formatFiscalMonth(selectedDate || new Date()),
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditing = !!initialData

  // Lógica para sugerir o Mês Fiscal
  useEffect(() => {
    if (isEditing) return

    const transactionDate = new Date(formData.date + 'T12:00:00')
    let suggestedFiscalMonth = formatFiscalMonth(transactionDate)

    if (globalSettings && globalSettings.monthCloseRule) {
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
  }, [formData.date, globalSettings, isEditing])

  useEffect(() => {
    if (isEditing) {
      setFormData({
        date: initialData.date.toISOString().split('T')[0],
        description: initialData.description || '',
        value: initialData.value || '',
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
    if (!formData.description || !formData.value) {
      setError('Por favor, preencha todos os campos.')
      return
    }
    setError('')
    setLoading(true)

    const loadingToast = toast.loading(
      isEditing ? 'Atualizando receita...' : 'Salvando receita...',
    )
    try {
      const transactionDate = new Date(formData.date + 'T12:00:00')

      const dataToSave = {
        userId: user.uid,
        type: 'revenue',
        description: formData.description,
        value: parseFloat(formData.value),
        date: transactionDate,
        fiscalMonth: formData.fiscalMonth,
      }

      if (isEditing) {
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${user.uid}/transactions`,
          initialData.id,
        )
        await updateDoc(docRef, dataToSave)
        toast.success('Receita atualizada com sucesso!', { id: loadingToast })
      } else {
        await addDoc(
          collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
          dataToSave,
        )
        toast.success('Receita adicionada com sucesso!', { id: loadingToast })
      }

      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao adicionar receita:', err)
      toast.error('Ocorreu um erro ao salvar a receita.', { id: loadingToast })
      setError('Ocorreu um erro ao salvar a receita.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`page-content ${isEditing ? 'form-in-modal' : ''}`}>
      {!isEditing && <h1 className="form-title">Adicionar Nova Receita</h1>}
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
              ? 'Salvando...'
              : isEditing
                ? 'Salvar Alterações'
                : 'Salvar Receita'}
          </button>
        </div>
      </form>
    </div>
  )
}
