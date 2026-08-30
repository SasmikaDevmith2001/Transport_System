import apiClient from '../../../services/apiClient';

export const tripsApi = {
  list: (params) => apiClient.get('/trips', { params }).then((res) => res.data),
  getById: (id) => apiClient.get(`/trips/${id}`).then((res) => res.data.data),
  create: (payload) => apiClient.post('/trips', payload).then((res) => res.data.data),
  update: (id, payload) => apiClient.put(`/trips/${id}`, payload).then((res) => res.data.data),
  assign: (id, driverId) => apiClient.patch(`/trips/${id}/assign`, { driverId }).then((res) => res.data.data),
  updateStatus: (id, status, gps) => apiClient.patch(`/trips/${id}/status`, { status, ...gps }).then((res) => res.data.data),
  updateStopDetails: (tripId, stopId, payload) => apiClient.patch(`/trips/${tripId}/stops/${stopId}`, payload).then((res) => res.data.data),
  remove: (id) => apiClient.delete(`/trips/${id}`).then((res) => res.data),
  listPendingApproval: (params) => apiClient.get('/trips/pending-approval', { params }).then((res) => res.data),
  approveTrip: (id, payload) => apiClient.patch(`/trips/${id}/approve`, payload).then((res) => res.data.data),
};
