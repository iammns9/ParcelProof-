import api from './api';

export const parcelService = {
  // Get all parcels with search, status, courier, page, limit, sort
  async getParcels(params = {}) {
    const response = await api.get('/parcels', { params });
    return response.data;
  },

  // Get parcel by ID (includes linked evidence)
  async getParcelById(id) {
    const response = await api.get(`/parcels/${id}`);
    return response.data;
  },

  // Create a new parcel
  async createParcel(parcelData) {
    const response = await api.post('/parcels', parcelData);
    return response.data;
  },

  // Update existing parcel
  async updateParcel(id, parcelData) {
    const response = await api.put(`/parcels/${id}`, parcelData);
    return response.data;
  },

  // Update shipment status with optional note
  async updateStatus(id, { status, note }) {
    const response = await api.patch(`/parcels/${id}/status`, { status, note });
    return response.data;
  },

  // Get parcel status history
  async getHistory(id) {
    const response = await api.get(`/parcels/${id}/history`);
    return response.data;
  },
};

export default parcelService;
