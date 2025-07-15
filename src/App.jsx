import React, { useState, useMemo } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useFirestoreQuery } from "./hooks/useFirestoreQuery";
import { collection, query } from "firebase/firestore";

import { Sidebar } from "./components/Sidebar";
import { LoginScreen } from "./components/LoginScreen";
import { CalendarView } from "./views/CalendarView";

// Componentes de placeholder para as futuras telas
const DayDetailsView = ({ selectedDate }) => (
  <div className="page-content">
    <h1>Detalhes do Dia</h1>
    <p>
      Data selecionada:{" "}
      {selectedDate ? selectedDate.toLocaleDateString() : "Nenhuma"}
    </p>
  </div>
);
const ExpenseForm = () => (
  <div className="page-content">
    <h1>Formulário de Despesa</h1>
  </div>
);
const RevenueForm = () => (
  <div className="page-content">
    <h1>Formulário de Receita</h1>
  </div>
);
const SettingsView = () => (
  <div className="page-content">
    <h1>Configurações</h1>
  </div>
);

function App() {
  const { user, loadingAuth, db, appId } = useAuth();
  const [currentPage, setCurrentPage] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(null);

  const transactionsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, `artifacts/${appId}/users/${user.uid}/transactions`)
    );
  }, [db, appId, user]);

  const { data: transactions, loading: loadingTransactions } =
    useFirestoreQuery(transactionsQuery);
  const loadingData = loadingTransactions;

  const renderPage = () => {
    const props = {
      transactions,
      setCurrentPage,
      setSelectedDate,
    };

    if (loadingData && !loadingAuth) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      );
    }

    switch (currentPage) {
      case "calendar":
        return <CalendarView {...props} />;
      case "addExpense":
        return <ExpenseForm {...props} />;
      case "addRevenue":
        return <RevenueForm {...props} />;
      case "settings":
        return <SettingsView {...props} />;
      case "dayDetails":
        return <DayDetailsView {...props} selectedDate={selectedDate} />;
      default:
        return <CalendarView {...props} />;
    }
  };

  if (loadingAuth) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
