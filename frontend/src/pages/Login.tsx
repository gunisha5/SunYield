import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { LoginRequest } from '../types';
import { Eye, EyeOff, Mail, Lock, Zap, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      await loginWithCredentials(data.email, data.password);
      navigate('/app/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Zap className="h-8 w-8 text-white" />
          </div>
          
          {/* Title */}
          <h2 className="mt-8 text-center text-4xl font-black text-gray-900 gradient-text">
            Welcome Back
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            Sign in to your Solar Capital account
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-green-600 hover:text-green-700 transition-colors duration-300">
              Create one here
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`form-input ${
                  errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`form-input pr-12 ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all duration-300"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-semibold text-green-600 hover:text-green-700 transition-colors duration-300">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Email Verification Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Haven't verified your email?{' '}
              <Link to="/verify-otp" className="font-semibold text-green-600 hover:text-green-700 transition-colors duration-300">
                Verify here
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Sign In to Solar Capital'
              )}
            </button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-green-600 hover:text-green-700 transition-colors duration-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-600 hover:text-green-700 transition-colors duration-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 