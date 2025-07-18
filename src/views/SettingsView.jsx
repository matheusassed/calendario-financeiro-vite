import { CategoryManagement } from '../components/CategoryManagement'
import { CreditCardManagement } from '../components/CreditCardManagement' // 1. Importa o novo componente

export function SettingsView({ categories, creditCards }) {
  return (
    <div className="page-content">
      <h1 className="form-title">Configurações</h1>
      <div className="settings-container">
        <CategoryManagement categories={categories} />
        <CreditCardManagement creditCards={creditCards} />
      </div>
    </div>
  )
}
