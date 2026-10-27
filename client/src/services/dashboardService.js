import api from './api';

export const dashboardService = {
  // Get aggregated dashboard statistics
  async getSummary() {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
};

export default dashboardService;
