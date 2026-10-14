import api from './api';

export const issueService = {
  // Get all issues with query params
  async getIssues(params = {}) {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  // Get single issue
  async getIssueById(id) {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  // Create issue (supports FormData for multipart photo upload)
  async createIssue(formData) {
    const response = await api.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Toggle upvote
  async toggleUpvote(id) {
    const response = await api.post(`/issues/${id}/upvote`);
    return response.data;
  },

  // Admin status update (supports FormData or JSON)
  async updateStatus(id, data) {
    const isFormData = data instanceof FormData;
    const response = await api.patch(`/issues/${id}/status`, data, {
      headers: isFormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  // Delete issue
  async deleteIssue(id) {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  },
};
