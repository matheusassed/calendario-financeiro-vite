import React, { useState, useMemo } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useFirestoreQuery } from './hooks/useFirestoreQuery'
import { collection, query } from 'firebase/firestore'

import { Sidebar } from './components/Sidebar'
import { LoginScreen } from './components/LoginScreen'
import { CalendarView } from './views/CalendarView'
import { ExpenseForm } from './views/ExpenseForm'
import { RevenueForm } from './views/RevenueForm'
import { SettingsView } from './views/SettingsView'
import { DayDetailsView } from './views/DayDetailsView' // Importação real

function App() {
  const { user, loadingAuth, db, appId } = useAuth()
  const [currentPage, setCurrentPage] = useState('calendar')
  const [selectedDate, setSelectedDate] = useState(null)

  // --- Queries para o Firestore ---
  const transactionsQuery = useMemo(() => {
    if (!user) return null
    return query(
      collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
    )
  }, [db, appId, user])

  const categoriesQuery = useMemo(() => {
    if (!user) return null
    return query(
      collection(db, `artifacts/${appId}/users/${user.uid}/categories`),
    )
  }, [db, appId, user])

  const creditCardsQuery = useMemo(() => {
    if (!user) return null
    return query(
      collection(db, `artifacts/${appId}/users/${user.uid}/creditCards`),
    )
  }, [db, appId, user])

  // --- Busca de dados com o hook ---
  const { data: transactions, loading: loadingTransactions } =
    useFirestoreQuery(transactionsQuery)
  const { data: categories, loading: loadingCategories } =
    useFirestoreQuery(categoriesQuery)
  const { data: creditCards, loading: loadingCreditCards } =
    useFirestoreQuery(creditCardsQuery)

  const loadingData =
    loadingTransactions || loadingCategories || loadingCreditCards

  const handleSave = () => {
    setCurrentPage('calendar')
  }

  const renderPage = () => {
    const props = {
      transactions,
      categories,
      creditCards,
      setCurrentPage,
      setSelectedDate,
      selectedDate, // Passa a data selecionada
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
