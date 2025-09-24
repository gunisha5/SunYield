import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield, Lock, Users, Award, CheckCircle, CreditCard, Wallet, Tag,
  ArrowRight, ArrowLeft, Zap, Star, Phone, Mail, MessageCircle,
  Share2, TrendingUp, DollarSign, Clock, XCircle, Volume2, VolumeX,
  AlertCircle, Info
} from 'lucide-react';
import { withdrawalAPI } from '../services/api';
import toast from 'react-hot-toast';

interface WalletWithdrawalModalProps {
  onClose: () => void;
  currentBalance: number;
  onWalletUpdate?: (amount: number) => void;
}

type Step = 'details' | 'verification' | 'success';

const WalletWithdrawalModal: React.FC<WalletWithdrawalModalProps> = ({ onClose, currentBalance, onWalletUpdate }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [amount, setAmount] = useState<number>(1000);
  const [payoutMethod, setPayoutMethod] = useState<'UPI'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [transactionId, setTransactionId] = useState('');
  const [withdrawalCapInfo, setWithdrawalCapInfo] = useState<{
    monthlyCap: number;
    totalWithdrawnThisMonth: number;
    remainingAmount: number;
    currentMonth: string;
  } | null>(null);
  const [isWithdrawalCompleted, setIsWithdrawalCompleted] = useState(false);
  const completionRef = useRef(false);

  // Real-time validation states
  const [validationErrors, setValidationErrors] = useState<{
    amount: string;
    upiId: string;
    general: string;
  }>({
    amount: '',
    upiId: '',
    general: ''
  });

  // Trust building statistics
  const trustStats = {
    totalUsers: '10,000+',
    totalTransactions: '₹50+ Crores',
    successRate: '99.9%',
    trustScore: '4.9/5'
  };

  // Fetch withdrawal cap info when component mounts
  React.useEffect(() => {
    if (isWithdrawalCompleted || completionRef.current) return; // Don't fetch again after withdrawal is completed
    
    const fetchWithdrawalCapInfo = async () => {
      try {
        const response = await withdrawalAPI.getWithdrawalCapInfo();
        setWithdrawalCapInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch withdrawal cap info:', error);
      }
    };
    fetchWithdrawalCapInfo();
  }, [isWithdrawalCompleted]);

  // Debug step changes
  useEffect(() => {
    console.log('Step changed to:', currentStep);
    
    // Prevent step from changing back to details after success
    if ((isWithdrawalCompleted || completionRef.current) && currentStep === 'details') {
      console.log('Preventing step reset after withdrawal completion');
      setCurrentStep('success');
    }
  }, [currentStep, isWithdrawalCompleted]);

  // Prevent modal from being affected by external state changes after withdrawal completion
  useEffect(() => {
    if (isWithdrawalCompleted || completionRef.current) {
      console.log('Withdrawal completed, preventing external state changes from affecting modal');
      
      // Force success step if somehow we're not on it
      if (currentStep !== 'success') {
        console.log('Forcing success step after completion');
        setCurrentStep('success');
      }
    }
  }, [isWithdrawalCompleted, currentStep]);

  // Real-time validation
  useEffect(() => {
    const errors = {
      amount: '',
      upiId: '',
      general: ''
    };

    // Amount validation
    if (amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else if (amount < 100) {
      errors.amount = 'Minimum withdrawal amount is ₹100';
    } else if (amount > currentBalance) {
      errors.amount = 'Insufficient wallet balance';
    } else if (withdrawalCapInfo && amount > withdrawalCapInfo.remainingAmount) {
      errors.amount = `Monthly withdrawal limit exceeded. You can withdraw up to ₹${withdrawalCapInfo.remainingAmount.toLocaleString()} this month.`;
    }

    // UPI ID validation
    if (!upiId.trim()) {
      errors.upiId = 'UPI ID is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upiId)) {
      errors.upiId = 'Please enter a valid UPI ID (e.g., username@bank)';
    }

    setValidationErrors(errors);
  }, [amount, upiId, currentBalance, withdrawalCapInfo]);

  // Check if form is valid
  const isFormValid = () => {
    return !validationErrors.amount && 
           !validationErrors.upiId && 
           !validationErrors.general &&
           amount >= 100 &&
           amount <= currentBalance &&
           (!withdrawalCapInfo || amount <= withdrawalCapInfo.remainingAmount) &&
           upiId.trim().length > 0;
  };

  const handleWithdrawal = async () => {
    if (!isFormValid()) {
      toast.error('Please fix the validation errors before proceeding');
      return;
    }

    setLoading(true);
    try {
      // Create withdrawal request
      const withdrawalData = {
        amount: amount,
        payoutMethod: payoutMethod,
        upiId: upiId
      };

      console.log('Submitting withdrawal with data:', withdrawalData);
      const response = await withdrawalAPI.requestWithdrawal(withdrawalData);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check multiple success conditions
      const isSuccess = response.data.success || 
                       response.data.status === 'SUCCESS' || 
                       response.data.orderId || 
                       response.status === 200 || 
                       response.status === 201;
      
      console.log('Is success?', isSuccess);
      
      if (isSuccess) {
        console.log('Withdrawal successful, setting step to success');
        setTransactionId(response.data.orderId || (response.data as any).id || 'N/A');
        setIsWithdrawalCompleted(true);
        completionRef.current = true;
        setCurrentStep('success');
        toast.success('Withdrawal request submitted successfully!');
        
        // Notify parent component about wallet update
        if (onWalletUpdate) {
          onWalletUpdate(-amount); // Negative amount for withdrawal
        }
      } else {
        console.log('API returned success: false');
        throw new Error(response.data.message || 'Failed to create withdrawal request');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.response?.data?.message || error.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Progress flowchart component
  const ProgressFlowchart = () => (
    <div className="mb-6">
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${currentStep === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'details' ? 'border-blue-600 bg-blue-100' : 'border-gray-300 bg-gray-100'
          }`}>
            <span className="text-sm font-semibold">1</span>
          </div>
          <span className="text-sm font-medium">Details</span>
        </div>
        
        <ArrowRight className={`w-5 h-5 ${currentStep === 'success' ? 'text-green-500' : 'text-gray-300'}`} />
        
        <div className={`flex items-center space-x-2 ${currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'success' ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-gray-100'
          }`}>
            {currentStep === 'success' ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-semibold">2</span>}
          </div>
          <span className="text-sm font-medium">Success</span>
        </div>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <ProgressFlowchart />
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Details</h2>
        <p className="text-gray-600">Enter the amount you want to withdraw from your wallet</p>
      </div>

      {/* Current Balance Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">Available Balance</span>
          <span className="text-lg font-bold text-blue-900">₹{currentBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Withdrawal Cap Info */}
      {withdrawalCapInfo && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-700">Monthly Withdrawal Cap</span>
              <span className="text-sm font-bold text-yellow-900">₹{withdrawalCapInfo.monthlyCap.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700">Already Withdrawn This Month</span>
              <span className="text-sm font-bold text-yellow-900">₹{withdrawalCapInfo.totalWithdrawnThisMonth.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700">Remaining This Month</span>
              <span className="text-sm font-bold text-yellow-900">₹{withdrawalCapInfo.remainingAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Amount to Withdraw (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="100"
          max={Math.min(currentBalance, withdrawalCapInfo?.remainingAmount || currentBalance)}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
            validationErrors.amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter amount"
        />
        {validationErrors.amount && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{validationErrors.amount}</span>
          </div>
        )}
        <p className="text-xs text-gray-500">
          Min: ₹100 | Max: ₹{Math.min(currentBalance, withdrawalCapInfo?.remainingAmount || currentBalance).toLocaleString()}
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Payout Method</h4>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">UPI Transfer</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">Fast and secure UPI transfers to your UPI ID</p>
        </div>
      </div>

      {/* UPI Details */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">UPI ID</label>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="example@upi"
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors.upiId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
          }`}
        />
        {validationErrors.upiId && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{validationErrors.upiId}</span>
          </div>
        )}
        <p className="text-xs text-gray-500">Enter your UPI ID (e.g., username@bank)</p>
      </div>

      {/* Trust Building Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="h-5 w-5 text-green-600" />
          <h4 className="font-semibold text-green-800">Why Trust SunYield?</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-green-700">{trustStats.totalUsers} Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-green-700">{trustStats.totalTransactions}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">{trustStats.successRate} Success</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-green-600" />
            <span className="text-green-700">{trustStats.trustScore} Rating</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleWithdrawal}
          disabled={loading || !isFormValid()}
          className={`flex-1 px-6 py-3 rounded-xl text-white transition-all duration-200 font-semibold ${
            isFormValid() && !loading
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Processing...' : 'Submit Withdrawal'}
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <ProgressFlowchart />
      
      <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">🎉 Withdrawal Request Submitted!</h2>
        <p className="text-gray-600 text-lg">Your withdrawal request has been submitted successfully and is being processed.</p>
      </div>

      {/* Enhanced Transaction Details */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-green-800 text-lg flex items-center justify-center space-x-2">
          <Info className="h-5 w-5" />
          <span>Withdrawal Details</span>
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
            <span className="text-gray-600 font-medium">Amount Withdrawn:</span>
            <span className="font-bold text-xl text-green-800">₹{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
            <span className="text-gray-600 font-medium">Payout Method:</span>
            <span className="font-semibold text-green-800">UPI Transfer</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
            <span className="text-gray-600 font-medium">UPI ID:</span>
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded border">{upiId}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
            <span className="text-gray-600 font-medium">Order ID:</span>
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded border">{transactionId}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
            <span className="text-gray-600 font-medium">Submission Time:</span>
            <span className="font-semibold text-green-800">{new Date().toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-800 mb-3 text-lg">What happens next?</h4>
        <ul className="text-sm text-blue-700 space-y-2 text-left">
          <li className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Your request will be reviewed within 24-48 hours</span>
          </li>
          <li className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <span>You'll receive an email confirmation</span>
          </li>
          <li className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span>Funds will be transferred to your UPI ID: {upiId}</span>
          </li>
          <li className="flex items-center space-x-2">
            <Wallet className="h-4 w-4 text-blue-600" />
            <span>You can track the status in your wallet history</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onClose}
        className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold text-lg"
      >
        🎯 Close & Continue
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Withdraw Funds</h1>
              <p className="text-sm text-gray-600">Withdraw your earnings to your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <XCircle className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>

        {/* Sound Toggle */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletWithdrawalModal;
