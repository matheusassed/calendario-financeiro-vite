/**
 * Configuração centralizada do Firebase
 * Evita múltiplas inicializações e centraliza instâncias
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Inicializar Firebase apenas uma vez
export const firebaseApp = initializeApp(firebaseConfig)

// Exportar instâncias configuradas
export const firebaseAuth = getAuth(firebaseApp)
export const firebaseDb = getFirestore(firebaseApp)

// Verificar se já existe uma instância (para debug)
if (import.meta.env.DEV) {
  import('../utils/logger.js').then(({ logger }) => {
    logger.info('Firebase inicializado:', firebaseApp.name)
    logger.info('Instância única:', firebaseApp)
  })
}
