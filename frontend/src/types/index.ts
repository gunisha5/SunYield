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
  subscriptionPrice: number; // Legacy field
  minContribution: number; // New Solar Capital field
  efficiency: 'HIGH' | 'MEDIUM' | 'LOW'; // New Solar Capital field
  operationalValidityYear: number; // Operational validity year for the project
  description?: string; // New Solar Capital field
  status: 'ACTIVE' | 'PAUSED';
  imageUrl?: string;
  // Updated for Solar Capital migration - v2
}

export interface Subscription {
  id: number;
  user: User;
  project: Project;
  paymentOrderId: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  subscribedAt: string;
  contributionAmount: number; // Actual amount user contributed
  reservedCapacity: number; // Capacity reserved based on contribution
  subscriptionType: 'FIXED' | 'FLEXIBLE'; // Subscription type
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
  payoutMethod?: string;
  upiId?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  message: string;
  orderId?: string;
  amount?: number;
  status?: string;
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  maxUsage?: number;
  currentUsage: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
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
    id: number;
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

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalSubscriptions: number;
  totalRevenue: number;
  pendingKycRequests: number;
  pendingWithdrawals: number;
}

export interface CreditTransferLog {
  id: number;
  fromUser?: User;
  toUser?: User;
  project?: Project;
  amount: number;
  type: string;
  date: string;
  notes?: string;
}

export interface KYC {
  id: number;
  user: User;
  documentType: string;
  documentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
} 