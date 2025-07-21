import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

interface TodoItemProps {
  id: string
  title: string
  description: string
  createdAt: Timestamp
  onEdit: () => void
  onDelete: () => void
}

export default function TodoItem({ id, title, description, createdAt, onEdit, onDelete }: TodoItemProps) {
  return (
    <div className="p-4 border rounded mb-2 bg-white shadow">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-gray-700">{description}</p>
      <p className="text-sm text-gray-400">Created: {createdAt && format(createdAt.toDate(), 'PPpp')}</p>
      <div className="mt-2 space-x-2">
        <button onClick={onEdit} className="text-blue-600">Edit</button>
        <button onClick={onDelete} className="text-red-500">Delete</button>
      </div>
    </div>
  )
}
