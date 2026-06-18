import api from './api'

export const getByPatient = (patientId) => api.get(`/attention-records/patient/${patientId}`).then(r => r.data)
export const create = (data) => api.post('/attention-records', data).then(r => r.data)
export const update = (id, data) => api.put(`/attention-records/${id}`, data).then(r => r.data)
export const remove = (id) => api.delete(`/attention-records/${id}`)
