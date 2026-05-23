import axios from 'axios'

const api = axios.create({
  baseURL: 'https://bug-free-yodel-4j94ww6v69q7c56-5000.app.github.dev/',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api