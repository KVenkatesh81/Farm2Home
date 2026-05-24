import axios from 'axios'

const BASE_URL = 'https://bug-free-yodel-4j94ww6v69q7c56-5000.app.github.dev'

const api = axios.create({
  baseURL: BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
