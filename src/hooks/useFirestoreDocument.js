import { useState, useEffect } from 'react'
import { onSnapshot } from 'firebase/firestore'

/**
 * Um hook customizado para buscar um único documento do Firestore em tempo real.
 * @param {object} docRef - A referência do documento do Firestore.
 * @returns {{data: object, loading: boolean}} - Um objeto contendo os dados do documento e o estado de carregamento.
 */
export const useFirestoreDocument = (docRef) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!docRef) {
      setData(null)
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data())
        } else {
          setData(null) // Documento não existe
        }
        setLoading(false)
      },
      (error) => {
        console.error('Erro no useFirestoreDocument:', error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [docRef])

  return { data, loading }
}
