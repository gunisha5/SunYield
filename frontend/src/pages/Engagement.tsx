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
  MapPin
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading engagement data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view engagement data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Engagement Center</h1>
          <p className="mt-2 text-gray-600">
            Reinvest, donate, and gift to support solar energy projects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reinvested</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats?.totalReinvested?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donated</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats?.totalDonated?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gifted</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats?.totalGifted?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Received</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats?.totalReceived?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowReinvestModal(true)}
              className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Reinvest
            </button>
            <button
              onClick={() => setShowDonateModal(true)}
              className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <Heart className="h-5 w-5 mr-2" />
              Donate
            </button>
            <button
              onClick={() => setShowGiftModal(true)}
              className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <Gift className="h-5 w-5 mr-2" />
              Gift Credits
            </button>
          </div>
        </div>

        {/* Engagement History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Engagement History</h2>
          </div>
          <div className="p-6">
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((transaction) => {
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
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
                        <p className={`text-sm font-semibold ${
                          getAmountDisplay(transaction).color
                        }`}>
                          {getAmountDisplay(transaction).sign}₹{transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No engagement history yet</p>
            )}
          </div>
        </div>

        {/* Reinvest Modal */}
        {showReinvestModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reinvest in Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(Number(e.target.value))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available credits: ₹{stats?.availableCredits?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleReinvest}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Reinvest
                  </button>
                  <button
                    onClick={() => {
                      setShowReinvestModal(false);
                      setSelectedProject('');
                      setAmount('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Donate to Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(Number(e.target.value))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available credits: ₹{stats?.availableCredits?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDonate}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                  >
                    Donate
                  </button>
                  <button
                    onClick={() => {
                      setShowDonateModal(false);
                      setSelectedProject('');
                      setAmount('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gift Credits</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter recipient email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available credits: ₹{stats?.availableCredits?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleGift}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                  >
                    Send Gift
                  </button>
                  <button
                    onClick={() => {
                      setShowGiftModal(false);
                      setRecipientEmail('');
                      setAmount('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Engagement; 