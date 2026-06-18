import api from './api'

export const getAll = () => api.get('/appointments').then(r => r.data)
export const getAvailable = () => api.get('/appointments/available').then(r => r.data)
export const getMy = () => api.get('/appointments/my').then(r => r.data)
export const getByPatient = (patientId) => api.get(`/appointments/patient/${patientId}`).then(r => r.data)
export const createSlot = (data) => api.post('/appointments/slot', data).then(r => r.data)
export const book = (id, data) => api.post(`/appointments/${id}/book`, data).then(r => r.data)
export const updateStatus = (id, status) => api.put(`/appointments/${id}/status`, { status }).then(r => r.data)
export const cancel = (id) => api.put(`/appointments/${id}/cancel`).then(r => r.data)
export const remove = (id) => api.delete(`/appointments/${id}`)
