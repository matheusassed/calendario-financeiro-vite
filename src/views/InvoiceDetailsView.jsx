import React, { useMemo } from 'react'
import { ArrowLeft, CreditCard, Calendar, Hash } from 'lucide-react'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function InvoiceDetailsView({
  selectedInvoiceId,
  invoices,
  transactions,
  creditCards,
  setCurrentPage,
}) {
  const invoiceData = useMemo(() => {
    if (!selectedInvoiceId) return null

    const invoice = invoices.find((inv) => inv.id === selectedInvoiceId)
    if (!invoice) return null

    const card = creditCards.find((c) => c.id === invoice.cardId)
    const invoiceTransactions = transactions.filter(
      (t) => t.invoiceId === selectedInvoiceId,
    )

    return {
      invoice,
      card,
      transactions: invoiceTransactions,
    }
  }, [selectedInvoiceId, invoices, transactions, creditCards])

  if (!invoiceData) {
    return (
      <div className="page-content">
        <h1>Fatura não encontrada</h1>
        <p>
          Não foi possível carregar os detalhes da fatura. Por favor, volte ao
          calendário.
        </p>
        <button
          onClick={() => setCurrentPage('calendar')}
          className="btn-primary"
        >
          Voltar
        </button>
      </div>
    )
  }

  const { invoice, card, transactions: invoiceTransactions } = invoiceData

  return (
    <div className="page-content">
      <button
        onClick={() => setCurrentPage('dayDetails')}
        className="back-button"
      >
        <ArrowLeft size={20} />
        <span>Voltar para Detalhes do Dia</span>
      </button>

      <h1 className="details-title">Detalhes da Fatura</h1>

      <div className="invoice-summary-card">
        <div className="summary-item">
          <CreditCard className="summary-icon" />
          <div>
            <span>Cartão de Crédito</span>
            <strong>{card?.name || 'N/A'}</strong>
          </div>
        </div>
        <div className="summary-item">
          <Calendar className="summary-icon" />
          <div>
            <span>Mês da Fatura</span>
            <strong>{invoice.month.replace('-', '/')}</strong>
          </div>
        </div>
        <div className="summary-item">
          <Hash className="summary-icon" />
          <div>
            <span>Total da Fatura</span>
            <strong className="summary-expense">
              R$ {invoice.total.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      <div className="invoice-transactions-list">
        <h2 className="section-title">Compras na Fatura</h2>
        {invoiceTransactions.length > 0 ? (
          invoiceTransactions.map((trans) => (
            <div key={trans.id} className="invoice-transaction-item">
              <span className="transaction-date">{formatDate(trans.date)}</span>
              <p className="transaction-description">{trans.description}</p>
              <p className="transaction-value">R$ {trans.value.toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p className="no-transactions">
            Nenhuma compra encontrada para esta fatura.
          </p>
        )}
      </div>
    </div>
  )
}
