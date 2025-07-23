import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, deleteDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  MinusCircle,
  FileText,
  Trash2,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatFiscalMonth } from '../utils/helpers'
import { ConfirmModal } from '../components/ConfirmModal'
import { Modal } from '../components/Modal'
import { ExpenseForm } from './ExpenseForm'
import { RevenueForm } from './RevenueForm'
import { TodayButton } from '../components/TodayButton'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function DayDetailsView({
  selectedDate,
  transactions,
  invoices,
  categories,
  creditCards,
  setCurrentPage,
  setSelectedDate,
  handleNextDay,
  handlePrevDay,
  globalSettings,
  setSelectedInvoiceId,
  viewMode,
}) {
  const { db, user, appId } = useAuth()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)

  const handleInvoiceClick = (invoiceId) => {
    setSelectedInvoiceId(invoiceId.replace('invoice_', ''))
    setCurrentPage('invoiceDetails')
  }

  const handleGoToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [setSelectedDate])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'PageUp') {
        e.preventDefault()
        handlePrevDay()
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        handleNextDay()
      } else if (e.key === 'Home') {
        e.preventDefault()
        handleGoToToday()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlePrevDay, handleNextDay, handleGoToToday])

  const getCardName = useCallback(
    (id) => creditCards.find((c) => c.id === id)?.name || 'Cartão desconhecido',
    [creditCards],
  )

  const dayData = useMemo(() => {
    if (!selectedDate) {
      return {
        dayTransactions: [],
        dailyRevenues: 0,
        dailyExpenses: 0,
        cumulativeBalance: 0,
      }
    }

    const realDayTransactions = transactions.filter((t) => {
      const tDate = t.date
      return (
        tDate.getDate() === selectedDate.getDate() &&
        tDate.getMonth() === selectedDate.getMonth() &&
        tDate.getFullYear() === selectedDate.getFullYear()
      )
    })
    const dueInvoicesToday = invoices.filter((inv) => {
      const dueDate = inv.dueDate
      return (
        dueDate.getDate() === selectedDate.getDate() &&
        dueDate.getMonth() === selectedDate.getMonth() &&
        dueDate.getFullYear() === selectedDate.getFullYear()
      )
    })
    const invoiceTransactions = dueInvoicesToday.map((inv) => ({
      id: `invoice_${inv.id}`,
      type: 'expense',
      description: `Pagamento Fatura - ${getCardName(inv.cardId)}`,
      value: inv.total,
      isInvoicePayment: true,
    }))
    const dayTransactions = [...realDayTransactions, ...invoiceTransactions]
    const dailyRevenues = dayTransactions
      .filter((t) => t.type === 'revenue')
      .reduce((sum, t) => sum + t.value, 0)
    const dailyExpenses = dayTransactions
      .filter((t) => t.type === 'expense' && t.paymentMethod !== 'credit')
      .reduce((sum, t) => sum + t.value, 0)

    let cumulativeBalance = 0
    const targetDateEnd = new Date(selectedDate)
    targetDateEnd.setHours(23, 59, 59, 999)

    if (viewMode === 'fiscal') {
      const fiscalMonthStr = formatFiscalMonth(selectedDate)
      const directImpactTransactions = transactions.filter((t) => !t.invoiceId)
      const balanceFromTransactions = directImpactTransactions
        .filter(
          (t) =>
            t.fiscalMonth === fiscalMonthStr &&
            t.date.getTime() <= targetDateEnd.getTime(),
        )
        .reduce((acc, t) => {
          if (t.type === 'revenue') return acc + t.value
          if (t.type === 'expense') return acc - t.value
          return acc
        }, 0)
      const dueInvoicesForBalance = invoices.filter(
        (inv) =>
          formatFiscalMonth(inv.dueDate) === fiscalMonthStr &&
          inv.dueDate.getTime() <= targetDateEnd.getTime(),
      )
      const balanceFromInvoices = dueInvoicesForBalance.reduce(
        (sum, inv) => sum + inv.total,
        0,
      )
      cumulativeBalance = balanceFromTransactions - balanceFromInvoices
    } else {
      // viewMode === 'cashflow'
      const directImpactTransactions = transactions.filter(
        (t) => t.paymentMethod !== 'credit',
      )
      const balanceFromTransactions = directImpactTransactions
        .filter((t) => t.date.getTime() <= targetDateEnd.getTime())
        .reduce((acc, t) => {
          if (t.type === 'revenue') return acc + t.value
          if (t.type === 'expense') return acc - t.value
          return acc
        }, 0)
      const balanceFromInvoices = invoices
        .filter((inv) => inv.dueDate.getTime() <= targetDateEnd.getTime())
        .reduce((sum, inv) => sum + inv.total, 0)
      cumulativeBalance = balanceFromTransactions - balanceFromInvoices
    }

    return { dayTransactions, dailyRevenues, dailyExpenses, cumulativeBalance }
  }, [selectedDate, transactions, invoices, getCardName, viewMode])

  if (!selectedDate) {
    return (
      <div className="page-content">
        <h1>Erro</h1>
        <p>Nenhum dia foi selecionado. Por favor, volte ao calendário.</p>
        <button
          onClick={() => setCurrentPage('calendar')}
          className="btn-primary"
        >
          Voltar
        </button>
      </div>
    )
  }

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction)
    setIsDeleteModalOpen(true)
  }
  const confirmDelete = async () => {
    if (!transactionToDelete) return

    const loadingToast = toast.loading('A excluir transação...')
    try {
      await deleteDoc(
        doc(
          db,
          `artifacts/${appId}/users/${user.uid}/transactions`,
          transactionToDelete.id,
        ),
      )
      toast.success('Transação excluída com sucesso!', { id: loadingToast })
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Não foi possível excluir a transação.', { id: loadingToast })
    } finally {
      setIsDeleteModalOpen(false)
      setTransactionToDelete(null)
    }
  }
  const handleEditClick = (transaction) => {
    setTransactionToEdit(transaction)
    setIsEditModalOpen(true)
  }
  const handleSaveEdit = () => {
    setIsEditModalOpen(false)
    setTransactionToEdit(null)
  }
  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || 'Sem Categoria'
  const currentFiscalMonth = formatFiscalMonth(selectedDate)

  return (
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        <p>
          Tem a certeza que deseja excluir a transação "
          {transactionToDelete?.description}"?
        </p>
        <p>Esta ação não pode ser desfeita.</p>
      </ConfirmModal>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={
          transactionToEdit?.type === 'expense'
            ? 'Editar Despesa'
            : 'Editar Receita'
        }
      >
        {transactionToEdit?.type === 'expense' && (
          <ExpenseForm
            initialData={transactionToEdit}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditModalOpen(false)}
            categories={categories}
            creditCards={creditCards}
            invoices={invoices}
            globalSettings={globalSettings}
          />
        )}
        {transactionToEdit?.type === 'revenue' && (
          <RevenueForm
            initialData={transactionToEdit}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditModalOpen(false)}
            globalSettings={globalSettings}
          />
        )}
      </Modal>
      <div className="page-content">
        <div className="details-header">
          <button
            onClick={() => setCurrentPage('calendar')}
            className="back-button"
          >
            <ArrowLeft size={20} />
            <span>Voltar ao Calendário</span>
          </button>
          <h1 className="details-title">{formatDate(selectedDate)}</h1>
          <div className="details-nav-group">
            <button
              onClick={handlePrevDay}
              className="nav-button"
              title="Dia Anterior (Page Up)"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={handleNextDay}
              className="nav-button"
              title="Próximo Dia (Page Down)"
            >
              <ChevronRight />
            </button>
            <TodayButton onClick={handleGoToToday} />
          </div>
        </div>
        <div className="details-summary-card">
          <div>
            <span>Receitas do Dia</span>
            <strong className="summary-revenue">
              + R$ {dayData.dailyRevenues.toFixed(2)}
            </strong>
          </div>
          <div>
            <span>Despesas do Dia</span>
            <strong className="summary-expense">
              - R$ {dayData.dailyExpenses.toFixed(2)}
            </strong>
          </div>
          <div>
            <span>Saldo do Dia</span>
            <strong>
              R$ {(dayData.dailyRevenues - dayData.dailyExpenses).toFixed(2)}
            </strong>
          </div>
          <div>
            <span>Saldo Acumulado</span>
            <strong>R$ {dayData.cumulativeBalance.toFixed(2)}</strong>
          </div>
        </div>
        <div className="day-actions">
          <button
            onClick={() => setCurrentPage('addExpense')}
            className="btn-action-expense"
          >
            <MinusCircle size={20} />
            <span>Adicionar Despesa</span>
          </button>
          <button
            onClick={() => setCurrentPage('addRevenue')}
            className="btn-action-revenue"
          >
            <Plus size={20} />
            <span>Adicionar Receita</span>
          </button>
        </div>
        <div className="transactions-list">
          <div className="transaction-section">
            <h2 className="section-title">
              <CheckCircle size={22} /> Receitas
            </h2>
            {dayData.dayTransactions.filter((t) => t.type === 'revenue')
              .length > 0 ? (
              dayData.dayTransactions
                .filter((t) => t.type === 'revenue')
                .map((trans) => (
                  <div key={trans.id} className="transaction-card revenue">
                    <div className="transaction-info">
                      <p className="transaction-description">
                        {trans.description}
                      </p>
                    </div>
                    <div className="transaction-info-right">
                      <p className="transaction-value">
                        + R$ {trans.value.toFixed(2)}
                      </p>
                      <div className="transaction-actions">
                        <button
                          onClick={() => handleEditClick(trans)}
                          title="Editar"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(trans)}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="no-transactions">Nenhuma receita neste dia.</p>
            )}
          </div>
          <div className="transaction-section">
            <h2 className="section-title">
              <MinusCircle size={22} /> Despesas
            </h2>
            {dayData.dayTransactions.filter((t) => t.type === 'expense')
              .length > 0 ? (
              dayData.dayTransactions
                .filter((t) => t.type === 'expense')
                .map((trans) => {
                  const isFutureFiscalMonth =
                    trans.fiscalMonth &&
                    trans.fiscalMonth !== currentFiscalMonth
                  return (
                    <div
                      key={trans.id}
                      className={`transaction-card expense ${trans.isInvoicePayment ? 'invoice-payment clickable' : ''}`}
                      onClick={() =>
                        !!trans.isInvoicePayment && handleInvoiceClick(trans.id)
                      }
                    >
                      <div className="transaction-info">
                        {trans.isInvoicePayment && (
                          <CreditCard size={16} className="invoice-icon" />
                        )}
                        <p className="transaction-description">
                          {trans.description}
                        </p>
                        <div className="transaction-tags">
                          {!trans.isInvoicePayment && (
                            <span className="transaction-category">
                              {getCategoryName(trans.categoryId)}
                            </span>
                          )}
                          {trans.paymentMethod === 'credit' && (
                            <span className="credit-card-tag">
                              <CreditCard size={12} />
                              {getCardName(trans.cardId)}
                            </span>
                          )}
                          {isFutureFiscalMonth && (
                            <span className="future-fiscal-month-tag">
                              {(() => {
                                const [ano, mes] = trans.fiscalMonth.split('-')
                                const nomeMes = new Date(
                                  ano,
                                  mes - 1,
                                ).toLocaleString('pt-BR', { month: 'long' })
                                return `${nomeMes}`
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="transaction-info-right">
                        <p className="transaction-value">
                          - R$ {trans.value.toFixed(2)}
                        </p>
                        {!trans.isInvoicePayment && (
                          <div className="transaction-actions">
                            <button
                              onClick={() => handleEditClick(trans)}
                              title="Editar"
                            >
                              <FileText size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(trans)}
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
            ) : (
              <p className="no-transactions">Nenhuma despesa neste dia.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
