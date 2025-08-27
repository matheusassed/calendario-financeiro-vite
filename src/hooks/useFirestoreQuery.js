import { useState, useEffect } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { logger } from '../utils/logger'

/**
 * Um hook customizado para buscar uma coleção do Firestore em tempo real.
 * @param {object} query - O objeto de query do Firestore.
 * @returns {{data: Array, loading: boolean}} - Um objeto contendo os dados e o estado de carregamento.
 */
export const useFirestoreQuery = (query) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      setData([])
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => {
          const docData = doc.data()

          // **CORREÇÃO**: Itera sobre todas as chaves do documento
          // e converte qualquer campo que seja um Timestamp do Firebase.
          for (const key in docData) {
            if (docData[key] && typeof docData[key].toDate === 'function') {
              docData[key] = docData[key].toDate()
            }
          }

          return { id: doc.id, ...docData }
        })
        setData(items)
        setLoading(false)
      },
      (error) => {
        logger.error('Erro no useFirestoreQuery:', error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [query])

  return { data, loading }
}
