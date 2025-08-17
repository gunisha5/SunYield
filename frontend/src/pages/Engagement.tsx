import React, { useState, useEffect } from 'react';
import { engagementAPI, projectsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { EngagementTransaction, EngagementStats, Project } from '../types';
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
  Target
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

  useEffect(() => {
    if (user) {
      fetchEngagementData();
    }
  }, [user]);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      const [statsData, projectsData, historyData] = await Promise.all([
        engagementAPI.getEngagementStats(),
        projectsAPI.getActiveProjects(),
        engagementAPI.getEngagementHistory()
      ]);
      
      setStats(statsData.data);
      setProjects(projectsData.data);
      setHistory(historyData.data);
    } catch (error: any) {
      console.error('Error fetching engagement data:', error);
      toast.error('Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  };

  const handleReinvest = async () => {
    if (!selectedProject || !amount || parseFloat(amount) <= 0) {
      toast.error('Please select a project and enter a valid amount');
      return;
    }

    try {
      await engagementAPI.reinvest({
        projectId: selectedProject as number,
        amount: parseFloat(amount)
      });
      toast.success('Reinvestment successful!');
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
      await engagementAPI.donate({
        projectId: selectedProject as number,
        amount: parseFloat(amount)
      });
      toast.success('Donation successful!');
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
      await engagementAPI.gift({
        recipientEmail,
        amount: parseFloat(amount)
      });
      toast.success('Gift sent successfully!');
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Engagement Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
            <div className="text-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reinvest in Project</h3>
              <p className="text-gray-600">Grow your portfolio by reinvesting earnings</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(Number(e.target.value))}
                  className="form-input w-full"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available credits: ₹{stats?.availableCredits?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleReinvest}
                  className="btn-primary flex-1"
                >
                  Reinvest
                </button>
                <button
                  onClick={() => {
                    setShowReinvestModal(false);
                    setSelectedProject('');
                    setAmount('');
                  }}
                  className="btn-secondary flex-1"
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
            <div className="text-center mb-6">
              <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Donate to Project</h3>
              <p className="text-gray-600">Support solar energy projects and make a difference</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(Number(e.target.value))}
                  className="form-input w-full"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available credits: ₹{stats?.availableCredits?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDonate}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  Donate
                </button>
                <button
                  onClick={() => {
                    setShowDonateModal(false);
                    setSelectedProject('');
                    setAmount('');
                  }}
                  className="btn-secondary flex-1"
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
            <div className="text-center mb-6">
              <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Gift Credits</h3>
              <p className="text-gray-600">Share your success with other users</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter recipient email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available credits: ₹{stats?.availableCredits?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleGift}
                  className="btn-primary flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Send Gift
                </button>
                <button
                  onClick={() => {
                    setShowGiftModal(false);
                    setRecipientEmail('');
                    setAmount('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Engagement; 