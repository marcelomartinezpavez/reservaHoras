import api from './api'

export const getAll = () => api.get('/patients').then(r => r.data)
export const getById = (id) => api.get(`/patients/${id}`).then(r => r.data)
export const getMyProfile = () => api.get('/patients/me').then(r => r.data)
export const create = (data) => api.post('/patients', data).then(r => r.data)
export const update = (id, data) => api.put(`/patients/${id}`, data).then(r => r.data)
export const remove = (id) => api.delete(`/patients/${id}`)
