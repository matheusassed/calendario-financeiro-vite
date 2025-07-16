import React from 'react'
import { CategoryManagement } from '../components/CategoryManagement'

// No futuro, outros componentes como CreditCardManagement podem ser adicionados aqui
export function SettingsView({ categories }) {
  return (
    <div className="page-content">
      <h1 className="form-title">Configurações</h1>
      <div className="settings-container">
        <CategoryManagement categories={categories} />
        {/* <CreditCardManagement creditCards={creditCards} /> */}
      </div>
    </div>
  )
}
