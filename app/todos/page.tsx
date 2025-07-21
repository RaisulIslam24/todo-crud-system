'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import TodoItem from '@/components/TodoItem'
import Link from 'next/link'

interface Todo {
  id: string
  title: string
  description: string
  createdAt: Timestamp
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
      } else {
        router.push('/login')
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchTodos()
    }
  }, [userId])

  const fetchTodos = async () => {
    setLoading(true)
    setError('')
    try {
      const q = query(
        collection(db, 'todos'),
        where('uid', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const fetched = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Todo, 'id'>),
      }))
      setTodos(fetched)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch todos.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description) return

    setSubmitting(true)
    setLoading(true)
    setError('')

    try {
      if (editingId) {
        const docRef = doc(db, 'todos', editingId)
        await updateDoc(docRef, { title, description })
        setEditingId(null)
      } else {
        await addDoc(collection(db, 'todos'), {
          title,
          description,
          uid: userId,
          createdAt: serverTimestamp(),
        })
      }
      setTitle('')
      setDescription('')
      fetchTodos()
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (todo: Todo) => {
    setTitle(todo.title)
    setDescription(todo.description)
    setEditingId(todo.id)
  }

  const handleDelete = async (id: string) => {
    setError('')
    try {
      await deleteDoc(doc(db, 'todos', id))
      fetchTodos()
    } catch (err) {
      console.error(err)
      setError('Failed to delete todo.')
    }
  }

  const logout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <>
      <div className="flex justify-end items-center m-6">
        <nav className="space-x-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/todos">Todos</Link>
          <button onClick={logout} className="text-red-500">Logout</button>
        </nav>
      </div>

      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Todos</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className={`bg-blue-500 text-white p-2 rounded w-full ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {editingId ? 'Update Todo' : 'Add Todo'}
          </button>
        </form>

        <div>
          {loading ? (
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 animate-pulse rounded" />
              <div className="h-20 bg-gray-200 animate-pulse rounded" />
            </div>
          ) : todos.length === 0 ? (
            <p className="text-gray-500">No todos yet.</p>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                id={todo.id}
                title={todo.title}
                description={todo.description}
                createdAt={todo.createdAt}
                onEdit={() => handleEdit(todo)}
                onDelete={() => handleDelete(todo.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
