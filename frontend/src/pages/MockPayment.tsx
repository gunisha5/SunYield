import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentData {
  orderId: string;
  amount: number;
  projectName?: string;
  userEmail: string;
  paymentType: 'subscription' | 'wallet';
}

const MockPayment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState('');

  useEffect(() => {
    // Get payment data from URL params or state
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    const amount = params.get('amount');
    const projectName = params.get('projectName');
    const userEmail = params.get('userEmail');
    const paymentType = params.get('paymentType') as 'subscription' | 'wallet' || 'subscription';

    if (orderId && amount && userEmail) {
      setPaymentData({
        orderId,
        amount: parseFloat(amount),
        projectName: projectName || undefined,
        userEmail,
        paymentType
      });
    } else {
      toast.error('Invalid payment data');
      navigate('/projects');
    }
  }, [location, navigate]);

  const handlePayment = async () => {
    if (!paymentData) return;

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Determine payment success based on payment details
      let isSuccess = true;
      
      // Check for failure conditions
      if (paymentMethod === 'card' && cardNumber) {
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.endsWith('0000')) {
          isSuccess = false; // Force failure for cards ending in 0000
        }
      }

      if (paymentData.paymentType === 'wallet') {
        // Handle wallet payment
        if (isSuccess) {
          // Process the payment to add funds to wallet
          const response = await fetch(`http://localhost:8080/api/wallet/add-funds/process-payment?orderId=${paymentData.orderId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            toast.success('Payment successful! Funds have been added to your wallet.');
            navigate('/app/wallet');
          } else {
            const error = await response.text();
            toast.error('Failed to add funds to wallet: ' + error);
            navigate('/app/wallet');
          }
        } else {
          toast.error('Payment failed. Please try again.');
          navigate('/app/wallet');
        }
      } else {
        // Handle subscription payment
        const response = await fetch(`http://localhost:8080/api/subscriptions/webhook?orderId=${paymentData.orderId}&status=${isSuccess ? 'SUCCESS' : 'FAILED'}`);
        
        if (response.ok) {
          if (isSuccess) {
            toast.success('Payment successful! You are now subscribed to the project.');
            navigate('/app/dashboard');
          } else {
            toast.error('Payment failed. Please try again.');
            navigate('/projects');
          }
        } else {
          toast.error('Failed to process payment status');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (!paymentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {paymentData.paymentType === 'wallet' ? 'Add Funds to Wallet' : 'Project Subscription'}
          </h1>
          <p className="text-gray-600">Simulated Cashfree Payment Interface</p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Order Details */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{paymentData.orderId}</span>
              </div>
              {paymentData.projectName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Project:</span>
                  <span className="font-medium">{paymentData.projectName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{paymentData.paymentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg text-primary-600">₹{paymentData.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="mr-2"
                />
                Credit/Debit Card
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="mr-2"
                />
                UPI
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="netbanking"
                  checked={paymentMethod === 'netbanking'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="mr-2"
                />
                Net Banking
              </label>
            </div>
          </div>

          {/* Payment Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="user@upi"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Lock className="h-4 w-4 mr-2" />
            <span>This is a secure mock payment gateway</span>
          </div>

          {/* Payment Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Pay Now
                </>
              )}
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={() => navigate(paymentData.paymentType === 'wallet' ? '/app/wallet' : '/projects')}
            className="w-full mt-3 text-gray-600 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Cancel Payment
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            This is a mock payment interface for testing purposes only.
            <br />
            No real payments will be processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockPayment; 