import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { formatFiscalMonth, calculateCloseDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { RecurrenceConfig } from '../components/RecurrenceConfig'
import {
  generateRecurrenceDates,
  generateRecurrenceId,
  createRecurrenceInstance,
} from '../utils/recurrence'
import { validateRecurrenceRule } from '../utils/recurrence'
import { InstallmentConfig } from '../components/InstallmentConfig'
import {
  generateInstallmentSeries,
  validateInstallmentConfig,
  isInstallmentTransaction,
} from '../utils/installments'

export function ExpenseForm({
  onSave,
  onCancel,
  categories,
  creditCards,
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
    paymentMethod: 'cash',
    categoryId: '',
    cardId: '',
    fiscalMonth: formatFiscalMonth(selectedDate || new Date()),
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState(null)
  const [recurrenceLoading, setRecurrenceLoading] = useState(false)
  const [installmentConfig, setInstallmentConfig] = useState(null)
  const [installmentLoading, setInstallmentLoading] = useState(false)

  const isEditing = !!initialData

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

  useEffect(() => {
    if (isEditing) return
    const transactionDate = new Date(formData.date + 'T12:00:00')
    let suggestedFiscalMonth = formatFiscalMonth(transactionDate)
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

  const handleRecurrenceChange = useCallback((rule) => {
    setRecurrenceRule(rule)
  }, [])

  const handleInstallmentChange = useCallback((config) => {
    setInstallmentConfig({
      ...config,
      purchaseDate: formData.date,
      card: creditCards.find((card) => card.id === formData.cardId),
    })
  }, [formData.date, formData.cardId, creditCards])

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

    if (isEditing && initialData && isInstallmentTransaction(initialData)) {
      // Para parcelas, só permitir editar descrição e categoria
      const allowedFields = ['description', 'categoryId']
      const hasDisallowedChanges = Object.keys(formData).some(
        (key) =>
          !allowedFields.includes(key) &&
          formData[key] !== initialData[key] &&
          key !== 'fiscalMonth', // fiscalMonth pode mudar devido à categoria
      )

      if (hasDisallowedChanges) {
        setError(
          'Apenas descrição e categoria podem ser alteradas em parcelas.',
        )
        return
      }
    }

    const loadingToast = toast.loading(
      isEditing ? 'Atualizando despesa...' : 'Salvando despesa...',
    )

    try {
      const transactionDate = new Date(formData.date + 'T12:00:00')
      const transactionValue = parseFloat(formData.value)

      const dataToSave = {
        userId: user.uid,
        type: 'expense',
        description: formData.description,
        value: transactionValue,
        date: transactionDate,
        fiscalMonth: formData.fiscalMonth,
        paymentMethod: formData.paymentMethod,
        categoryId: formData.categoryId,
        cardId: formData.paymentMethod === 'credit' ? formData.cardId : '',
        invoiceId: null,
      }

      if (recurrenceRule && !isEditing) {
        setRecurrenceLoading(true)
        // Criar série recorrente
        const validation = validateRecurrenceRule(recurrenceRule)
        if (!validation.isValid) {
          setError(
            `Regra de recorrência inválida: ${validation.errors.join(', ')}`,
          )
          return
        }
        const recurrenceId = generateRecurrenceId()
        const dates = generateRecurrenceDates(transactionDate, recurrenceRule)

        // Criar todas as instâncias
        const batch = writeBatch(db)

        dates.forEach((date, index) => {
          const instanceData = createRecurrenceInstance(
            dataToSave,
            recurrenceRule,
            date,
            index,
            recurrenceId,
          )

          const docRef = doc(
            collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
          )
          batch.set(docRef, instanceData)
        })

        await batch.commit()
        setRecurrenceLoading(false)
        toast.success(`${dates.length} transações recorrentes criadas!`)
      } else if (isEditing) {
        // Se tem função onSave (modal), chamar ela em vez de atualizar diretamente
        if (onSave) {
          onSave(dataToSave)
          return
        }

        // Se não tem onSave, é edição direta - atualizar no Firestore
        const docRef = doc(
          db,
          `artifacts/${appId}/users/${user.uid}/transactions`,
          initialData.id,
        )
        await updateDoc(docRef, dataToSave)
        toast.success('Despesa atualizada com sucesso!', { id: loadingToast })
      } else if (formData.paymentMethod === 'credit' && formData.cardId) {
        // LÓGICA DE CARTÃO DE CRÉDITO COM PARCELAMENTO
        if (installmentConfig.isInstallment) {
          // === CRIAR PARCELAMENTO ===
          setInstallmentLoading(true)

          const validation = validateInstallmentConfig(installmentConfig)
          if (!validation.isValid) {
            setError(
              `Configuração de parcelamento inválida: ${validation.errors.join(', ')}`,
            )
            toast.error(`Configuração de parcelamento inválida: ${validation.errors.join(', ')}`, { id: loadingToast })
            return
          }

          const card = creditCards.find((c) => c.id === formData.cardId)
          if (!card) {
            setError('Cartão de crédito não encontrado')
            return
          }

          // Gerar transação principal e parcelas
          const { mainTransaction, installments } = generateInstallmentSeries(dataToSave, {
            ...installmentConfig,
            card: card,
          })

          console.log(`Criando 1 transação principal e ${installments.length} parcelas`)

          // Criar batch para todas as transações
          const batch = writeBatch(db)
          const invoiceUpdates = new Map() // Para agrupar atualizações por fatura

          // Primeiro salva a transação principal (compra)
          const mainTransactionRef = doc(
            collection(db, `artifacts/${appId}/users/${user.uid}/transactions`)
          )
          batch.set(mainTransactionRef, mainTransaction)

          // Depois salva as parcelas
          for (const installment of installments) {
            // Determinar em qual fatura esta parcela vai
            let invoiceMonthDate = new Date(installment.date)
            if (installment.date.getDate() > card.invoiceCloseDay) {
              invoiceMonthDate.setMonth(invoiceMonthDate.getMonth() + 1)
            }
            const invoiceMonthStr = formatFiscalMonth(invoiceMonthDate)

            // Verificar se a fatura já existe
            const invoiceQuery = query(
              collection(db, `artifacts/${appId}/users/${user.uid}/invoices`),
              where('cardId', '==', formData.cardId),
              where('month', '==', invoiceMonthStr),
            )
            const querySnapshot = await getDocs(invoiceQuery)

            let invoiceId
            let currentInvoiceTotal = 0

            if (querySnapshot.empty) {
              // Criar nova fatura
              const newInvoiceRef = doc(
                collection(db, `artifacts/${appId}/users/${user.uid}/invoices`),
              )
              invoiceId = newInvoiceRef.id

              const closeDate = new Date(
                invoiceMonthDate.getFullYear(),
                invoiceMonthDate.getMonth(),
                card.invoiceCloseDay,
              )
              const dueDate = new Date(
                invoiceMonthDate.getFullYear(),
                invoiceMonthDate.getMonth(),
                card.invoiceDueDay,
              )

              // Verificar se já temos atualizações pendentes para esta fatura
              if (invoiceUpdates.has(invoiceId)) {
                currentInvoiceTotal = invoiceUpdates.get(invoiceId).total
              }

              batch.set(newInvoiceRef, {
                cardId: formData.cardId,
                month: invoiceMonthStr,
                total: currentInvoiceTotal + installment.value,
                closeDate: closeDate,
                dueDate: dueDate,
                status: 'Aberta',
                createdAt: serverTimestamp(),
              })

              invoiceUpdates.set(invoiceId, {
                ref: newInvoiceRef,
                total: currentInvoiceTotal + installment.value,
                isNew: true,
              })
            } else {
              // Atualizar fatura existente
              const invoiceDoc = querySnapshot.docs[0]
              invoiceId = invoiceDoc.id
              currentInvoiceTotal = invoiceDoc.data().total || 0

              // Verificar se já temos atualizações pendentes para esta fatura
              if (invoiceUpdates.has(invoiceId)) {
                currentInvoiceTotal = invoiceUpdates.get(invoiceId).total
              }

              const newTotal = currentInvoiceTotal + installment.value
              batch.update(invoiceDoc.ref, { total: newTotal })

              invoiceUpdates.set(invoiceId, {
                ref: invoiceDoc.ref,
                total: newTotal,
                isNew: false,
              })
            }

            // Adicionar a parcela com o ID da fatura
            const installmentData = {
              ...installment,
              invoiceId: invoiceId,
            }

            const newTransactionRef = doc(
              collection(
                db,
                `artifacts/${appId}/users/${user.uid}/transactions`,
              ),
            )
            batch.set(newTransactionRef, installmentData)
          }

          await batch.commit()
          setInstallmentLoading(false)

          toast.success(
            `Compra parcelada em ${installments.length}x criada com sucesso!`,
            { id: loadingToast },
          )
        } else {
          // === COMPRA SIMPLES NO CARTÃO (lógica existente) ===
          const card = creditCards.find((c) => c.id === formData.cardId)
          let invoiceMonthDate = new Date(transactionDate)
          if (transactionDate.getDate() > card.invoiceCloseDay) {
            invoiceMonthDate.setMonth(invoiceMonthDate.getMonth() + 1)
          }
          const invoiceMonthStr = formatFiscalMonth(invoiceMonthDate)

          const invoiceQuery = query(
            collection(db, `artifacts/${appId}/users/${user.uid}/invoices`),
            where('cardId', '==', formData.cardId),
            where('month', '==', invoiceMonthStr),
          )
          const querySnapshot = await getDocs(invoiceQuery)

          const batch = writeBatch(db)
          let invoiceId

          if (querySnapshot.empty) {
            const newInvoiceRef = doc(
              collection(db, `artifacts/${appId}/users/${user.uid}/invoices`),
            )
            invoiceId = newInvoiceRef.id
            const closeDate = new Date(
              invoiceMonthDate.getFullYear(),
              invoiceMonthDate.getMonth(),
              card.invoiceCloseDay,
            )
            const dueDate = new Date(
              invoiceMonthDate.getFullYear(),
              invoiceMonthDate.getMonth(),
              card.invoiceDueDay,
            )

            batch.set(newInvoiceRef, {
              cardId: formData.cardId,
              month: invoiceMonthStr,
              total: transactionValue,
              closeDate: closeDate,
              dueDate: dueDate,
              status: 'Aberta',
              createdAt: serverTimestamp(),
            })
          } else {
            const invoiceDoc = querySnapshot.docs[0]
            invoiceId = invoiceDoc.id
            batch.update(invoiceDoc.ref, { total: increment(transactionValue) })
          }

          dataToSave.invoiceId = invoiceId
          const newTransactionRef = doc(
            collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
          )
          batch.set(newTransactionRef, dataToSave)

          await batch.commit()
          toast.success('Despesa de cartão adicionada à fatura!', {
            id: loadingToast,
          })
        }
      } else {
        await addDoc(
          collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
          dataToSave,
        )
        toast.success('Despesa adicionada com sucesso!', { id: loadingToast })
      }

      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao salvar despesa:', err)
      toast.error('Ocorreu um erro ao salvar a despesa.', { id: loadingToast })
      setError('Ocorreu um erro ao salvar a despesa.')
    } finally {
      setLoading(false)
      setInstallmentLoading(false)
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
              required={formData.paymentMethod === 'credit'}
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

        {formData.paymentMethod === 'credit' &&
          formData.cardId && formData.cardId.length &&
          !isEditing && (
            <InstallmentConfig
              onInstallmentChange={handleInstallmentChange}
              totalValue={parseFloat(formData.value) || 0}
              selectedCard={creditCards.find((c) => c.id === formData.cardId)}
              purchaseDate={new Date(formData.date + 'T12:00:00')}
              disabled={isEditing || !!recurrenceRule}
            />
          )}

        {isEditing && initialData && isInstallmentTransaction(initialData) && (
          <div className="installment-edit-notice">
            <Package size={16} />
            <div>
              <strong>
                Parcela {initialData.installmentIndex}/
                {initialData.installmentTotal}
              </strong>
              <p>
                Esta é uma parcela de compra parcelada. Apenas descrição e
                categoria podem ser alteradas.
              </p>
            </div>
          </div>
        )}

        <RecurrenceConfig
          onRuleChange={handleRecurrenceChange}
          startDate={new Date(formData.date + 'T12:00:00')}
          disabled={isEditing && initialData?.isRecurring}
        />

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || recurrenceLoading || installmentLoading}
          >
            {loading || installmentLoading
              ? installmentConfig
                ? 'Criando Parcelas...'
                : 'Salvando...'
              : isEditing
                ? 'Salvar Alterações'
                : 'Salvar Despesa'}
          </button>
        </div>
      </form>
    </div>
  )
}
