import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock } from 'lucide-react'

export function LoginScreen() {
  const { loginUser, registerUser, loadingAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegistering) {
        await registerUser(email, password)
      } else {
        await loginUser(email, password)
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          {isRegistering ? 'Criar Conta' : 'Calendário Financeiro'}
        </h2>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="input-field"
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mínimo 6 caracteres)"
              required
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loadingAuth} className="btn-primary">
            {loadingAuth
              ? 'Aguarde...'
              : isRegistering
                ? 'Registrar'
                : 'Entrar'}
          </button>
        </form>
        <div className="login-toggle">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="btn-secondary"
          >
            {isRegistering ? 'Já tem uma conta? Faça Login' : 'Criar uma conta'}
          </button>
        </div>
      </div>
    </div>
  )
}
