import axios from 'axios'

const $api = 'https://jsonplaceholder.typicode.com/todos'

export const getTodos = async () => {
  const response = await axios.get(`${$api}?_limit=10`)
  return response.data
}

export const addTodo = async (todo) => {
  const response = await axios.post($api, todo)
  return response.data
}

export const updateTodo = async (id, completed) => {
  const response = await axios.patch(`${$api}/${id}`, {
    completed
  })

  return response.data
}