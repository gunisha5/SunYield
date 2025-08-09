import React, { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';
import { Wallet as WalletType } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Upload,
  Plus,
  Minus,
  Calendar,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
    
    // Auto-refresh wallet data every 30 seconds
    const interval = setInterval(() => {
      fetchWalletData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, historyData] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getWalletHistory()
      ]);
      
      setWallet(walletData.data);
      setWalletHistory(historyData.data);
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
      await walletAPI.addFunds({ amount: parseFloat(amount) });
      toast.success('Funds added successfully!');
      setShowAddFunds(false);
      setAmount('');
      fetchWalletData();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (wallet && parseFloat(amount) > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      console.log('[DEBUG] Requesting withdrawal for amount:', amount);
      const response = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      if (response.ok) {
        toast.success('Withdrawal processed successfully!');
        setShowWithdraw(false);
        setAmount('');
        fetchWalletData();
      } else {
        const error = await response.text();
        toast.error('Failed to submit withdrawal request: ' + error);
      }
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to submit withdrawal request: ' + (error.response?.data || error.message));
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600">Manage your funds and transactions</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{wallet?.balance?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{wallet?.totalEarnings?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Invested</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{wallet?.totalInvested?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setShowAddFunds(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Funds
        </button>
        <button
          onClick={() => setShowWithdraw(true)}
          className="btn-secondary flex items-center"
        >
          <Minus className="h-5 w-5 mr-2" />
          Withdraw
        </button>
      </div>

      {/* Wallet History */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h3>
        {walletHistory.length > 0 ? (
          <div className="space-y-3">
            {walletHistory.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.direction === 'INCOMING' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
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
                  <p className={`text-sm font-semibold ${
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
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No transaction history</p>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Funds</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="add-amount" className="form-label">
                  Amount (₹)
                </label>
                <input
                  id="add-amount"
                  type="number"
                  className="input-field"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Withdraw Funds</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="withdraw-amount" className="form-label">
                  Amount (₹)
                </label>
                <input
                  id="withdraw-amount"
                  type="number"
                  className="input-field"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available balance: ₹{wallet?.balance?.toLocaleString() || '0'}
                </p>
              </div>
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