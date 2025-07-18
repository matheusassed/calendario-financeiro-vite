import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export function GlobalSettings() {
  const { db, user, appId } = useAuth()
  const [closeDay, setCloseDay] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Busca a configuração existente ao carregar o componente
  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(
        db,
        `artifacts/${appId}/users/${user.uid}/settings`,
        'global',
      )
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setCloseDay(docSnap.data().monthCloseDay || '')
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
      await setDoc(
        settingsRef,
        { monthCloseDay: parseInt(closeDay, 10) },
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

  if (loadingData) {
    return <div className="settings-card">A carregar configurações...</div>
  }

  return (
    <div className="settings-card">
      <h2 className="settings-title">Configurações Gerais</h2>
      <form onSubmit={handleSave} className="settings-form">
        <div className="form-group">
          <label htmlFor="monthCloseDay">Dia de Fechamento do Mês</label>
          <input
            type="number"
            id="monthCloseDay"
            value={closeDay}
            onChange={(e) => setCloseDay(e.target.value)}
            placeholder="Ex: 25"
            min="1"
            max="31"
            className="settings-input"
          />
          <p className="input-helper">
            Transações (exceto cartão de crédito) feitas a partir deste dia
            serão sugeridas para o próximo mês fiscal.
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
