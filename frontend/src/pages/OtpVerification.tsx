import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';
import { OtpVerificationRequest } from '../types';
import { Mail, ArrowLeft, Zap, Shield } from 'lucide-react';

const OtpVerification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state or URL params
  const email = location.state?.email || new URLSearchParams(location.search).get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpVerificationRequest>();

  const onSubmit = async (data: OtpVerificationRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyOtp(data);
      
      if (response.data) {
        toast.success('Email verified successfully! You can now log in.');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }

    try {
      setIsResending(true);
      const response = await authAPI.resendOtp(email);
      
      if (response.data) {
        toast.success('New OTP sent to your email!');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22grain%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22%3E%3Ccircle cx=%2225%22 cy=%2225%22 r=%221%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3Ccircle cx=%2275%22 cy=%2275%22 r=%221%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3Ccircle cx=%2250%22 cy=%2210%22 r=%220.5%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3Ccircle cx=%2210%22 cy=%2260%22 r=%220.5%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3Ccircle cx=%2290%22 cy=%2240%22 r=%220.5%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23grain)%22/%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-black text-gray-900 gradient-text">
              Email Not Found
            </h2>
            <p className="mt-4 text-center text-lg text-gray-600">
              Please register again to receive an OTP.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22grain%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22%3E%3Ccircle cx=%2225%22 cy=%2225%22 r=%221%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3Ccircle cx=%2275%22 cy=%2275%22 r=%221%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3Ccircle cx=%2250%22 cy=%2210%22 r=%220.5%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3Ccircle cx=%2210%22 cy=%2260%22 r=%220.5%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3Ccircle cx=%2290%22 cy=%2240%22 r=%220.5%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23grain)%22/%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-all duration-300 transform hover:scale-105"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Home</span>
      </button>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
            <Mail className="h-8 w-8 text-white" />
          </div>
          
          {/* Title */}
          <h2 className="mt-8 text-center text-4xl font-black text-gray-900 gradient-text">
            Verify Your Email
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            We've sent a verification code to
          </p>
          <p className="mt-2 text-center text-lg font-semibold text-green-600">
            {email}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* OTP Field */}
            <div className="form-group">
              <label htmlFor="otp" className="form-label">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                autoComplete="one-time-code"
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'Please enter a valid 6-digit OTP',
                  },
                })}
                className={`form-input ${
                  errors.otp ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                }`}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.otp.message}
                </p>
              )}
            </div>

            {/* Hidden email field */}
            <input type="hidden" {...register('email')} value={email} />

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>

          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="font-semibold text-green-600 hover:text-green-700 transition-colors duration-300 disabled:opacity-50"
                >
                  {isResending ? 'Resending...' : 'Resend OTP'}
                </button>
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-300 flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification; 