import React, { useState, useMemo } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useFirestoreQuery } from './hooks/useFirestoreQuery'
import { useFirestoreDocument } from './hooks/useFirestoreDocument'
import { collection, query, doc } from 'firebase/firestore'

import { Sidebar } from './components/Sidebar'
import { LoginScreen } from './components/LoginScreen'
import { CalendarView } from './views/CalendarView'
import { ExpenseForm } from './views/ExpenseForm'
import { RevenueForm } from './views/RevenueForm'
import { SettingsView } from './views/SettingsView'
import { DayDetailsView } from './views/DayDetailsView'
import { InvoiceDetailsView } from './views/InvoiceDetailsView' // 1. Importa a nova tela

function App() {
  const { user, loadingAuth, db, appId } = useAuth()
  const [currentPage, setCurrentPage] = useState('calendar')
  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null) // 2. Novo estado para a fatura

  // --- Funções de Navegação de Dia ---
  const handleNextDay = () => {
    if (selectedDate) {
      const nextDay = new Date(selectedDate)
      nextDay.setDate(nextDay.getDate() + 1)
      setSelectedDate(nextDay)
    }
  }

  const handlePrevDay = () => {
    if (selectedDate) {
      const prevDay = new Date(selectedDate)
      prevDay.setDate(prevDay.getDate() - 1)
      setSelectedDate(prevDay)
    }
  }

  // --- Queries para o Firestore ---
  const transactionsQuery = useMemo(
    () =>
      user
        ? query(
            collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
          )
        : null,
    [db, appId, user],
  )
  const categoriesQuery = useMemo(
    () =>
      user
        ? query(
            collection(db, `artifacts/${appId}/users/${user.uid}/categories`),
          )
        : null,
    [db, appId, user],
  )
  const creditCardsQuery = useMemo(
    () =>
      user
        ? query(
            collection(db, `artifacts/${appId}/users/${user.uid}/creditCards`),
          )
        : null,
    [db, appId, user],
  )
  const invoicesQuery = useMemo(
    () =>
      user
        ? query(collection(db, `artifacts/${appId}/users/${user.uid}/invoices`))
        : null,
    [db, appId, user],
  )
  const settingsRef = useMemo(
    () =>
      user
        ? doc(db, `artifacts/${appId}/users/${user.uid}/settings`, 'global')
        : null,
    [db, appId, user],
  )

  // --- Busca de dados com os hooks ---
  const { data: transactions, loading: loadingTransactions } =
    useFirestoreQuery(transactionsQuery)
  const { data: categories, loading: loadingCategories } =
    useFirestoreQuery(categoriesQuery)
  const { data: creditCards, loading: loadingCreditCards } =
    useFirestoreQuery(creditCardsQuery)
  const { data: invoices, loading: loadingInvoices } =
    useFirestoreQuery(invoicesQuery)
  const { data: globalSettings, loading: loadingSettings } =
    useFirestoreDocument(settingsRef)

  const loadingData =
    loadingTransactions ||
    loadingCategories ||
    loadingCreditCards ||
    loadingSettings ||
    loadingInvoices

  const handleSave = () => {
    setCurrentPage('calendar')
  }

  const renderPage = () => {
    const props = {
      transactions,
      categories,
      creditCards,
      invoices,
      globalSettings,
      setCurrentPage,
      setSelectedDate,
      selectedDate,
      calendarDate,
      setCalendarDate,
      handleNextDay,
      handlePrevDay,
      selectedInvoiceId,
      setSelectedInvoiceId,
    }

    if (loadingData && !loadingAuth) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>A carregar dados...</p>
        </div>
      )
    }

    switch (currentPage) {
      case 'calendar':
        return <CalendarView {...props} />
      case 'addExpense':
        return (
          <ExpenseForm
            {...props}
            onSave={handleSave}
            onCancel={() => setCurrentPage('calendar')}
          />
        )
      case 'addRevenue':
        return (
          <RevenueForm
            {...props}
            onSave={handleSave}
            onCancel={() => setCurrentPage('calendar')}
          />
        )
      case 'settings':
        return <SettingsView {...props} />
      case 'dayDetails':
        return <DayDetailsView {...props} />
      case 'invoiceDetails':
        return <InvoiceDetailsView {...props} />
      default:
        return <CalendarView {...props} />
    }
  }

  if (loadingAuth) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  )
}

export default App
