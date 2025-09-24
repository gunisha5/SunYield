import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  Wallet, 
  Tag, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  Star,
  Users,
  Award,
  XCircle
} from 'lucide-react';
import { Project, Coupon } from '../types';
import { couponAPI, walletAPI, subscriptionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import WalletFundingModal from './WalletFundingModal';

interface SubscriptionPopupProps {
  project: Project;
  onClose: () => void;
}

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({ project, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showWalletFundingModal, setShowWalletFundingModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [showDuplicateSubscriptionModal, setShowDuplicateSubscriptionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const minContribution = project.minContribution || project.subscriptionPrice || 999;
  const originalPrice = contributionAmount || minContribution;

  // Initialize contribution amount with minimum contribution
  useEffect(() => {
    setContributionAmount(minContribution);
  }, [minContribution]);

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', showDuplicateSubscriptionModal);
  }, [showDuplicateSubscriptionModal]);

  const fetchWalletBalance = async () => {
    try {
      const response = await walletAPI.getWallet();
      setWalletBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      toast.error('Failed to fetch wallet balance');
    }
  };
  const discountAmount = appliedCoupon ? appliedCoupon.discountValue : 0;
  const finalPrice = originalPrice - discountAmount;

  // Fetch real wallet balance from API
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await walletAPI.getWallet();
        setWalletBalance(response.data.balance || 0);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        toast.error('Failed to fetch wallet balance');
      }
    };

    fetchWalletBalance();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);

    try {
      const response = await couponAPI.validateCoupon(couponCode, originalPrice);

      if (response.data.valid) {
        const coupon: Coupon = {
          id: 0,
          code: couponCode.toUpperCase(),
          discountType: response.data.discount > originalPrice * 0.1 ? 'PERCENTAGE' : 'FIXED',
          discountValue: response.data.discount,
          isActive: true,
          name: 'Applied Coupon',
          description: 'Applied Coupon',
          currentUsage: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setAppliedCoupon(coupon);
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

  const handleSubscribe = async () => {
    if (loading) {
      return; // Prevent double-clicks
    }
    
    if (finalPrice > walletBalance) {
      toast.error('Insufficient wallet balance. Please add funds to your wallet.');
      return;
    }

    // Test the modal - uncomment this line to test the modal
    // setShowDuplicateSubscriptionModal(true); return;

    setLoading(true);

    try {
      // Test the request body parsing first
      console.log('[DEBUG] Testing subscription request...');
      try {
        const testResponse = await subscriptionsAPI.testSubscription(project.id, contributionAmount, appliedCoupon?.code);
        console.log('[DEBUG] Test response:', testResponse.data);
      } catch (testError) {
        console.error('[DEBUG] Test error:', testError);
      }
      
      // Test the authenticated endpoint
      console.log('[DEBUG] Testing authenticated subscription request...');
      try {
        const testAuthResponse = await subscriptionsAPI.testSubscriptionWithAuth(project.id, contributionAmount, appliedCoupon?.code);
        console.log('[DEBUG] Test auth response:', testAuthResponse.data);
      } catch (testAuthError) {
        console.error('[DEBUG] Test auth error:', testAuthError);
      }
      
      // Call the actual subscription API with contribution amount and coupon code if applied
      const response = await subscriptionsAPI.subscribeToProject(project.id, contributionAmount, appliedCoupon?.code);
      
      if (response.data.success) {
        // Update the wallet balance with the new balance from API
        setWalletBalance(response.data.newBalance);
        
        // Set success data and show success modal
        setSuccessData({
          projectName: response.data.projectName,
          amount: response.data.amount,
          originalAmount: response.data.originalAmount,
          discountAmount: response.data.discountAmount,
          newBalance: response.data.newBalance
        });
        setShowSuccessModal(true);
      } else {
        // Check if it's a duplicate subscription error in the response
        const errorMessage = typeof response.data === 'string' ? response.data : response.data.message || '';
        if (errorMessage.toLowerCase().includes('already subscribed') || 
          errorMessage.toLowerCase().includes('already have an active subscription') ||
          errorMessage.toLowerCase().includes('already subscribed to this project')) {
          setShowDuplicateSubscriptionModal(true);
        } else {
          toast.error(errorMessage || 'Failed to subscribe. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      
      // Check if it's a duplicate subscription error
      const errorData = error.response?.data;
      const errorMessage = typeof errorData === 'string' ? errorData : errorData?.message || '';
      console.log('Error message:', errorMessage);
      
      if (errorMessage.toLowerCase().includes('already subscribed') || 
        errorMessage.toLowerCase().includes('already have an active subscription') ||
        errorMessage.toLowerCase().includes('already subscribed to this project')) {
        console.log('Showing duplicate subscription modal');
        setShowDuplicateSubscriptionModal(true);
      } else {
        toast.error(errorMessage || 'Failed to subscribe. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = () => {
    setShowWalletFundingModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <Zap className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Invest in {project.name}</h2>
              <p className="text-sm text-gray-600">Complete your Solar Capital investment using wallet balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Investment Summary</h4>
            <div className="space-y-2">
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
              <div className="flex justify-between">
                <span className="text-gray-600">Validity:</span>
                <span className={`font-medium ${(project.operationalValidityYear || 2025) < new Date().getFullYear() ? 'text-red-600' : ''}`}>
                  {project.operationalValidityYear || 2025}
                  {(project.operationalValidityYear || 2025) < new Date().getFullYear() && ' (Expired)'}
                </span>
              </div>
              {project.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium text-sm">{project.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-800">Wallet Balance</h4>
                <p className="text-sm text-blue-700">₹{walletBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Contribution Amount */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Investment Amount</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Amount (Minimum: ₹{minContribution.toLocaleString()})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(Number(e.target.value))}
                    min={minContribution}
                    step="100"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={`Minimum ₹${minContribution.toLocaleString()}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You can invest more than the minimum to increase your Green Credits earning potential
                </p>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Apply Coupon (Optional)</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {couponLoading ? 'Applying...' : 'Apply'}
              </button>
            </div>
            
            {appliedCoupon && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      {appliedCoupon.code} - Coupon Applied Successfully
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Billing Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Your Contribution:</span>
                <span className="font-medium">₹{originalPrice.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Amount to Deduct:</span>
                <span className="font-bold text-lg text-green-600">₹{finalPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="text-gray-600">Remaining Balance:</span>
                <span className={`font-medium ${walletBalance - finalPrice >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(walletBalance - finalPrice).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {finalPrice > walletBalance && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">Insufficient Balance</h4>
                  <p className="text-sm text-red-700">
                    You need ₹{(finalPrice - walletBalance).toLocaleString()} more in your wallet to complete this subscription.
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={handleAddFunds}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Add Funds to Wallet
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubscribe}
              disabled={loading || finalPrice > walletBalance}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Invest ₹{finalPrice.toLocaleString()}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Why Trust SunYield?</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">SEC Registered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Verified Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">10,000+ Investors</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Secure Wallet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallet Funding Modal */}
      {/* Duplicate Subscription Modal */}
      {showDuplicateSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Already Subscribed!
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              You have already subscribed to <span className="font-semibold text-green-600">{project.name}</span>. 
              To invest more in this project, please visit the <span className="font-semibold text-blue-600">Engagement</span> page 
              and use the reinvestment feature.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDuplicateSubscriptionModal(false);
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDuplicateSubscriptionModal(false);
                  onClose();
                  navigate('/app/engagement');
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Go to Engagement
              </button>
            </div>
          </div>
        </div>
      )}

      {showWalletFundingModal && (
        <WalletFundingModal
          onClose={() => {
            setShowWalletFundingModal(false);
            // Refresh wallet balance after funding
            fetchWalletBalance();
          }}
          currentBalance={walletBalance}
          onWalletUpdate={(amount) => {
            // Update local wallet balance immediately for better UX
            setWalletBalance(prev => prev + amount);
            // Don't refresh from server to avoid modal reset
            // Server refresh will happen when modal closes
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Successfully Contributed!</h3>
              <p className="text-gray-600">Your investment has been processed successfully</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project:</span>
                  <span className="font-semibold text-gray-900">{successData.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Invested:</span>
                  <span className="font-semibold text-green-600">₹{successData.amount.toLocaleString()}</span>
                </div>
                {successData.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Applied:</span>
                    <span className="font-semibold text-green-600">₹{successData.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">New Wallet Balance:</span>
                  <span className="font-semibold text-gray-900">₹{successData.newBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                  navigate('/app/dashboard');
                }}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPopup;
