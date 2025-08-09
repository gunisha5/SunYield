export interface User {
  id: number;
  email: string;
  fullName: string;
  contact: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerified: boolean;
  role: 'USER' | 'ADMIN';
}

export interface Project {
  id: number;
  name: string;
  location: string;
  energyCapacity: number;
  subscriptionPrice: number;
  status: 'ACTIVE' | 'PAUSED';
}

export interface Subscription {
  id: number;
  user: User;
  project: Project;
  paymentOrderId: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  subscribedAt: string;
}

export interface Wallet {
  id: number;
  user: User;
  balance: number;
  totalEarnings: number;
  totalInvested: number;
}

export interface WithdrawalRequest {
  id: number;
  user: User;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
}

export interface EnergyData {
  id: number;
  project: Project;
  energyProduced: number;
  date: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  contact: string;
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

export interface SubscriptionRequest {
  projectId: number;
}

export interface WithdrawalRequestData {
  amount: number;
}

export interface KYCData {
  id: number;
  user: User;
  documentType: string;
  documentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface EngagementTransaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  notes?: string;
  direction?: 'INCOMING' | 'OUTGOING';
  project?: {
    name: string;
  };
  fromUser?: {
    email: string;
    fullName: string;
  };
  toUser?: {
    email: string;
    fullName: string;
  };
}

export interface EngagementStats {
  totalReinvested: number;
  totalDonated: number;
  totalGifted: number;
  totalReceived: number;
  availableCredits: number;
  totalTransactions: number;
} 