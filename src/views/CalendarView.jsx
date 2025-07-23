import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import React, { useMemo, useEffect, useCallback } from 'react'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatFiscalMonth,
} from '../utils/helpers'
import { TodayButton } from '../components/TodayButton'
import { ViewModeSwitch } from '../components/ViewModeSwitch'

export function CalendarView({
  transactions,
  invoices,
  setCurrentPage,
  setSelectedDate,
  calendarDate,
  setCalendarDate,
  viewMode,
  setViewMode,
}) {
  const today = new Date()

  const currentYear = calendarDate.getFullYear()
  const currentMonth = calendarDate.getMonth()

  const handlePrevMonth = useCallback(() => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1))
  }, [currentYear, currentMonth, setCalendarDate])

  const handleNextMonth = useCallback(() => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1))
  }, [currentYear, currentMonth, setCalendarDate])

  const handleGoToToday = useCallback(() => {
    setCalendarDate(new Date())
  }, [setCalendarDate])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'PageUp') {
        e.preventDefault()
        handlePrevMonth()
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        handleNextMonth()
      } else if (e.key === 'Home') {
        e.preventDefault()
        handleGoToToday()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlePrevMonth, handleNextMonth, handleGoToToday])

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(clickedDate)
    setCurrentPage('dayDetails')
  }

  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

    let cumulativeBalance = 0
    let dailyData = []

    // --- LÓGICA DINÂMICA ---
    if (viewMode === 'fiscal') {
      const fiscalMonthStr = formatFiscalMonth(
        new Date(currentYear, currentMonth, 1),
      )
      const directImpactTransactions = transactions.filter((t) => !t.invoiceId)
      const dueInvoices = invoices.filter(
        (inv) => formatFiscalMonth(inv.dueDate) === fiscalMonthStr,
      )
      const initialBalanceFromTransactions = directImpactTransactions
        .filter((t) => {
          const tDate = t.date
          return (
            t.fiscalMonth === fiscalMonthStr &&
            (tDate.getFullYear() < currentYear ||
              (tDate.getFullYear() === currentYear &&
                tDate.getMonth() < currentMonth))
          )
        })
        .reduce((acc, t) => {
          if (t.type === 'revenue') return acc + t.value
          if (t.type === 'expense') return acc - t.value
          return acc
        }, 0)

      cumulativeBalance = initialBalanceFromTransactions
      dailyData = Array.from({ length: daysInMonth }, (_, i) => {
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
    } else {
      // viewMode === 'cashflow'
      const startOfMonth = new Date(currentYear, currentMonth, 1)
      const directImpactTransactions = transactions.filter(
        (t) => t.paymentMethod !== 'credit',
      )
      
      const initialBalanceFromTransactions = directImpactTransactions
        .filter((t) => t.date < startOfMonth)
        .reduce((acc, t) => {
          if (t.type === 'revenue') return acc + t.value
          if (t.type === 'expense') return acc - t.value
          return acc
        }, 0)
      const initialBalanceFromInvoices = invoices
        .filter((inv) => inv.dueDate < startOfMonth)
        .reduce((sum, inv) => sum + inv.total, 0)

      cumulativeBalance =
        initialBalanceFromTransactions - initialBalanceFromInvoices
      dailyData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const dayTransactions = directImpactTransactions.filter(
          (t) =>
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

        const invoicesDueToday = invoices.filter(
          (inv) =>
            inv.dueDate.getDate() === day &&
            inv.dueDate.getMonth() === currentMonth &&
            inv.dueDate.getFullYear() === currentYear,
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
        }
      })
    }

    dailyData.forEach((data) => {
      data.creditCardTransactions = transactions.filter(
        (t) =>
          t.paymentMethod === 'credit' &&
          t.date.getDate() === data.day &&
          t.date.getMonth() === currentMonth &&
          t.date.getFullYear() === currentYear,
      )
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
  }, [currentYear, currentMonth, transactions, invoices, viewMode])

  const blanks = Array.from({ length: monthData.firstDay })
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="page-content">
      <div className="calendar-header">
        <div className="calendar-nav-group">
          <button onClick={handlePrevMonth} className="nav-button">
            <ChevronLeft />
          </button>
          <button onClick={handleNextMonth} className="nav-button">
            <ChevronRight />
          </button>
          <TodayButton onClick={handleGoToToday} />
        </div>
        <h2 className="calendar-title">{`${monthData.monthName} de ${monthData.year}`}</h2>
        <ViewModeSwitch viewMode={viewMode} setViewMode={setViewMode} />
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
