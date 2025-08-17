import React, { useState, useEffect } from 'react';
import { subscriptionsAPI } from '../services/api';
import { Subscription } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Zap,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, [user]); // Add user as dependency

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getSubscriptionHistory();
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
        <p className="text-gray-600">Track all your solar project investments and their performance</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{subscriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(s => s.paymentStatus === 'SUCCESS').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(s => s.paymentStatus === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Invested</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{subscriptions
                  .filter(s => s.paymentStatus === 'SUCCESS')
                  .reduce((sum, s) => sum + (s.project?.subscriptionPrice || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Subscription History</h3>
        
        {subscriptions.length > 0 ? (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(subscription.paymentStatus)}
                      <h4 className="text-lg font-semibold text-gray-900">
                        {subscription.project?.name || 'Unknown Project'}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.paymentStatus)}`}>
                        {subscription.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{subscription.project?.location || 'Location not available'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Zap className="h-4 w-4 mr-2" />
                        <span>{subscription.project?.energyCapacity || 0} MW</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>₹{subscription.project?.subscriptionPrice?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Subscribed on {subscription.subscribedAt ? new Date(subscription.subscribedAt).toLocaleDateString() : 'Date not available'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{subscription.project?.subscriptionPrice?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500">Investment Amount</p>
                  </div>
                </div>
                
                {subscription.paymentOrderId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Order ID: <span className="font-mono">{subscription.paymentOrderId}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
            <p className="text-gray-600">
              Start investing in solar projects to see your subscription history here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions; 