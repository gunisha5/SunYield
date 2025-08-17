import React, { useState, useEffect } from 'react';
import { walletAPI, withdrawalAPI } from '../services/api';
import { Wallet as WalletType, WithdrawalResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Upload,
  Plus,
  Minus,
  Calendar,
  Clock,
  AlertCircle,
  Wallet as WalletIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [withdrawalCapInfo, setWithdrawalCapInfo] = useState<{
    monthlyCap: number;
    totalWithdrawnThisMonth: number;
    remainingAmount: number;
    currentMonth: string;
  } | null>(null);

  useEffect(() => {
    fetchWalletData();
    
    // Auto-refresh wallet data every 30 seconds
    const interval = setInterval(() => {
      fetchWalletData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]); // Add user as dependency

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const timestamp = Date.now();
      const [walletData, historyData] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getWalletHistory()
      ]);
      
      setWallet(walletData.data);
      setWalletHistory(historyData.data);
      
      // Fetch withdrawal cap info
      try {
        const capResponse = await withdrawalAPI.getWithdrawalCapInfo();
        setWithdrawalCapInfo(capResponse.data);
      } catch (error) {
        console.error('Error fetching withdrawal cap info:', error);
      }
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load wallet data: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      console.log('[DEBUG] Creating payment order for amount:', amount);
      const response = await walletAPI.addFunds({ amount: parseFloat(amount) });
      
      if (response.data.success) {
        console.log('[DEBUG] Payment order created:', response.data);
        // Redirect to payment page
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error(response.data.message || 'Failed to create payment order');
      }
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to create payment order: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleWithdraw = async () => {
    // Check KYC status
    if (!user || user.kycStatus !== 'APPROVED') {
      toast.error('KYC approval required for withdrawals. Please complete your KYC verification first.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (wallet && parseFloat(amount) > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    // Check withdrawal cap
    if (withdrawalCapInfo && parseFloat(amount) > withdrawalCapInfo.remainingAmount) {
      toast.error(`Withdrawal amount exceeds monthly limit. Remaining: ₹${withdrawalCapInfo.remainingAmount.toLocaleString()}`);
      return;
    }

    try {
      console.log('[DEBUG] Requesting withdrawal for amount:', amount);
      
      // Use the withdrawal API with proper data
      const response = await withdrawalAPI.requestWithdrawal({
        amount: parseFloat(amount),
        payoutMethod: payoutMethod,
        upiId: upiId || user.email + '@upi'
      });

      if (response.data.success) {
        toast.success('Withdrawal processed successfully! Amount: ₹' + response.data.amount);
        setShowWithdraw(false);
        setAmount('');
        setPayoutMethod('UPI');
        setUpiId('');
        fetchWalletData();
      } else {
        toast.error('Withdrawal failed: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to submit withdrawal request: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div key={user?.id} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600">Manage your solar investment balance and transactions</p>
        <p className="text-sm text-gray-500 mt-1">Current User: {user?.email} (ID: {user?.id})</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <WalletIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{wallet?.balance?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{wallet?.totalEarnings?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>



        <div className="card bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{wallet?.totalInvested?.toLocaleString() || '0'}
              </p>
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
                  ? 'Your KYC is under review. You can add funds but withdrawals are disabled until approved.'
                  : 'Please complete your KYC verification to enable withdrawals and gifts.'
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
          <p className="text-gray-600">Add funds or withdraw your earnings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowAddFunds(true)}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-green-700 p-4 text-white hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Funds
            </div>
          </button>
          
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={!user || user.kycStatus !== 'APPROVED'}
            className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform ${
              user && user.kycStatus === 'APPROVED' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              user && user.kycStatus === 'APPROVED' ? 'bg-gradient-to-r from-blue-400/20 to-transparent' : ''
            }`}></div>
            <div className="relative z-10 flex items-center justify-center">
              <Minus className="h-5 w-5 mr-2" />
              Withdraw
              {user && user.kycStatus !== 'APPROVED' && (
                <span className="ml-2 text-xs">(KYC Required)</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Wallet History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-gray-600">Track all your wallet activities</p>
          </div>
          <div className="p-2 bg-primary-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-600" />
          </div>
        </div>
        
        {walletHistory.length > 0 ? (
          <div className="space-y-4">
            {walletHistory.map((transaction, index) => (
              <div 
                key={`${transaction.id}-${transaction.direction}-${index}`} 
                className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-primary-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg transition-colors duration-300 ${
                      transaction.direction === 'INCOMING' 
                        ? 'bg-green-100 group-hover:bg-green-50' 
                        : 'bg-red-100 group-hover:bg-red-50'
                    }`}>
                      {transaction.direction === 'INCOMING' ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {transaction.transactionType === 'ADD_FUNDS' && 'Funds Added'}
                        {transaction.transactionType === 'ADMIN_CREDIT' && 'Admin Credit'}
                        {transaction.transactionType === 'WITHDRAWAL' && 'Withdrawal'}
                        {transaction.transactionType === 'SUBSCRIPTION' && 'Project Investment'}
                        {transaction.transactionType === 'ENERGY_REWARD' && 'Energy Reward'}
                        {transaction.transactionType === 'INVESTMENT' && 'Investment'}
                        {transaction.transactionType === 'REINVEST' && 'Reinvestment'}
                        {transaction.transactionType === 'DONATE' && 'Donation'}
                        {transaction.transactionType === 'GIFT' && (transaction.direction === 'INCOMING' ? 'Gift Received' : 'Gift Sent')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.project && `${transaction.project} • `}
                        {new Date(transaction.date).toLocaleDateString()} • {new Date(transaction.date).toLocaleTimeString()}
                      </p>
                      {transaction.notes && (
                        <p className="text-xs text-gray-600 mt-1">{transaction.notes}</p>
                      )}
                      {transaction.kwh && (
                        <p className="text-xs text-blue-600 mt-1">{transaction.kwh} kWh generated</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.direction === 'INCOMING' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.direction === 'INCOMING' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </p>
                    {transaction.status && (
                      <p className={`text-xs ${
                        transaction.status === 'SUCCESS' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {transaction.status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <WalletIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transaction history yet</h3>
            <p className="text-gray-600">
              Start using your wallet to see your transaction history here.
            </p>
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
            <div className="text-center mb-6">
              <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add Funds</h3>
              <p className="text-gray-600">Add money to your wallet to invest in solar projects</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  className="form-input w-full"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddFunds}
                  className="btn-primary flex-1"
                >
                  Add Funds
                </button>
                <button
                  onClick={() => {
                    setShowAddFunds(false);
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

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
            <div className="text-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Minus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
              <p className="text-gray-600">Withdraw your earnings to your bank account</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  className="form-input w-full"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available balance: ₹{wallet?.balance?.toLocaleString() || '0'}
                </p>
                
                {/* Real-time amount validation */}
                {amount && withdrawalCapInfo && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>₹{parseFloat(amount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining after withdrawal:</span>
                      <span className={`font-medium ${(withdrawalCapInfo.remainingAmount - parseFloat(amount || '0')) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{(withdrawalCapInfo.remainingAmount - parseFloat(amount || '0')).toLocaleString()}
                      </span>
                    </div>
                    {(withdrawalCapInfo.remainingAmount - parseFloat(amount || '0')) < 0 && (
                      <p className="text-red-600 font-medium mt-1">
                        ⚠️ This will exceed your monthly limit
                      </p>
                    )}
                  </div>
                )}
                
                {/* Withdrawal Cap Information */}
                {withdrawalCapInfo && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      Monthly Withdrawal Limit ({withdrawalCapInfo.currentMonth})
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Cap:</span>
                        <span className="font-medium">₹{withdrawalCapInfo.monthlyCap.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Already Withdrawn:</span>
                        <span className="font-medium">₹{withdrawalCapInfo.totalWithdrawnThisMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-1">
                        <span className="text-gray-700 font-medium">Remaining:</span>
                        <span className={`font-bold ${withdrawalCapInfo.remainingAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{withdrawalCapInfo.remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {withdrawalCapInfo.remainingAmount <= 0 && (
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        ⚠️ Monthly withdrawal limit reached
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payout Method</label>
                <select
                  className="form-input w-full"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                >
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              
              {payoutMethod === 'UPI' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID</label>
                  <input
                    type="text"
                    className="form-input w-full"
                    placeholder="Enter your UPI ID (e.g., user@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format: username@bank (e.g., john@okicici)
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleWithdraw}
                  className="btn-primary flex-1"
                >
                  Withdraw
                </button>
                <button
                  onClick={() => {
                    setShowWithdraw(false);
                    setAmount('');
                    setPayoutMethod('UPI');
                    setUpiId('');
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

export default Wallet; 