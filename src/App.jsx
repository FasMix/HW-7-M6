import { useState } from 'react'
import './App.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTodo, getTodos, updateTodo } from './api/todos'

export const App = () => {
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos
  })

  const addMutation = useMutation({
    mutationFn: addTodo,

    onSuccess: (newTodo) => {
      queryClient.setQueryData(['todos'], (oldTodos = []) => [
        { ...newTodo, id: crypto.randomUUID(), local: true },
        ...oldTodos
      ])
      setTitle('')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, completed }) => updateTodo(id, completed),

    onSuccess: (updatedTodo) => {
      queryClient.setQueryData(['todos'], (oldTodos = []) =>
        oldTodos.map((todo) =>
          todo.id === updatedTodo.id
            ? { ...todo, completed: updatedTodo.completed }
            : todo
        )
      )
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim()) return

    addMutation.mutate({
      title,
      completed: false,
      userId: 1
    })
  }

  const handleChange = (todo) => {
    if (todo.local) {
      queryClient.setQueryData(['todos'], (oldTodos = []) =>
        oldTodos.map((item) =>
          item.id === todo.id
            ? { ...item, completed: !item.completed }
            : item
        )
      )
      return
    }

    updateMutation.mutate({
      id: todo.id,
      completed: !todo.completed
    })
  }

  if (isLoading) {
    return <h2>Загрузка...</h2>
  }

  if (isError) {
    return <h2>Ошибка загрузки задач!</h2>
  }

  return (
    <div className="container">
      <h1>Мои задачи</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Введите задачу..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button disabled={addMutation.isPending}>
          {addMutation.isPending ? 'Добавление...' : 'Добавить'}
        </button>
      </form>

      {addMutation.isError && (
        <p>Ошибка добавления задачи!</p>
      )}

      {updateMutation.isError && (
        <p>Ошибка изменения задачи!</p>
      )}

      <div className="todos">
        {data.map((todo) => (
          <div className="todo" key={todo.id}>
            <span className={todo.completed ? 'completed' : ''}>
              {todo.title}
            </span>

            <input
              type="checkbox"
              checked={todo.completed}
              disabled={
                updateMutation.isPending &&
                updateMutation.variables?.id === todo.id
              }
              onChange={() => handleChange(todo)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App