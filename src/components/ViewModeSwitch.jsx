import React from 'react'

export function ViewModeSwitch({ viewMode, setViewMode }) {
  return (
    <div className="view-mode-switch">
      <button
        onClick={() => setViewMode('fiscal')}
        className={viewMode === 'fiscal' ? 'active' : ''}
      >
        Mês Fiscal
      </button>
      <button
        onClick={() => setViewMode('cashflow')}
        className={viewMode === 'cashflow' ? 'active' : ''}
      >
        Fluxo de Caixa
      </button>
    </div>
  )
}
