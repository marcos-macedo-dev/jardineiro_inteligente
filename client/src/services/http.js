import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getHumidity = () => {
  return http.get('/umidade')
}

export const controlRelay = (estado) => {
  return http.post('/rele', { estado })
}

export default http
