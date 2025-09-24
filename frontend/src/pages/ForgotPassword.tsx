import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle, Zap } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset OTP sent to your email');
      setStep('verify');
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.verifyForgotPasswordOtp(email, otp);
      setOtpVerified(true);
      setStep('reset');
      toast.success('OTP verified successfully! Now set your new password.');
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    setPasswordError('');
    setLoading(true);
    
    try {
      await authAPI.resetPassword(email, otp, newPassword, confirmPassword);
      toast.success('Password reset successful! You can now login with your new password');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  const getStepTitle = () => {
    switch (step) {
      case 'request':
        return 'Forgot Password';
      case 'verify':
        return 'Verify OTP';
      case 'reset':
        return 'Reset Password';
      default:
        return 'Forgot Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'request':
        return 'Enter your email to receive a password reset code';
      case 'verify':
        return 'Enter the 6-digit code sent to your email';
      case 'reset':
        return 'Set your new password';
      default:
        return 'Enter your email to receive a password reset code';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {getStepTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getStepDescription()}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'request' ? 'text-green-600' : step === 'verify' || step === 'reset' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'request' ? 'bg-green-600 text-white' : step === 'verify' || step === 'reset' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Request</span>
          </div>
          <div className={`w-8 h-0.5 ${step === 'verify' || step === 'reset' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step === 'verify' ? 'text-green-600' : step === 'reset' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'verify' ? 'bg-green-600 text-white' : step === 'reset' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Verify</span>
          </div>
          <div className={`w-8 h-0.5 ${step === 'reset' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step === 'reset' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'reset' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Reset</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Sending Reset Code...
                  </div>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  We've sent a verification code to <strong className="text-green-600">{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest font-semibold"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
              >
                ← Back to email
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  OTP verified! Now set your new password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      passwordError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      passwordError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('verify')}
                className="w-full text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
              >
                ← Back to OTP verification
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center w-full text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
