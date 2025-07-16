import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore'
import { Plus, Trash2 } from 'lucide-react'

export function CategoryManagement({ categories }) {
  const { db, user, appId } = useAuth()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      setError('O nome da categoria não pode estar vazio.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(
        collection(db, `artifacts/${appId}/users/${user.uid}/categories`),
        {
          name: newCategoryName.trim(),
        },
      )
      setNewCategoryName('') // Limpa o campo após o sucesso
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err)
      setError('Não foi possível adicionar a categoria.')
    }
    setLoading(false)
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteDoc(
          doc(db, `artifacts/${appId}/users/${user.uid}/categories`, id),
        )
      } catch (err) {
        console.error('Erro ao excluir categoria:', err)
        alert('Não foi possível excluir a categoria.')
      }
    }
  }

  return (
    <div className="settings-card">
      <h2 className="settings-title">Gerenciar Categorias</h2>
      <form onSubmit={handleAddCategory} className="add-item-form">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nome da nova categoria"
          className="add-item-input"
        />
        <button type="submit" className="add-item-button" disabled={loading}>
          <Plus size={20} />
          <span>{loading ? 'Adicionando...' : 'Adicionar'}</span>
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}

      <ul className="item-list">
        {categories.length === 0 && <p>Nenhuma categoria cadastrada.</p>}
        {categories.map((cat) => (
          <li key={cat.id} className="item-list-entry">
            <span>{cat.name}</span>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="delete-button"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
