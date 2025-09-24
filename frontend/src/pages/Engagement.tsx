import React, { useState, useEffect } from 'react';
import { engagementAPI, projectsAPI, walletAPI, couponAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { EngagementTransaction, EngagementStats, Project, Coupon } from '../types';
import WalletFundingModal from '../components/WalletFundingModal';
import { 
  TrendingUp, 
  Heart, 
  Gift, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MapPin,
  AlertCircle,
  Zap,
  Sparkles,
  Target,
  XCircle,
  CheckCircle
} from 'lucide-react';

const Engagement: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<EngagementTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showReinvestModal, setShowReinvestModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  
  // Form states
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  
  // Wallet and coupon states
  const [walletBalance, setWalletBalance] = useState(0);
  const [showWalletFundingModal, setShowWalletFundingModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  
  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchEngagementData();
    }
  }, [user]);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      const [statsData, projectsData, historyData, walletData] = await Promise.all([
        engagementAPI.getEngagementStats(),
        projectsAPI.getActiveProjects(),
        engagementAPI.getEngagementHistory(),
        walletAPI.getWallet()
      ]);
      
      setStats(statsData.data);
      setProjects(projectsData.data);
      setHistory(historyData.data);
      setWalletBalance(walletData.data.balance || 0);
    } catch (error: any) {
      console.error('Error fetching engagement data:', error);
      toast.error('Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletAPI.getWallet();
      setWalletBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await couponAPI.validateCoupon(couponCode, parseFloat(amount || '0'));
      if (response.data.valid) {
        setAppliedCoupon({
          id: 0,
          code: couponCode,
          name: couponCode,
          description: 'Applied coupon',
          discountValue: response.data.discount,
          discountType: 'FIXED',
          minAmount: 0,
          maxDiscount: response.data.discount,
          maxUsage: 1,
          currentUsage: 0,
          validFrom: new Date().toISOString(),
          validUntil: new Date().toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success(`Coupon applied! ₹${response.data.discount.toLocaleString()} discount`);
      } else {
        toast.error(response.data.message || 'Invalid or expired coupon code');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const resetFormStates = () => {
    setSelectedProject('');
    setAmount('');
    setRecipientEmail('');
    setCouponCode('');
    setAppliedCoupon(null);
  };

  const handleReinvest = async () => {
    if (!selectedProject || !amount || parseFloat(amount) <= 0) {
      toast.error('Please select a project and enter a valid amount');
      return;
    }

    try {
      const response = await engagementAPI.reinvest({
        projectId: selectedProject as number,
        amount: parseFloat(amount)
      });
      
      // Find the project name
      const project = projects.find(p => p.id === selectedProject);
      
      // Set success data and show success modal
      setSuccessData({
        type: 'reinvest',
        projectName: project?.name || 'Selected Project',
        amount: parseFloat(amount),
        newBalance: response.data?.newBalance || stats?.availableCredits
      });
      setShowSuccessModal(true);
      
      // Close the reinvest modal
      setShowReinvestModal(false);
      setSelectedProject('');
      setAmount('');
      fetchEngagementData();
    } catch (error: any) {
      console.error('Error reinvesting:', error);
      toast.error(error.response?.data || 'Failed to reinvest');
    }
  };

  const handleDonate = async () => {
    if (!selectedProject || !amount || parseFloat(amount) <= 0) {
      toast.error('Please select a project and enter a valid amount');
      return;
    }

    try {
      const response = await engagementAPI.donate({
        projectId: selectedProject as number,
        amount: parseFloat(amount)
      });
      
      // Find the project name
      const project = projects.find(p => p.id === selectedProject);
      
      // Set success data and show success modal
      setSuccessData({
        type: 'donate',
        projectName: project?.name || 'Selected Project',
        amount: parseFloat(amount),
        newBalance: response.data?.newBalance || stats?.availableCredits
      });
      setShowSuccessModal(true);
      
      // Close the donate modal
      setShowDonateModal(false);
      setSelectedProject('');
      setAmount('');
      fetchEngagementData();
    } catch (error: any) {
      console.error('Error donating:', error);
      toast.error(error.response?.data || 'Failed to donate');
    }
  };

  const handleGift = async () => {
    // Check KYC status
    if (!user || user.kycStatus !== 'APPROVED') {
      toast.error('KYC approval required for sending gifts. Please complete your KYC verification first.');
      return;
    }

    if (!recipientEmail || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter recipient email and a valid amount');
      return;
    }

    try {
      const response = await engagementAPI.gift({
        recipientEmail,
        amount: parseFloat(amount)
      });
      
      // Set success data and show success modal
      setSuccessData({
        type: 'gift',
        recipientEmail: recipientEmail,
        amount: parseFloat(amount),
        newBalance: response.data?.newBalance || stats?.availableCredits
      });
      setShowSuccessModal(true);
      
      // Close the gift modal
      setShowGiftModal(false);
      setRecipientEmail('');
      setAmount('');
      fetchEngagementData();
    } catch (error: any) {
      console.error('Error sending gift:', error);
      toast.error(error.response?.data || 'Failed to send gift');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'REINVEST':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'DONATE':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'GIFT':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'GIFT_RECEIVED':
        return <Gift className="h-5 w-5 text-green-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'REINVEST': return 'Reinvestment';
      case 'DONATE': return 'Donation';
      case 'GIFT': return 'Gift';
      default: return type;
    }
  };

  // Helper function to get the correct transaction label
  const getTransactionLabel = (transaction: EngagementTransaction) => {
    if (transaction.type === 'GIFT') {
      return transaction.direction === 'INCOMING' ? 'Gift Received' : 'Gift Sent';
    }
    return getTransactionTypeLabel(transaction.type);
  };

  // Helper function to get the correct amount display
  const getAmountDisplay = (transaction: EngagementTransaction) => {
    if (transaction.type === 'GIFT') {
      if (transaction.direction === 'INCOMING') {
        return { sign: '+', color: 'text-green-600' };
      } else {
        return { sign: '-', color: 'text-red-600' };
      }
    }
    return { sign: '-', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view engagement data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Engagement Center</h1>
        <p className="text-gray-600 max-w-2xl">
          Reinvest your earnings, donate to solar projects, and gift credits to other users. 
          Make a positive impact on renewable energy while growing your portfolio.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reinvested</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats?.totalReinvested?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-xl">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Donated</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats?.totalDonated?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gifted</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats?.totalGifted?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats?.totalReceived?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Status Alert */}
      {user && user.kycStatus !== 'APPROVED' && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-yellow-800">
                KYC Verification Required
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {user.kycStatus === 'PENDING' 
                  ? 'Your KYC is under review. You can reinvest and donate, but gifts are disabled until approved.'
                  : 'Please complete your KYC verification to enable sending gifts.'
                }
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Action Buttons */}
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h2>
          <p className="text-gray-600">Choose how you want to engage with solar energy projects</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setShowReinvestModal(true)}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Reinvest</h3>
              <p className="text-blue-100 text-sm">Grow your portfolio by reinvesting earnings into new projects</p>
            </div>
          </button>

          <button
            onClick={() => setShowDonateModal(true)}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-700 p-6 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Heart className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Donate</h3>
              <p className="text-red-100 text-sm">Support solar energy projects and make a positive impact</p>
            </div>
          </button>

          <button
            onClick={() => setShowGiftModal(true)}
            disabled={!user || user.kycStatus !== 'APPROVED'}
            className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform ${
              user && user.kycStatus === 'APPROVED'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-105 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              user && user.kycStatus === 'APPROVED' ? 'bg-gradient-to-r from-purple-400/20 to-transparent' : ''
            }`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-xl ${
                  user && user.kycStatus === 'APPROVED' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  <Gift className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Gift Credits</h3>
              <p className={`text-sm ${
                user && user.kycStatus === 'APPROVED' ? 'text-purple-100' : 'text-gray-400'
              }`}>
                {user && user.kycStatus === 'APPROVED' 
                  ? 'Share your success by gifting credits to other users'
                  : 'KYC approval required for sending gifts'
                }
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Engagement History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Engagement History</h2>
            <p className="text-gray-600">Track all your engagement activities</p>
          </div>
          <div className="p-2 bg-primary-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-600" />
          </div>
        </div>
        
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-primary-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-50 transition-colors duration-300">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {getTransactionLabel(transaction)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.project && `${transaction.project.name} • `}
                        {new Date(transaction.date).toLocaleDateString()} • {new Date(transaction.date).toLocaleTimeString()}
                      </p>
                      {transaction.notes && transaction.type !== 'GIFT' && (
                        <p className="text-xs text-gray-600 mt-1">{transaction.notes}</p>
                      )}
                      {transaction.type === 'GIFT' && transaction.direction === 'OUTGOING' && (
                        <p className="text-xs text-blue-600 mt-1">To: {transaction.toUser?.email}</p>
                      )}
                      {transaction.type === 'GIFT' && transaction.direction === 'INCOMING' && (
                        <p className="text-xs text-green-600 mt-1">From: {transaction.fromUser?.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      getAmountDisplay(transaction).color
                    }`}>
                      {getAmountDisplay(transaction).sign}₹{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No engagement history yet</h3>
            <p className="text-gray-600">
              Start engaging with solar projects to see your activity here.
            </p>
          </div>
        )}
      </div>

      {/* Reinvest Modal */}
      {showReinvestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reinvest in Project</h2>
                  <p className="text-sm text-gray-600">Grow your portfolio by reinvesting earnings</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReinvestModal(false);
                  resetFormStates();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Project Summary */}
              {selectedProject && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Project Summary</h4>
                  <div className="space-y-2">
                    {(() => {
                      const project = projects.find(p => p.id === selectedProject);
                      return project ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Project:</span>
                            <span className="font-medium">{project.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{project.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="font-medium">{project.energyCapacity} MW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Efficiency:</span>
                            <span className="font-medium">{(project.efficiency || 'MEDIUM').toUpperCase()}</span>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Wallet Balance */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Available Balance</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Wallet Balance:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{walletBalance.toLocaleString()}</span>
                </div>
                {walletBalance < parseFloat(amount || '0') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">Insufficient balance for this transaction</p>
                    <button
                      onClick={() => setShowWalletFundingModal(true)}
                      className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Add Funds
                    </button>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Apply Coupon (Optional)</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Coupon Applied: {appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">Discount: ₹{appliedCoupon.discountValue.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount to reinvest"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available balance: ₹{walletBalance.toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleReinvest}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Reinvest Now
                </button>
                <button
                  onClick={() => {
                    setShowReinvestModal(false);
                    resetFormStates();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
              <div className="flex items-center space-x-4">
                <Heart className="h-8 w-8 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Donate to Project</h2>
                  <p className="text-sm text-gray-600">Support solar energy projects and make a difference</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDonateModal(false);
                  resetFormStates();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Project Summary */}
              {selectedProject && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Project Summary</h4>
                  <div className="space-y-2">
                    {(() => {
                      const project = projects.find(p => p.id === selectedProject);
                      return project ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Project:</span>
                            <span className="font-medium">{project.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{project.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="font-medium">{project.energyCapacity} MW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Efficiency:</span>
                            <span className="font-medium">{(project.efficiency || 'MEDIUM').toUpperCase()}</span>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Wallet Balance */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Available Balance</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Wallet Balance:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{walletBalance.toLocaleString()}</span>
                </div>
                {walletBalance < parseFloat(amount || '0') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">Insufficient balance for this transaction</p>
                    <button
                      onClick={() => setShowWalletFundingModal(true)}
                      className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Add Funds
                    </button>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Apply Coupon (Optional)</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Coupon Applied: {appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">Discount: ₹{appliedCoupon.discountValue.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter amount to donate"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available balance: ₹{walletBalance.toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleDonate}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Donate Now
                </button>
                <button
                  onClick={() => {
                    setShowDonateModal(false);
                    resetFormStates();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <Gift className="h-8 w-8 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gift Credits</h2>
                  <p className="text-sm text-gray-600">Share your success with other users</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGiftModal(false);
                  resetFormStates();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Wallet Balance */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Available Balance</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Wallet Balance:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{walletBalance.toLocaleString()}</span>
                </div>
                {walletBalance < parseFloat(amount || '0') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">Insufficient balance for this transaction</p>
                    <button
                      onClick={() => setShowWalletFundingModal(true)}
                      className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Add Funds
                    </button>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Apply Coupon (Optional)</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Coupon Applied: {appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">Discount: ₹{appliedCoupon.discountValue.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipient Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter recipient email"
                />
                <p className="text-xs text-gray-500 mt-2">
                  The recipient must have an account on SunYield
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter amount to gift"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available balance: ₹{walletBalance.toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleGift}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Send Gift
                </button>
                <button
                  onClick={() => {
                    setShowGiftModal(false);
                    resetFormStates();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                successData.type === 'reinvest' ? 'bg-blue-100' :
                successData.type === 'donate' ? 'bg-red-100' :
                'bg-purple-100'
              }`}>
                <CheckCircle className={`h-8 w-8 ${
                  successData.type === 'reinvest' ? 'text-blue-600' :
                  successData.type === 'donate' ? 'text-red-600' :
                  'text-purple-600'
                }`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {successData.type === 'reinvest' && 'Successfully Reinvested!'}
                {successData.type === 'donate' && 'Donation Successful!'}
                {successData.type === 'gift' && 'Gift Sent Successfully!'}
              </h3>
              <p className="text-gray-600">Your transaction has been processed successfully</p>
            </div>
            
            <div className={`rounded-xl p-4 mb-6 ${
              successData.type === 'reinvest' ? 'bg-blue-50' :
              successData.type === 'donate' ? 'bg-red-50' :
              'bg-purple-50'
            }`}>
              <div className="space-y-2">
                {successData.type === 'reinvest' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-semibold text-gray-900">{successData.projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Reinvested:</span>
                      <span className="font-semibold text-green-600">₹{successData.amount.toLocaleString()}</span>
                    </div>
                  </>
                )}
                {successData.type === 'donate' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-semibold text-gray-900">{successData.projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Donated:</span>
                      <span className="font-semibold text-green-600">₹{successData.amount.toLocaleString()}</span>
                    </div>
                  </>
                )}
                {successData.type === 'gift' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient:</span>
                      <span className="font-semibold text-gray-900">{successData.recipientEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Gifted:</span>
                      <span className="font-semibold text-green-600">₹{successData.amount.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">New Wallet Balance:</span>
                  <span className="font-semibold text-gray-900">₹{successData.newBalance?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSuccessData(null);
                }}
                className={`flex-1 text-white py-3 px-6 rounded-xl font-semibold transition-colors ${
                  successData.type === 'reinvest' ? 'bg-blue-600 hover:bg-blue-700' :
                  successData.type === 'donate' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Funding Modal */}
      {showWalletFundingModal && (
        <WalletFundingModal
          onClose={() => setShowWalletFundingModal(false)}
          currentBalance={walletBalance}
          onWalletUpdate={(newBalance) => {
            setWalletBalance(newBalance);
            setShowWalletFundingModal(false);
            toast.success('Wallet funded successfully!');
          }}
        />
      )}
    </div>
  );
};

export default Engagement; 