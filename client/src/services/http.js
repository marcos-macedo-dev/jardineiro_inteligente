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

export const controlRelay = (state) => {
  return http.post('/relay', { state })
}
export const stateRelay = async (estado) => http.post('/relay', { state: estado })

export default http
