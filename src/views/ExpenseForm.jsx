import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { addDoc, collection } from 'firebase/firestore'
import { formatFiscalMonth } from '../utils/helpers'

export function ExpenseForm({ onSave, onCancel, categories }) {
  const { db, user, appId } = useAuth()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    value: '',
    paymentMethod: 'cash',
    categoryId: '',
    cardId: '',
  })
  const [error, setError] = useState('')

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

    try {
      const transactionDate = new Date(formData.date + 'T12:00:00') // Evita problemas de fuso

      const dataToSave = {
        userId: user.uid,
        type: 'expense',
        description: formData.description,
        value: parseFloat(formData.value),
        date: transactionDate,
        fiscalMonth: formatFiscalMonth(transactionDate), // Lógica simples por enquanto
        paymentMethod: formData.paymentMethod,
        categoryId: formData.categoryId,
        cardId: formData.paymentMethod === 'credit' ? formData.cardId : '',
        isRecurring: false,
        isInstallment: false,
      }

      await addDoc(
        collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
        dataToSave,
      )

      alert('Despesa adicionada com sucesso!')
      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao adicionar despesa:', err)
      setError('Ocorreu um erro ao salvar a despesa.')
    }
  }

  return (
    <div className="page-content">
      <h1 className="form-title">Adicionar Nova Despesa</h1>
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

        {/* Futuramente, aqui entrará a lógica de parcelamento e cartão */}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar Despesa
          </button>
        </div>
      </form>
    </div>
  )
}
