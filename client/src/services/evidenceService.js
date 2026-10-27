import api from './api';

export const evidenceService = {
  // Get all evidence records
  async getAllEvidence(params = {}) {
    const response = await api.get('/evidence', { params });
    return response.data;
  },

  // Get evidence for a specific parcel
  async getParcelEvidence(parcelId) {
    const response = await api.get(`/parcels/${parcelId}/evidence`);
    return response.data;
  },

  // Upload evidence file
  async uploadEvidence(formData, onUploadProgress) {
    const response = await api.post('/evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Upload evidence directly under parcel route
  async uploadParcelEvidence(parcelId, formData, onUploadProgress) {
    const response = await api.post(`/parcels/${parcelId}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Get single evidence record
  async getEvidenceById(id) {
    const response = await api.get(`/evidence/${id}`);
    return response.data;
  },

  // Recalculate and verify SHA-256 cryptographic integrity
  async verifyIntegrity(id) {
    const response = await api.get(`/evidence/${id}/verify`);
    return response.data;
  },

  // Fetch binary blob for authenticated preview / download
  async fetchFileBlob(id, inline = true) {
    const response = await api.get(`/evidence/${id}/download`, {
      params: { inline },
      responseType: 'blob',
    });
    return response.data;
  },

  // Helper to generate direct authorized streaming URL (used when cookie or token can be passed)
  getDirectUrl(id, inline = true) {
    return `/api/evidence/${id}/download?inline=${inline}`;
  },
};

export default evidenceService;
