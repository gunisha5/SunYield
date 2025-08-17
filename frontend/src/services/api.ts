import axios from 'axios';
import {
  User,
  Project,
  Subscription,
  Wallet,
  WithdrawalRequest,
  WithdrawalResponse,
  EnergyData,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OtpVerificationRequest,
  SubscriptionRequest,
  WithdrawalRequestData,
  KYCData,
  ApiResponse,
  DashboardStats,
  CreditTransferLog,
  KYC,
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
    // Check for admin token first, then regular user token
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');
    
    console.log('[DEBUG] API Request - URL:', config.url);
    console.log('[DEBUG] API Request - Admin Token:', adminToken ? 'Present' : 'Not present');
    console.log('[DEBUG] API Request - User Token:', userToken ? 'Present' : 'Not present');
    
    // Only use admin token for admin-specific endpoints
    if (adminToken && config.url && config.url.startsWith('/admin')) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      console.log('[DEBUG] API Request - Using Admin Token for admin endpoint');
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
      console.log('[DEBUG] API Request - Using User Token');
    } else {
      console.log('[DEBUG] API Request - No Token Found');
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
      // Check if it's an admin request
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/api/auth/login', data),
  
  register: (data: { email: string; password: string; fullName: string; contact: string }) =>
    api.post<{ token: string; user: User }>('/api/auth/register', data),
  
  verifyOtp: (data: { email: string; otp: string }) =>
    api.post<{ token: string; user: User }>('/api/auth/verify-otp', data),
  
  resendOtp: (data: { email: string }) =>
    api.post<{ message: string }>('/api/auth/resend-otp', data),
  
  getCurrentUser: () =>
    api.get<User>('/api/auth/me'),
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
  subscribeToProject: (projectId: number) =>
    api.post<{ success: boolean; message: string; projectName: string; amount: number; newBalance: number }>('/api/subscriptions', null, {
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
  
  processAddFundsPayment: (orderId: string) =>
    api.post(`/api/wallet/add-funds/process-payment?orderId=${orderId}`),
  
  getTransactionHistory: () =>
    api.get<any[]>('/api/wallet/transactions'),
};

// Withdrawal API
export const withdrawalAPI = {
  requestWithdrawal: (data: { amount: number; payoutMethod?: string; upiId?: string }) =>
    api.post<WithdrawalResponse>('/api/withdrawal/request', data),
  
  getWithdrawalHistory: () =>
    api.get<WithdrawalRequest[]>('/api/withdrawal/history'),
  
  getWithdrawalCapInfo: () =>
    api.get<{ monthlyCap: number; totalWithdrawnThisMonth: number; remainingAmount: number; currentMonth: string }>('/api/withdrawal/cap-info'),
  
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

// Admin API
export const adminAPI = {
  getDashboardStats: () =>
    api.get<DashboardStats>('/admin/dashboard/stats'),
  
  getAllUsers: () =>
    api.get<User[]>('/admin/users'),
  
  getAllProjects: () =>
    api.get<Project[]>('/admin/projects'),
  
  getPendingSubscriptions: () =>
    api.get<Subscription[]>('/admin/subscriptions/pending'),
  
  getAllSubscriptionTransactions: () =>
    api.get<CreditTransferLog[]>('/admin/subscriptions/transactions'),
  
  getUserInvestmentHistory: (userId: number) =>
    api.get<{ user: User; investments: CreditTransferLog[]; totalInvested: number }>(`/admin/users/${userId}/investments`),
  
  getProjectInvestmentSummary: (projectId: number) =>
    api.get<{ project: Project; investments: CreditTransferLog[]; totalInvested: number; uniqueInvestors: number }>(`/admin/projects/${projectId}/investments`),
  
  getAllKycRequests: () =>
    api.get<KYC[]>('/admin/kyc/all'),
  
  getPendingKyc: () =>
    api.get<KYC[]>('/admin/kyc/pending'),
  
  approveKyc: (id: number) =>
    api.post(`/admin/kyc/${id}/approve`),
  
  rejectKyc: (id: number) =>
    api.post(`/admin/kyc/${id}/reject`),
  
  addCreditsToUser: (userId: number, amount: number, notes: string) =>
    api.post(`/admin/users/${userId}/add-credits`, { amount, notes }),
  
  getMonthlyWithdrawalCap: () =>
    api.get<{ cap: number }>('/admin/config/monthly-withdrawal-cap'),
  
  setMonthlyWithdrawalCap: (cap: number) =>
    api.post('/admin/config/monthly-withdrawal-cap', { cap }),
  
  // Additional admin endpoints
  updateUserRole: (userId: number, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  
  deleteUser: (userId: number) =>
    api.delete(`/admin/users/${userId}`),
  
  updateProjectStatus: (projectId: number, status: string) =>
    api.patch(`/admin/projects/${projectId}/status`, { status }),
  
  updateProject: (projectId: number, project: Partial<Project>) =>
    api.put(`/admin/projects/${projectId}`, project),
  
  deleteProject: (projectId: number) =>
    api.delete(`/admin/projects/${projectId}`),
  
  createProject: (project: Omit<Project, 'id'>) =>
    api.post('/admin/projects', project),
  
  approveSubscription: (orderId: string) =>
    api.post(`/admin/subscriptions/${orderId}/approve`),
  
  rejectSubscription: (orderId: string) =>
    api.post(`/admin/subscriptions/${orderId}/reject`),
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

// Earnings API
export const earningsAPI = {
  getEarningsSummary: () =>
    api.get<any>('/api/earnings/summary'),
  
  getProjectEarningsBreakdown: () =>
    api.get<any[]>('/api/earnings/project-breakdown'),
  
  getEarningsByPeriod: (period: 'month' | 'quarter' | 'year') =>
    api.get<any>(`/api/earnings/period/${period}`),
};

export default api; 