import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'

export function CategoryManagement({ categories }) {
  const { db, user, appId } = useAuth()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Estado para controlar o modal de confirmação
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      setError('O nome da categoria não pode estar vazio.')
      return
    }
    setLoading(true)
    setError('')
    const loadingToast = toast.loading('Adicionando categoria...')
    try {
      await addDoc(
        collection(db, `artifacts/${appId}/users/${user.uid}/categories`),
        {
          name: newCategoryName.trim(),
        },
      )
      toast.success('Categoria adicionada!', { id: loadingToast })
      setNewCategoryName('')
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err)
      toast.error('Não foi possível adicionar a categoria.', {
        id: loadingToast,
      })
      setError('Não foi possível adicionar a categoria.')
    }
    setLoading(false)
  }

  // Abre o modal de confirmação
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
    setIsModalOpen(true)
  }

  // Ação executada ao confirmar no modal
  const confirmDelete = async () => {
    if (!categoryToDelete) return

    const loadingToast = toast.loading('Excluindo categoria...')
    try {
      await deleteDoc(
        doc(
          db,
          `artifacts/${appId}/users/${user.uid}/categories`,
          categoryToDelete.id,
        ),
      )
      toast.success('Categoria excluída!', { id: loadingToast })
    } catch (err) {
      console.error('Erro ao excluir categoria:', err)
      toast.error('Não foi possível excluir a categoria.', { id: loadingToast })
    } finally {
      setIsModalOpen(false)
      setCategoryToDelete(null)
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"?
        </p>
        <p>Esta ação não pode ser desfeita.</p>
      </ConfirmModal>

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
                onClick={() => handleDeleteClick(cat)}
                className="delete-button"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
