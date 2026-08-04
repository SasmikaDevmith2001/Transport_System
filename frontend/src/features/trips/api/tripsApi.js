import apiClient from '../../../services/apiClient';

export const tripsApi = {
  list: (params) => apiClient.get('/trips', { params }).then((res) => res.data),
  getById: (id) => apiClient.get(`/trips/${id}`).then((res) => res.data.data),
  create: (payload) => apiClient.post('/trips', payload).then((res) => res.data.data),
  update: (id, payload) => apiClient.put(`/trips/${id}`, payload).then((res) => res.data.data),
  assign: (id, driverId) => apiClient.patch(`/trips/${id}/assign`, { driverId }).then((res) => res.data.data),
  updateStatus: (id, status) => apiClient.patch(`/trips/${id}/status`, { status }).then((res) => res.data.data),
  remove: (id) => apiClient.delete(`/trips/${id}`).then((res) => res.data),
};
