import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, RefreshCw, Eye, AlertCircle, Check, X } from 'lucide-react'
import {
  RECURRENCE_TYPES,
  validateRecurrenceRule,
  generateRecurrenceDates,
  getRecurrenceDescription,
} from '../utils/recurrence'
import { logger } from '../utils/logger'

export function RecurrenceConfig({
  onRuleChange,
  initialRule = null,
  startDate = new Date(),
  disabled = false,
}) {
  const [isEnabled, setIsEnabled] = useState(!!initialRule)
  const [rule, setRule] = useState(
    initialRule || {
      type: RECURRENCE_TYPES.MONTHLY,
      interval: 1,
      endDate: '',
      count: 12,
    },
  )
  const [endType, setEndType] = useState(
    initialRule?.endDate ? 'date' : 'count',
  )
  const [showPreview, setShowPreview] = useState(false)
  const [validation, setValidation] = useState({ isValid: true, errors: [] })
  const [previewDates, setPreviewDates] = useState([])

  // Função para calcular e validar a regra atual
  const calculateCurrentRule = useCallback(() => {
    if (!isEnabled) return null

    return {
      ...rule,
      endDate: endType === 'date' ? rule.endDate : null,
      count: endType === 'count' ? rule.count : null,
    }
  }, [isEnabled, rule, endType])

  // Effect para validação (separado da notificação)
  useEffect(() => {
    const currentRule = calculateCurrentRule()

    if (currentRule) {
      const validationResult = validateRecurrenceRule(currentRule)
      setValidation(validationResult)

      // Gerar preview se válido
      if (validationResult.isValid) {
        try {
          const dates = generateRecurrenceDates(startDate, currentRule, 6)
          setPreviewDates(dates)
        } catch (error) {
          setPreviewDates([])
          logger.error('Erro ao gerar datas de recorrência:', error)
        }
      } else {
        setPreviewDates([])
      }
    } else {
      setValidation({ isValid: true, errors: [] })
      setPreviewDates([])
    }
  }, [calculateCurrentRule, startDate])

  // Effect separado para notificar o pai (executa menos frequentemente)
  useEffect(() => {
    const currentRule = calculateCurrentRule()

    if (currentRule) {
      const validationResult = validateRecurrenceRule(currentRule)
      if (onRuleChange) {
        onRuleChange(validationResult.isValid ? currentRule : null)
      }
    } else {
      if (onRuleChange) {
        onRuleChange(null)
      }
    }
  }, [calculateCurrentRule, onRuleChange]) // Adicionado onRuleChange nas dependências

  const handleToggle = () => {
    if (disabled) return
    setIsEnabled(!isEnabled)
  }

  const handleRuleChange = (field, value) => {
    setRule((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEndTypeChange = (type) => {
    setEndType(type)
    // Limpar o campo não utilizado
    if (type === 'date') {
      setRule((prev) => ({ ...prev, count: null }))
    } else {
      setRule((prev) => ({ ...prev, endDate: '' }))
    }
  }

  const formatPreviewDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (disabled) {
    return (
      <div className="recurrence-config disabled">
        <div className="recurrence-toggle">
          <RefreshCw size={16} className="icon-disabled" />
          <span className="toggle-label disabled">Transação Recorrente</span>
          <span className="disabled-note">(Não disponível para edição)</span>
        </div>
      </div>
    )
  }

  return (
    <div className="recurrence-config">
      {/* Toggle Principal */}
      <div className="recurrence-toggle">
        <button
          type="button"
          onClick={handleToggle}
          className={`toggle-button ${isEnabled ? 'active' : ''}`}
        >
          <RefreshCw size={16} />
        </button>
        <span className="toggle-label">Transação Recorrente</span>
        {isEnabled && validation.isValid && (
          <Check size={16} className="validation-icon valid" />
        )}
        {isEnabled && !validation.isValid && (
          <AlertCircle size={16} className="validation-icon invalid" />
        )}
      </div>

      {/* Configuração da Recorrência */}
      {isEnabled && (
        <div className="recurrence-settings">
          {/* Tipo de Recorrência */}
          <div className="form-group">
            <label>Frequência</label>
            <select
              value={rule.type}
              onChange={(e) => handleRuleChange('type', e.target.value)}
              className="form-control"
            >
              <option value={RECURRENCE_TYPES.MONTHLY}>Mensal</option>
              <option value={RECURRENCE_TYPES.YEARLY}>Anual</option>
              <option value={RECURRENCE_TYPES.CUSTOM}>Personalizada</option>
            </select>
          </div>

          {/* Intervalo */}
          {(rule.type === RECURRENCE_TYPES.CUSTOM ||
            rule.type === RECURRENCE_TYPES.MONTHLY) && (
            <div className="form-group">
              <label>
                A cada{' '}
                {rule.type === RECURRENCE_TYPES.YEARLY ? 'anos' : 'meses'}
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={rule.interval}
                onChange={(e) =>
                  handleRuleChange('interval', parseInt(e.target.value) || 1)
                }
                className="form-control"
              />
            </div>
          )}

          {/* Tipo de Término */}
          <div className="form-group">
            <label>Término</label>
            <div className="end-type-options">
              <label className="radio-option">
                <input
                  type="radio"
                  value="count"
                  checked={endType === 'count'}
                  onChange={(e) => handleEndTypeChange(e.target.value)}
                />
                <span>Após um número de vezes</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="date"
                  checked={endType === 'date'}
                  onChange={(e) => handleEndTypeChange(e.target.value)}
                />
                <span>Em uma data específica</span>
              </label>
            </div>
          </div>

          {/* Campo de Término */}
          {endType === 'count' && (
            <div className="form-group">
              <label>Número de ocorrências</label>
              <input
                type="number"
                min="2"
                max="60"
                value={rule.count || 12}
                onChange={(e) =>
                  handleRuleChange('count', parseInt(e.target.value) || 12)
                }
                className="form-control"
              />
            </div>
          )}

          {endType === 'date' && (
            <div className="form-group">
              <label>Data final</label>
              <input
                type="date"
                value={rule.endDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleRuleChange('endDate', e.target.value)}
                className="form-control"
              />
            </div>
          )}

          {/* Erros de Validação */}
          {!validation.isValid && (
            <div className="validation-errors">
              {validation.errors.map((error, index) => (
                <div key={index} className="error-message">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Descrição da Regra */}
          {validation.isValid && (
            <div className="rule-description">
              <Calendar size={14} />
              <span>{getRecurrenceDescription(calculateCurrentRule())}</span>
            </div>
          )}

          {/* Preview das Próximas Datas */}
          {validation.isValid && previewDates.length > 0 && (
            <div className="preview-section">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="preview-toggle"
              >
                <Eye size={14} />
                <span>
                  {showPreview ? 'Ocultar' : 'Ver'} próximas datas
                  {!showPreview && ` (${previewDates.length})`}
                </span>
              </button>

              {showPreview && (
                <div className="preview-dates">
                  {previewDates.map((date, index) => (
                    <div key={index} className="preview-date">
                      <span className="date-index">{index + 1}ª</span>
                      <span className="date-value">
                        {formatPreviewDate(date)}
                      </span>
                    </div>
                  ))}
                  {previewDates.length >= 6 && (
                    <div className="preview-more">
                      <span>... e outras datas futuras</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
