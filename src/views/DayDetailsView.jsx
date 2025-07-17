import React, { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, deleteDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  MinusCircle,
  FileText,
  Trash2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { formatFiscalMonth } from '../utils/helpers'
import { ConfirmModal } from '../components/ConfirmModal'

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
  categories,
  setCurrentPage,
}) {
  const { db, user, appId } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)

  const dayData = useMemo(() => {
    if (!selectedDate) {
      return {
        dayTransactions: [],
        dailyRevenues: 0,
        dailyExpenses: 0,
        cumulativeBalance: 0,
      }
    }

    const dayTransactions = transactions.filter((t) => {
      const tDate = t.date
      return (
        tDate.getDate() === selectedDate.getDate() &&
        tDate.getMonth() === selectedDate.getMonth() &&
        tDate.getFullYear() === selectedDate.getFullYear()
      )
    })
    const dailyRevenues = dayTransactions
      .filter((t) => t.type === 'revenue')
      .reduce((sum, t) => sum + t.value, 0)
    const dailyExpenses = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0)
    const targetDateEnd = new Date(selectedDate)
    targetDateEnd.setHours(23, 59, 59, 999)
    const fiscalMonthStr = formatFiscalMonth(selectedDate)
    const cumulativeBalance = transactions
      .filter((t) => {
        const tDate = t.date
        return (
          t.fiscalMonth === fiscalMonthStr &&
          tDate.getTime() <= targetDateEnd.getTime()
        )
      })
      .reduce((acc, t) => {
        if (t.type === 'revenue') return acc + t.value
        if (t.type === 'expense') return acc - t.value
        return acc
      }, 0)
    return { dayTransactions, dailyRevenues, dailyExpenses, cumulativeBalance }
  }, [selectedDate, transactions])

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
    setIsModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!transactionToDelete) return

    const loadingToast = toast.loading('Excluindo transação...')
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
      setIsModalOpen(false)
      setTransactionToDelete(null)
    }
  }

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || 'Sem Categoria'

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja excluir a transação "
          {transactionToDelete?.description}"?
        </p>
        <p>Esta ação não pode ser desfeita.</p>
      </ConfirmModal>

      <div className="page-content">
        <button
          onClick={() => setCurrentPage('calendar')}
          className="back-button"
        >
          <ArrowLeft size={20} />
          <span>Voltar ao Calendário</span>
        </button>
        <h1 className="details-title">{formatDate(selectedDate)}</h1>

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
                      <p className="transaction-value">
                        + R$ {trans.value.toFixed(2)}
                      </p>
                    </div>
                    <div className="transaction-actions">
                      <button title="Editar">
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
                .map((trans) => (
                  <div key={trans.id} className="transaction-card expense">
                    <div className="transaction-info">
                      <p className="transaction-description">
                        {trans.description}
                      </p>
                      <span className="transaction-category">
                        {getCategoryName(trans.categoryId)}
                      </span>
                    </div>
                    <div className="transaction-info-right">
                      <p className="transaction-value">
                        - R$ {trans.value.toFixed(2)}
                      </p>
                      <div className="transaction-actions">
                        <button title="Editar">
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
              <p className="no-transactions">Nenhuma despesa neste dia.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
