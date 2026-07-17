import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthTokens } from '@/types';

class ApiService {
  private api: AxiosInstance;
  private tokens: AuthTokens | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (this.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = this.tokens?.refreshToken;
            if (!refreshToken) throw new Error('No refresh token');
            
            const response = await this.api.post('/auth/refresh', { refreshToken });
            const newTokens = response.data.data;
            
            this.setTokens(newTokens);
            localStorage.setItem('aviation_tokens', JSON.stringify(newTokens));
            
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout
            this.clearTokens();
            localStorage.removeItem('aviation_tokens');
            //window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  setTokens(tokens: AuthTokens) {
    this.tokens = tokens;
    localStorage.setItem('aviation_tokens', JSON.stringify(tokens));
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  clearTokens() {
    this.tokens = null;
    localStorage.removeItem('aviation_tokens');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private loadTokens() {
  if (this.tokens) return;

  const stored = localStorage.getItem('aviation_tokens');

  if (!stored) return;

  try {
    this.tokens = JSON.parse(stored);
  } catch {
    this.clearTokens();
  }
}

  // Auth endpoints
  async login(data: { email: string; password: string }) {
    return this.api.post('/auth/login', data);
  }

  async register(data: any) {
    return this.api.post('/auth/register', data);
  }

  async getCurrentUser() {
    return this.api.get('/auth/me');
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.api.post('/auth/change-password', data);
  }

  // Station endpoints
  async getStations() {
  return this.api.get('/stations');
}

async getStation(id: string) {
  return this.api.get(`/stations/${id}`);
}
 async getStationStats(stationId: string) {
    return this.api.get(`/stations/${stationId}/stats`);
}

  async getActiveStation() {
    return this.api.get('/stations/active');
  }

  async createStation(data: any) {
    return this.api.post('/stations', data);
  }

  async updateStation(id: string, data: any) {
    return this.api.put(`/stations/${id}`, data);
  }

  async deleteStation(id: string) {
    return this.api.delete(`/stations/${id}`);
  }

  async setActiveStation(id: string) {
    return this.api.put(`/stations/${id}/active`);
  }

  // Weather endpoints
  async getCurrentWeather(stationId: string) {
    return this.api.get(`/weather/${stationId}/current`);
  }

  async getHistoricalWeather(stationId: string, params?: any) {
    return this.api.get(`/weather/${stationId}/historical`, { params });
  }

  async getWeatherTrends(stationId: string, params?: any) {
    return this.api.get(`/weather/${stationId}/trends`, { params });
  }

  async getWeatherStats(stationId: string, params?: any) {
    return this.api.get(`/weather/${stationId}/stats`, { params });
  }

  async createWeather(data: any) {
    return this.api.post('/weather', data);
  }

  async updateWeather(id: string, data: any) {
    return this.api.put(`/weather/${id}`, data);
  }

  async deleteWeather(id: string) {
    return this.api.delete(`/weather/${id}`);
  }

  async importWeatherData(stationId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('stationId', stationId);
    return this.api.post('/weather/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Forecast endpoints
  async getCurrentForecast(stationId: string) {
    return this.api.get(`/forecast/${stationId}/current`);
  }

  async getTAF(stationId: string) {
    return this.api.get(`/forecast/${stationId}/taf`);
  }

  async getLatestWeatherAllStations() {
    return this.api.get('/weather/latest');
  }

  async getReportTemplates() {
    return this.api.get('/reports/templates');
  }

  async getSIGMET(stationId: string) {
    return this.api.get(`/forecast/${stationId}/sigmet`);
  }

  async getUpperAir(stationId: string, params?: any) {
    return this.api.get(`/forecast/${stationId}/upper-air`, { params });
  }

  async getForecastTimeline(stationId: string, params?: any) {
    return this.api.get(`/forecast/${stationId}/timeline`, { params });
  }

  async createForecast(data: any) {
    return this.api.post('/forecast', data);
  }

  async updateForecast(id: string, data: any) {
    return this.api.put(`/forecast/${id}`, data);
  }

  async deleteForecast(id: string) {
    return this.api.delete(`/forecast/${id}`);
  }

  async importNetCDF(stationId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('stationId', stationId);
    return this.api.post('/forecast/import-netcdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Impact endpoints
  async generateImpact(stationId: string, role?: string) {
    return this.api.get('/impacts/generate', { params: { stationId, role } });
  }

  async getImpactsByRole(role: string, stationId: string) {
    return this.api.get(`/impacts/role/${role}`, { params: { stationId } });
  }

  async getImpactLogs(params?: any) {
    return this.api.get('/impacts/logs', { params });
  }

  async getImpactStats(stationId: string, params?: any) {
    return this.api.get(`/impacts/${stationId}/stats`, { params });
  }

  async getDecisionLadder(stationId: string, role?: string) {
    return this.api.get(`/impacts/${stationId}/ladder`, { params: { role } });
  }

  async getActionRecommendations(stationId: string, role?: string) {
    return this.api.get(`/impacts/${stationId}/actions`, { params: { role } });
  }

  async acknowledgeImpact(id: string, actionTaken?: string) {
    return this.api.put(`/impacts/${id}/acknowledge`, { actionTaken });
  }

  // Threshold endpoints
  async getThresholds(stationId: string) {
    return this.api.get(`/thresholds/${stationId}`);
  }

  async getThresholdsByRole(stationId: string, role: string) {
    return this.api.get(`/thresholds/${stationId}/role/${role}`);
  }

  async createThreshold(data: any) {
    return this.api.post('/thresholds', data);
  }

  async updateThreshold(id: string, data: any) {
    return this.api.put(`/thresholds/${id}`, data);
  }

  async toggleThreshold(id: string) {
    return this.api.put(`/thresholds/${id}/toggle`);
  }

  async deleteThreshold(id: string) {
    return this.api.delete(`/thresholds/${id}`);
  }

  async applyDefaultThresholds(stationId: string) {
    return this.api.post(`/thresholds/${stationId}/apply-defaults`);
  }

  // Alert endpoints
  async getAlerts(params?: any) {
    return this.api.get('/alerts', { params });
  }

  async getUnreadCount() {
    return this.api.get('/alerts/unread-count');
  }

  async markAlertRead(id: string) {
    return this.api.put(`/alerts/${id}/read`);
  }

  async markAllAlertsRead() {
    return this.api.put('/alerts/mark-all-read');
  }

  async acknowledgeAlert(id: string) {
    return this.api.put(`/alerts/${id}/acknowledge`);
  }

  async createAlert(data: any) {
    return this.api.post('/alerts', data);
  }

  async deleteAlert(id: string) {
    return this.api.delete(`/alerts/${id}`);
  }

  // Report endpoints
  async generateWeatherReport(params: any) {
    return this.api.get('/reports/weather', { params });
  }

  async generateImpactReport(params: any) {
    return this.api.get('/reports/impact', { params });
  }

  async generateOperationalReport(params: any) {
    return this.api.get('/reports/operational', { params });
  }

  async exportCSV(params: any) {
    return this.api.get('/reports/export-csv', { params, responseType: 'blob' });
  }

  async exportExcel(params: any) {
    return this.api.get('/reports/export-excel', { params, responseType: 'blob' });
  }

  async getReportTemplates() {
    return this.api.get('/reports/templates');
  }

  // User endpoints
  async getUsers() {
    return this.api.get('/users');
  }

  async getUserStats() {
    return this.api.get('/users/stats');
  }

  async getUser(id: string) {
    return this.api.get(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.api.put(`/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.api.delete(`/users/${id}`);
  }

  async resetUserPassword(id: string, newPassword: string) {
    return this.api.post(`/users/${id}/reset-password`, { newPassword });
  }

  async updatePreferences(preferences: any) {
    return this.api.put('/users/preferences', { preferences });
  }
}

export const api = new ApiService();