import { useState, useEffect } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { logger } from '../utils/logger'

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
          const docData = docSnap.data()
          
          // **MELHORIA**: Conversão de Timestamps com tratamento robusto de erros
          try {
            for (const key in docData) {
              if (docData[key] && typeof docData[key].toDate === 'function') {
                try {
                  docData[key] = docData[key].toDate()
                } catch (timestampError) {
                  logger.warn(`Erro ao converter Timestamp para campo '${key}':`, timestampError)
                  // Mantém o valor original se a conversão falhar
                  docData[key] = docData[key]
                }
              }
            }
            setData(docData)
          } catch (conversionError) {
            logger.error('Erro crítico na conversão de Timestamps:', conversionError)
            logger.error('Documento problemático:', { id: docSnap.id, data: docData })
            // Retorna dados originais se a conversão falhar completamente
            setData({ ...docData, _conversionError: true })
          }
        } else {
          setData(null) // Documento não existe
        }
        setLoading(false)
      },
      (error) => {
        logger.error('Erro no useFirestoreDocument:', error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [docRef])

  return { data, loading }
}
