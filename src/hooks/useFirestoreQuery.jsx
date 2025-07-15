import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';

/**
 * Um hook customizado para buscar uma coleção do Firestore em tempo real.
 * @param {object} query - O objeto de query do Firestore.
 * @returns {{data: Array, loading: boolean}} - Um objeto contendo os dados e o estado de carregamento.
 */
export const useFirestoreQuery = (query) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Certifica-se de que a query é válida antes de se inscrever.
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    // onSnapshot cria um listener em tempo real para a coleção.
    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const items = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          // Converte Timestamps para objetos Date do JS, se existirem.
          if (docData.date && typeof docData.date.toDate === 'function') {
            docData.date = docData.date.toDate();
          }
          return { id: doc.id, ...docData };
        });
        setData(items);
        setLoading(false);
      },
      (error) => {
        console.error("Erro no useFirestoreQuery:", error);
        setLoading(false);
      }
    );

    // Retorna a função de limpeza que cancela a inscrição do listener.
    return () => unsubscribe();
  }, [query]); // Re-executa o efeito se a query mudar.

  return { data, loading };
};
