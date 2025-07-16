import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { addDoc, collection } from 'firebase/firestore'
import { formatFiscalMonth } from '../utils/helpers'

export function RevenueForm({ onSave, onCancel }) {
  const { db, user, appId } = useAuth()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    value: '',
  })
  const [error, setError] = useState('')

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

    try {
      const transactionDate = new Date(formData.date + 'T12:00:00')

      const dataToSave = {
        userId: user.uid,
        type: 'revenue',
        description: formData.description,
        value: parseFloat(formData.value),
        date: transactionDate,
        fiscalMonth: formatFiscalMonth(transactionDate),
        isRecurring: false,
      }

      await addDoc(
        collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
        dataToSave,
      )

      alert('Receita adicionada com sucesso!')
      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao adicionar receita:', err)
      setError('Ocorreu um erro ao salvar a receita.')
    }
  }

  return (
    <div className="page-content">
      <h1 className="form-title">Adicionar Nova Receita</h1>
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

        {/* Futuramente, aqui entrará a lógica de recorrência */}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar Receita
          </button>
        </div>
      </form>
    </div>
  )
}
