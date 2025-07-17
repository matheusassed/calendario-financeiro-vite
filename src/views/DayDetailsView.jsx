import React from 'react'
import {
  MinusCircle,
  Plus,
  FileText,
  Trash2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'

// Função auxiliar para formatar a data, pode ser movida para helpers.jsx depois
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function DayDetailsView({
  selectedDate,
  transactions,
  categories,
  setCurrentPage,
}) {
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

  // Filtra as transações apenas para o dia selecionado
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

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || 'Sem Categoria'

  return (
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
            + R$ {dailyRevenues.toFixed(2)}
          </strong>
        </div>
        <div>
          <span>Despesas do Dia</span>
          <strong className="summary-expense">
            - R$ {dailyExpenses.toFixed(2)}
          </strong>
        </div>
        <div>
          <span>Saldo do Dia</span>
          <strong>R$ {(dailyRevenues - dailyExpenses).toFixed(2)}</strong>
        </div>
      </div>

      <div className="transactions-list">
        {/* Secção de Receitas */}
        <div className="transaction-section">
          <h2 className="section-title">
            <CheckCircle size={22} /> Receitas
          </h2>
          {dayTransactions.filter((t) => t.type === 'revenue').length > 0 ? (
            dayTransactions
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
                    <button title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p className="no-transactions">Nenhuma receita neste dia.</p>
          )}
        </div>

        {/* Secção de Despesas */}
        <div className="transaction-section">
          <h2 className="section-title">
            <MinusCircle size={22} /> Despesas
          </h2>
          {dayTransactions.filter((t) => t.type === 'expense').length > 0 ? (
            dayTransactions
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
                      <button title="Excluir">
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
  )
}
