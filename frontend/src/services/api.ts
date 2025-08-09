import axios from 'axios';
import {
  User,
  Project,
  Subscription,
  Wallet,
  WithdrawalRequest,
  EnergyData,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OtpVerificationRequest,
  SubscriptionRequest,
  WithdrawalRequestData,
  KYCData,
  ApiResponse,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<string>>('/auth/register', data),
  
  verifyOtp: (data: OtpVerificationRequest) =>
    api.post<ApiResponse<string>>('/auth/verify-otp', data),
  
  resendOtp: (email: string) =>
    api.post<ApiResponse<string>>('/auth/resend-otp', { email }),
  
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),
  
  getCurrentUser: () =>
    api.get<User>('/auth/me'),
};

// Projects API
export const projectsAPI = {
  getActiveProjects: () =>
    api.get<Project[]>('/api/projects/active'),
  
  createProject: (project: Omit<Project, 'id'>) =>
    api.post<Project>('/api/projects/admin', project),
  
  updateProject: (id: number, project: Partial<Project>) =>
    api.put<Project>(`/api/projects/admin/${id}`, project),
  
  pauseProject: (id: number) =>
    api.patch<Project>(`/api/projects/admin/${id}/pause`),
};

// Subscriptions API
export const subscriptionsAPI = {
  initiateSubscription: (projectId: number) =>
    api.post<{ paymentOrderId: string; paymentLink: string }>('/api/subscriptions', null, {
      params: { projectId }
    }),
  
  getSubscriptionHistory: () =>
    api.get<Subscription[]>('/api/subscriptions/history'),
  
  handleWebhook: (orderId: string, status: string) =>
    api.post('/api/subscriptions/webhook', null, {
      params: { orderId, status }
    }),
};

// Wallet API
export const walletAPI = {
  getWallet: () =>
    api.get<Wallet>('/api/wallet'),
  
  getWalletHistory: () =>
    api.get('/api/wallet/history'),
  
  addFunds: (data: { amount: number }) =>
    api.post('/api/wallet/add-funds', data),
  
  getTransactionHistory: () =>
    api.get<any[]>('/api/wallet/transactions'),
};

// Withdrawal API
export const withdrawalAPI = {
  requestWithdrawal: (data: WithdrawalRequestData) =>
    api.post<WithdrawalRequest>('/api/withdrawal/request', data),
  
  getWithdrawalHistory: () =>
    api.get<WithdrawalRequest[]>('/api/withdrawal/history'),
  
  // Admin only
  approveWithdrawal: (id: number) =>
    api.post<WithdrawalRequest>(`/api/withdrawal/admin/${id}/approve`),
  
  rejectWithdrawal: (id: number) =>
    api.post<WithdrawalRequest>(`/api/withdrawal/admin/${id}/reject`),
};

// KYC API
export const kycAPI = {
  submitKYC: (data: FormData) =>
    api.post<KYCData>('/api/kyc/submit', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getKYCStatus: () =>
    api.get<KYCData>('/api/kyc/status'),
  
  // Admin only
  approveKYC: (id: number) =>
    api.post<KYCData>(`/api/kyc/admin/${id}/approve`),
  
  rejectKYC: (id: number) =>
    api.post<KYCData>(`/api/kyc/admin/${id}/reject`),
};

// Energy API
export const energyAPI = {
  getEnergyData: (projectId?: number) =>
    api.get<EnergyData[]>('/api/energy/data', {
      params: projectId ? { projectId } : {}
    }),
  
  getEnergyStats: () =>
    api.get<any>('/api/energy/stats'),
};

// Engagement API
export const engagementAPI = {
  getEngagementStats: () =>
    api.get<any>('/api/engagement/stats'),
  
  getEngagementHistory: () =>
    api.get<any>('/api/engagement/history'),
  
  reinvest: (data: { projectId: number; amount: number }) =>
    api.post('/api/engagement/reinvest', data),
  
  donate: (data: { projectId: number; amount: number }) =>
    api.post('/api/engagement/donate', data),
  
  gift: (data: { recipientEmail: string; amount: number }) =>
    api.post('/api/engagement/gift', data),
};

export default api; 