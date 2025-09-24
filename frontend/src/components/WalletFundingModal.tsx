import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield, Lock, Users, Award, CheckCircle, CreditCard, Wallet, Tag,
  ArrowRight, ArrowLeft, Zap, Star, Phone, Mail, MessageCircle,
  Share2, TrendingUp, DollarSign, Clock, XCircle, Volume2, VolumeX
} from 'lucide-react';
import { couponAPI, walletAPI } from '../services/api';
import { Coupon } from '../types';
import toast from 'react-hot-toast';

interface WalletFundingModalProps {
  onClose: () => void;
  currentBalance: number;
  onWalletUpdate?: (amount: number) => void;
}

type Step = 'details' | 'payment' | 'success';

const WalletFundingModal: React.FC<WalletFundingModalProps> = ({ onClose, currentBalance, onWalletUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [amount, setAmount] = useState<number>(1000);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [transactionId, setTransactionId] = useState('');

  const originalAmount = amount;
  const discountAmount = appliedCoupon ? appliedCoupon.discountValue : 0;
  const finalAmount = originalAmount - discountAmount;
  const [actualPaidAmount, setActualPaidAmount] = useState<number>(0);
  const [updatedBalance, setUpdatedBalance] = useState<number>(currentBalance);

  // Trust building statistics
  const trustStats = {
    totalUsers: '10,000+',
    totalTransactions: '₹50+ Crores',
    successRate: '99.9%',
    trustScore: '4.9/5'
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await couponAPI.validateCoupon(couponCode, originalAmount);
      if (response.data.valid) {
        const coupon: Coupon = {
          id: 0,
          code: couponCode.toUpperCase(),
          discountType: response.data.discount > originalAmount * 0.1 ? 'PERCENTAGE' : 'FIXED',
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

  const handlePayment = async () => {
    // Validate payment details based on method
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        toast.error('Please enter UPI ID');
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        toast.error('Please select a bank');
        return;
      }
    }

    setLoading(true);
    try {
      // Step 1: Create payment order with backend
      console.log(`Creating payment order for ₹${finalAmount}`);
      const orderResponse = await walletAPI.addFunds({ amount: finalAmount });
      
      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create payment order');
      }
      
      const orderId = orderResponse.data.orderId;
      console.log(`Payment order created: ${orderId}`);
      
      // Step 2: Simulate payment processing (in real app, this would be handled by payment gateway)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 3: Process the payment with backend
      console.log(`Processing payment for order: ${orderId}`);
      const paymentResponse = await walletAPI.processAddFundsPayment(orderId);
      
      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || 'Payment processing failed');
      }
      
      // Set transaction ID from the actual order
      setTransactionId(orderId);
      
             // Update wallet balance with actual amount from backend
       const actualAmount = paymentResponse.data.amount;
       console.log(`Payment successful: ₹${actualAmount} added to wallet`);
       
       // Store the actual amount paid for display in success step
       setActualPaidAmount(actualAmount);
       
       // Update the local balance for display
       setUpdatedBalance(currentBalance + actualAmount);
       
       // Notify parent component about wallet update
       if (onWalletUpdate) {
         onWalletUpdate(actualAmount);
       }
      
      setCurrentStep('success');
      toast.success('Payment successful! Funds added to your wallet.');
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
        <p className="text-gray-600">Enter the amount you want to add to your wallet</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Amount to Add (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="100"
          max="100000"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          placeholder="Enter amount"
        />
      </div>

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

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount to Add:</span>
            <span className="font-medium">₹{originalAmount.toLocaleString()}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({appliedCoupon.code}):</span>
              <span>-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Final Amount:</span>
            <span className="font-bold text-lg text-green-600">₹{finalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

             <div className="flex justify-end">
        <button
          onClick={() => setCurrentStep('payment')}
          disabled={amount < 100 || amount > 100000}
          className="bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment</h2>
        <p className="text-gray-600">Choose your preferred payment method</p>
      </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <button
           onClick={() => setPaymentMethod('card')}
           className={`p-4 border-2 rounded-xl transition-colors ${
             paymentMethod === 'card' 
               ? 'border-green-500 bg-green-50' 
               : 'border-gray-200 hover:border-gray-300'
           }`}
         >
           <CreditCard className="h-8 w-8 text-gray-600 mx-auto mb-2" />
           <div className="text-center">
             <div className="font-medium text-gray-900">Credit/Debit Card</div>
             <div className="text-sm text-gray-600">Visa, MasterCard, RuPay</div>
           </div>
         </button>
         <button
           onClick={() => setPaymentMethod('upi')}
           className={`p-4 border-2 rounded-xl transition-colors ${
             paymentMethod === 'upi' 
               ? 'border-green-500 bg-green-50' 
               : 'border-gray-200 hover:border-gray-300'
           }`}
         >
           <Zap className="h-8 w-8 text-gray-600 mx-auto mb-2" />
           <div className="text-center">
             <div className="font-medium text-gray-900">UPI</div>
             <div className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</div>
           </div>
         </button>
         <button
           onClick={() => setPaymentMethod('netbanking')}
           className={`p-4 border-2 rounded-xl transition-colors ${
             paymentMethod === 'netbanking' 
               ? 'border-green-500 bg-green-50' 
               : 'border-gray-200 hover:border-gray-300'
           }`}
         >
           <Shield className="h-8 w-8 text-gray-600 mx-auto mb-2" />
           <div className="text-center">
             <div className="font-medium text-gray-900">Net Banking</div>
             <div className="text-sm text-gray-600">All major banks</div>
           </div>
         </button>
       </div>

       {/* Payment Method Specific Forms */}
       {paymentMethod === 'card' && (
         <div className="space-y-4">
           <h4 className="font-semibold text-gray-900">Card Details</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
               <input
                 type="text"
                 value={cardDetails.number}
                 onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                 placeholder="1234 5678 9012 3456"
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                 maxLength={19}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
               <input
                 type="text"
                 value={cardDetails.name}
                 onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                 placeholder="John Doe"
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
               <input
                 type="text"
                 value={cardDetails.expiry}
                 onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                 placeholder="MM/YY"
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                 maxLength={5}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
               <input
                 type="text"
                 value={cardDetails.cvv}
                 onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                 placeholder="123"
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                 maxLength={4}
               />
             </div>
           </div>
         </div>
       )}

       {paymentMethod === 'upi' && (
         <div className="space-y-4">
           <h4 className="font-semibold text-gray-900">UPI Payment</h4>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
             <input
               type="text"
               value={upiId}
               onChange={(e) => setUpiId(e.target.value)}
               placeholder="username@upi"
               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
             />
             <p className="text-sm text-gray-600 mt-1">Enter your UPI ID (e.g., john@okicici)</p>
           </div>
         </div>
       )}

       {paymentMethod === 'netbanking' && (
         <div className="space-y-4">
           <h4 className="font-semibold text-gray-900">Net Banking</h4>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
             <select
               value={selectedBank}
               onChange={(e) => setSelectedBank(e.target.value)}
               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
             >
               <option value="">Select your bank</option>
               <option value="sbi">State Bank of India</option>
               <option value="hdfc">HDFC Bank</option>
               <option value="icici">ICICI Bank</option>
               <option value="axis">Axis Bank</option>
               <option value="kotak">Kotak Mahindra Bank</option>
               <option value="yes">Yes Bank</option>
               <option value="pnb">Punjab National Bank</option>
               <option value="canara">Canara Bank</option>
               <option value="union">Union Bank of India</option>
               <option value="bankofbaroda">Bank of Baroda</option>
             </select>
           </div>
         </div>
       )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">Secure Payment</h4>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('details')}
          className="bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Pay ₹{finalAmount.toLocaleString()}</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Your wallet has been updated successfully</p>
      </div>

             <div className="bg-green-50 border border-green-200 rounded-xl p-6">
         <h3 className="font-semibold text-green-800 mb-4">Transaction Details</h3>
         <div className="space-y-3">
           <div className="flex justify-between">
             <span className="text-green-700">Order ID:</span>
             <span className="font-mono text-green-800">{transactionId}</span>
           </div>
                       <div className="flex justify-between">
              <span className="text-green-700">Amount Added:</span>
              <span className="font-semibold text-green-800">₹{actualPaidAmount.toLocaleString()}</span>
            </div>
           <div className="flex justify-between">
             <span className="text-green-700">Payment Method:</span>
             <span className="text-green-800 capitalize">{paymentMethod}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-green-700">Date & Time:</span>
             <span className="text-green-800">{new Date().toLocaleString()}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-green-700">Status:</span>
             <span className="text-green-800 font-semibold">Payment Successful</span>
           </div>
         </div>
       </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Wallet className="h-6 w-6 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Updated Wallet Balance</h3>
        </div>
                          <div className="text-2xl font-bold text-blue-900">
            ₹{updatedBalance.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700">
            Previous balance: ₹{currentBalance.toLocaleString()} + Added: ₹{actualPaidAmount.toLocaleString()}
          </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/app/wallet')}
          className="bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Go to Wallet
        </button>
        <button
          onClick={onClose}
          className="bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <Wallet className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Funds to Wallet</h2>
                             <p className="text-sm text-gray-600">
                 {currentStep === 'details' && 'Payment Details'}
                 {currentStep === 'payment' && 'Secure Payment'}
                 {currentStep === 'success' && 'Payment Successful'}
               </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

                 <div className="px-6 py-4 border-b border-gray-100">
           <div className="flex items-center space-x-2">
             {['details', 'payment', 'success'].map((step, index) => (
               <React.Fragment key={step}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   index <= ['details', 'payment', 'success'].indexOf(currentStep)
                     ? 'bg-green-600 text-white'
                     : 'bg-gray-200 text-gray-600'
                 }`}>
                   {index + 1}
                 </div>
                 {index < 2 && (
                   <div className={`flex-1 h-1 rounded ${
                     index < ['details', 'payment', 'success'].indexOf(currentStep)
                       ? 'bg-green-600'
                       : 'bg-gray-200'
                   }`} />
                 )}
               </React.Fragment>
             ))}
           </div>
         </div>

                 <div className="p-6">
           {currentStep === 'details' && renderDetailsStep()}
           {currentStep === 'payment' && renderPaymentStep()}
           {currentStep === 'success' && renderSuccessStep()}
         </div>
      </div>
    </div>
  );
};

export default WalletFundingModal;
