import React from 'react'

export function RecurrenceFieldset({ recurrenceRule, setRecurrenceRule }) {
  const handleRuleChange = (e) => {
    const { name, value } = e.target
    // Garante que o intervalo seja um número
    const newValue = name === 'interval' ? parseInt(value, 10) || 1 : value
    setRecurrenceRule((prev) => ({ ...prev, [name]: newValue }))
  }

  return (
    <fieldset className="recurrence-fieldset">
      <legend>Regras da Recorrência</legend>
      <div className="form-group-row">
        <div className="form-group">
          <label htmlFor="recurrenceType">Frequência</label>
          <select
            id="recurrenceType"
            name="type"
            value={recurrenceRule.type}
            onChange={handleRuleChange}
          >
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="recurrenceInterval">A cada</label>
          <input
            type="number"
            id="recurrenceInterval"
            name="interval"
            value={recurrenceRule.interval}
            onChange={handleRuleChange}
            min="1"
            className="settings-input"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="recurrenceEndDate">Data Final (opcional)</label>
        <input
          type="date"
          id="recurrenceEndDate"
          name="endDate"
          value={recurrenceRule.endDate}
          onChange={handleRuleChange}
        />
        <p className="input-helper">
          Deixe em branco para que a recorrência continue indefinidamente.
        </p>
      </div>
    </fieldset>
  )
}
