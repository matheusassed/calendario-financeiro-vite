import React, { useState, useEffect } from 'react'
import {
  calculateInstallments,
  getInstallmentDates,
  validateInstallmentConfig,
} from '../utils/installments'

/**
 * Componente para configurar parcelamento de compras no cartão de crédito
 * @param {Object} props
 * @param {function} props.onInstallmentChange - Callback quando os dados de parcelamento mudam
 * @param {number} props.totalValue - Valor total da transação
 * @param {Object} props.selectedCard - Cartão de crédito selecionado
 * @param {Date} props.purchaseDate - Data da compra
 * @param {boolean} props.disabled - Se o componente está desabilitado
 */
export function InstallmentConfig({
  onInstallmentChange,
  totalValue,
  selectedCard,
  purchaseDate,
  disabled = false,
}) {
  const [isInstallment, setIsInstallment] = useState(false)
  const [installments, setInstallments] = useState(2)
  const [validation, setValidation] = useState({ isValid: true, errors: [] })

  // Calcula o valor de cada parcela
  const installmentValue = isInstallment
    ? calculateInstallments(totalValue, installments)
    : totalValue

  // Gera preview das parcelas
  const [installmentPreview, setInstallmentPreview] = useState([])
  useEffect(() => {
    if (isInstallment && selectedCard && purchaseDate) {
      try {
        const dates = getInstallmentDates(
          purchaseDate,
          selectedCard,
          installments,
        )
        setInstallmentPreview(
          dates.map((date, index) => ({
            date,
            value:
              index === installments - 1
                ? totalValue - installmentValue.installmentValue * (installments - 1)
                : installmentValue.installmentValue,
          })),
        )
      } catch (error) {
        console.error('Erro ao gerar preview de parcelas:', error)
      }
    } else {
      setInstallmentPreview([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstallment, installments, selectedCard, purchaseDate, totalValue])

  // Validação quando os parâmetros mudam
  useEffect(() => {
    if (isInstallment) {
      const validation = validateInstallmentConfig({
        totalValue,
        installments,
        card: selectedCard,
        purchaseDate,
      })
      setValidation(validation)
      onInstallmentChange({
        isInstallment,
        isValid: validation.isValid,
        installments,
        totalValue,
        installmentValue,
      })
    } else {
      onInstallmentChange({ isInstallment: false, isValid: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstallment, installments, totalValue, selectedCard, onInstallmentChange])

  const handleInstallmentsChange = (e) => {
    const value = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 24)
    setInstallments(value)
  }

  return (
    <div className="installment-config">
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={isInstallment}
            onChange={(e) => setIsInstallment(e.target.checked)}
            disabled={disabled || !selectedCard}
          />{' '}
          Parcelar compra
        </label>
      </div>

      {isInstallment && (
        <div className="installment-fields">
          <div className="form-group">
            <label>Número de parcelas (2-48)</label>
            <input
              type="number"
              min="2"
              max="48"
              value={installments}
              onChange={handleInstallmentsChange}
              disabled={disabled}
            />
          </div>

          <div className="form-group">
            <label>Valor por parcela</label>
            <input
              type="text"
              value={installmentValue.values[0].toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
              readOnly
            />
          </div>

          {!validation.isValid && (
            <div className="form-error">
              {validation.errors.map((error, i) => (
                <div key={i}>{error}</div>
              ))}
            </div>
          )}

          {installmentPreview.length > 0 && (
            <div className="installment-preview">
              <h4>Preview das parcelas:</h4>
              <ul>
                {installmentPreview.map((item, index) => (
                  <li key={index}>
                    {item.date.toLocaleDateString('pt-BR')}:{' '}
                    {item.value.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}{' '}
                    ({index + 1}/{installments})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
