import React, { useState, useMemo } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useFirestoreQuery } from './hooks/useFirestoreQuery'
import { useFirestoreDocument } from './hooks/useFirestoreDocument' // 1. Importa o novo hook
import { collection, query, doc } from 'firebase/firestore' // Importa 'doc'

import { Sidebar } from './components/Sidebar'
import { LoginScreen } from './components/LoginScreen'
import { CalendarView } from './views/CalendarView'
import { ExpenseForm } from './views/ExpenseForm'
import { RevenueForm } from './views/RevenueForm'
import { SettingsView } from './views/SettingsView'
import { DayDetailsView } from './views/DayDetailsView'

function App() {
  const { user, loadingAuth, db, appId } = useAuth()
  const [currentPage, setCurrentPage] = useState('calendar')
  const [selectedDate, setSelectedDate] = useState(null)

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

  // 2. Referência para o documento de configurações globais
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
  const { data: globalSettings, loading: loadingSettings } =
    useFirestoreDocument(settingsRef) // 3. Busca as configurações

  const loadingData =
    loadingTransactions ||
    loadingCategories ||
    loadingCreditCards ||
    loadingSettings

  const handleSave = () => {
    setCurrentPage('calendar')
  }

  const renderPage = () => {
    const props = {
      transactions,
      categories,
      creditCards,
      globalSettings, // 4. Passa as configurações para os componentes filhos
      setCurrentPage,
      setSelectedDate,
      selectedDate,
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
