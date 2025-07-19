import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatFiscalMonth,
} from '../utils/helpers'

export function CalendarView({
  transactions,
  invoices,
  setCurrentPage,
  setSelectedDate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(clickedDate)
    setCurrentPage('dayDetails')
  }

  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

    const fiscalMonthStr = formatFiscalMonth(
      new Date(currentYear, currentMonth, 1),
    )

    const directImpactTransactions = transactions.filter((t) => !t.invoiceId)
    const dueInvoices = invoices.filter(
      (inv) => formatFiscalMonth(inv.dueDate) === fiscalMonthStr,
    )

    const initialBalance = directImpactTransactions
      .filter((t) => t.fiscalMonth < fiscalMonthStr)
      .reduce((acc, t) => {
        if (t.type === 'revenue') return acc + t.value
        if (t.type === 'expense') return acc - t.value
        return acc
      }, 0)

    let cumulativeBalance = initialBalance
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1

      const dayTransactions = directImpactTransactions.filter((t) => {
        const tDate = t.date
        return (
          t.fiscalMonth === fiscalMonthStr &&
          tDate.getDate() === day &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        )
      })

      const creditCardTransactionsToday = transactions.filter(
        (t) =>
          t.paymentMethod === 'credit' &&
          t.date.getDate() === day &&
          t.date.getMonth() === currentMonth &&
          t.date.getFullYear() === currentYear,
      )

      const dayRevenues = dayTransactions
        .filter((t) => t.type === 'revenue')
        .reduce((sum, t) => sum + t.value, 0)
      const dayExpenses = dayTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0)

      const invoicesDueToday = dueInvoices.filter(
        (inv) => inv.dueDate.getDate() === day,
      )
      const totalInvoiceExpenses = invoicesDueToday.reduce(
        (sum, inv) => sum + inv.total,
        0,
      )

      cumulativeBalance += dayRevenues - dayExpenses - totalInvoiceExpenses

      return {
        day,
        revenues: dayRevenues,
        expenses: dayExpenses + totalInvoiceExpenses,
        balance: cumulativeBalance,
        creditCardTransactions: creditCardTransactionsToday,
      }
    })

    return {
      daysInMonth,
      firstDay,
      dailyData,
      monthName: new Date(currentYear, currentMonth).toLocaleDateString(
        'pt-BR',
        { month: 'long' },
      ),
      year: currentYear,
    }
  }, [currentYear, currentMonth, transactions, invoices])

  const blanks = Array.from({ length: monthData.firstDay })
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="page-content">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-button">
          <ChevronLeft />
        </button>
        <h2 className="calendar-title">{`${monthData.monthName} de ${monthData.year}`}</h2>
        <button onClick={handleNextMonth} className="nav-button">
          <ChevronRight />
        </button>
      </div>
      <div className="calendar-grid">
        {weekDays.map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="day-cell blank"></div>
        ))}
        {monthData.dailyData.map((data) => {
          const isToday =
            data.day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()

          const dayCellClasses = `day-cell ${isToday ? 'today' : ''}`
          const hasCreditCardTransactions =
            data.creditCardTransactions.length > 0

          return (
            <div
              key={data.day}
              className={dayCellClasses}
              onClick={() => handleDayClick(data.day)}
            >
              <div className="day-header">
                <div className="day-number">{data.day}</div>
                {hasCreditCardTransactions && (
                  <div className="credit-card-icon-container">
                    <CreditCard size={14} className="credit-card-icon" />
                  </div>
                )}
              </div>
              <div className="day-details">
                {data.revenues > 0 && (
                  <p className="day-revenue">R: {data.revenues.toFixed(2)}</p>
                )}
                {data.expenses > 0 && (
                  <p className="day-expense">D: {data.expenses.toFixed(2)}</p>
                )}
                <p className="day-balance">S: {data.balance.toFixed(2)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
