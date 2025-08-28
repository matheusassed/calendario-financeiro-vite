import React, { useState, useEffect, createContext, useContext } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { firebaseAuth, firebaseDb } from '../firebase/config'

const AuthContext = createContext(null)

// Hook customizado continua como uma exportação nomeada
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext)
}

// O componente Provedor agora é a exportação PADRÃO
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Usar instâncias centralizadas do Firebase
  const auth = firebaseAuth
  const db = firebaseDb

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoadingAuth(false)
    })
    return unsubscribe
  }, [auth])

  const registerUser = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)
  const loginUser = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)
  const logoutUser = () => signOut(auth)

  const value = {
    user,
    loadingAuth,
    db,
    auth,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    registerUser,
    loginUser,
    logoutUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  )
}
