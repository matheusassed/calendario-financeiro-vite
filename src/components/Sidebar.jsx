import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Wallet,
  CalendarDays,
  MinusCircle,
  Plus,
  Settings,
  LogOut,
} from 'lucide-react'

export function Sidebar({ currentPage, setCurrentPage }) {
  const { logoutUser } = useAuth()

  const navItems = [
    { page: 'calendar', label: 'Calendário', icon: CalendarDays },
    { page: 'addExpense', label: 'Despesa', icon: MinusCircle },
    { page: 'addRevenue', label: 'Receita', icon: Plus },
    { page: 'settings', label: 'Ajustes', icon: Settings },
  ]

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <Wallet size={32} className="sidebar-logo" />
      </div>
      <ul className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.page}>
              <button
                title={item.label}
                onClick={() => setCurrentPage(item.page)}
                className={`sidebar-button ${currentPage === item.page ? 'active' : ''}`}
              >
                <Icon size={24} />
                <span className="sidebar-label">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="sidebar-footer">
        <button title="Sair" onClick={logoutUser} className="sidebar-button">
          <LogOut size={24} />
          <span className="sidebar-label">Sair</span>
        </button>
      </div>
    </nav>
  )
}
