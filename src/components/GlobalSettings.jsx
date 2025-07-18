import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export function GlobalSettings() {
  const { db, user, appId } = useAuth()
  // O estado agora é um objeto para guardar a regra completa
  const [settings, setSettings] = useState({ type: 'day', value: 25 })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(
        db,
        `artifacts/${appId}/users/${user.uid}/settings`,
        'global',
      )
      const docSnap = await getDoc(docRef)
      if (docSnap.exists() && docSnap.data().monthCloseRule) {
        setSettings(docSnap.data().monthCloseRule)
      }
      setLoadingData(false)
    }
    fetchSettings()
  }, [db, user, appId])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const loadingToast = toast.loading('A guardar configurações...')
    try {
      const settingsRef = doc(
        db,
        `artifacts/${appId}/users/${user.uid}/settings`,
        'global',
      )
      // Guarda o objeto da regra no Firestore
      await setDoc(
        settingsRef,
        {
          monthCloseRule: { ...settings, value: parseInt(settings.value, 10) },
        },
        { merge: true },
      )
      toast.success('Configurações guardadas!', { id: loadingToast })
    } catch (err) {
      console.error('Erro ao guardar configurações:', err)
      toast.error('Não foi possível guardar as configurações.', {
        id: loadingToast,
      })
    }
    setLoading(false)
  }

  const handleTypeChange = (e) => {
    const newType = e.target.value
    // Reseta o valor para um padrão seguro ao mudar o tipo
    const defaultValue = newType === 'last_business_day' ? 1 : 25
    setSettings({ type: newType, value: defaultValue })
  }

  const handleValueChange = (e) => {
    setSettings((prev) => ({ ...prev, value: e.target.value }))
  }

  if (loadingData) {
    return <div className="settings-card">A carregar configurações...</div>
  }

  return (
    <div className="settings-card">
      <h2 className="settings-title">Configurações Gerais</h2>
      <form onSubmit={handleSave} className="settings-form">
        <div className="form-group">
          <label htmlFor="monthCloseDay">Regra de Fechamento do Mês</label>
          <div className="dynamic-rule-group">
            <select
              value={settings.type}
              onChange={handleTypeChange}
              className="settings-select"
            >
              <option value="day">Dia Fixo</option>
              <option value="last_business_day">
                Último(s) Dia(s) Útil(eis)
              </option>
            </select>
            <input
              type="number"
              value={settings.value}
              onChange={handleValueChange}
              className="settings-input"
              min="0"
              max="31"
            />
          </div>
          <p className="input-helper">
            {settings.type === 'day' &&
              'Transações (exceto cartão) a partir deste dia serão sugeridas para o próximo mês fiscal.'}
            {settings.type === 'last_business_day' &&
              'Contagem a partir do fim do mês (0 = último dia útil, 1 = penúltimo, etc.).'}
          </p>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Save size={18} />
          {loading ? 'A guardar...' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
