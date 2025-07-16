import React, { useState, useEffect, createContext, useContext } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

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

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

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
    appId: firebaseConfig.appId,
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
