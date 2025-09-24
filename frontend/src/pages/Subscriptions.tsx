import React, { useState, useEffect } from 'react';
import { subscriptionsAPI, engagementAPI } from '../services/api';
import { Subscription, EngagementTransaction } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Zap,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';

const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reinvestments, setReinvestments] = useState<EngagementTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, [user]); // Add user as dependency

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const [subscriptionsResponse, engagementResponse] = await Promise.all([
        subscriptionsAPI.getSubscriptionHistory(),
        engagementAPI.getEngagementHistory()
      ]);
      
      setSubscriptions(subscriptionsResponse.data);
      // Filter only reinvestment transactions
      const reinvestmentData = engagementResponse.data.filter(
        (transaction: EngagementTransaction) => transaction.type === 'REINVEST'
      );
      setReinvestments(reinvestmentData);
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

  // Calculate total investment including reinvestments for a project
  const getTotalInvestment = (projectId: number) => {
    const subscription = subscriptions.find(s => s.project?.id === projectId);
    const projectReinvestments = reinvestments.filter(r => r.project?.id === projectId);
    
    const initialInvestment = subscription?.contributionAmount || 0;
    const reinvestmentTotal = projectReinvestments.reduce((sum, r) => sum + r.amount, 0);
    
    return initialInvestment + reinvestmentTotal;
  };

  // Get reinvestment logs for a specific project
  const getProjectReinvestments = (projectId: number) => {
    return reinvestments.filter(r => r.project?.id === projectId);
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
                  .reduce((sum, s) => sum + getTotalInvestment(s.project?.id || 0), 0)
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{subscription.project?.location || 'Location not available'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Zap className="h-4 w-4 mr-2" />
                        <span>{subscription.project?.energyCapacity || 0} MW</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <IndianRupee className="h-4 w-4 mr-2" />
                        <span>₹{getTotalInvestment(subscription.project?.id || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className={`${(subscription.project?.operationalValidityYear || 2025) < new Date().getFullYear() ? 'text-red-600 font-semibold' : ''}`}>
                          Validity: {subscription.project?.operationalValidityYear || 2025}
                          {(subscription.project?.operationalValidityYear || 2025) < new Date().getFullYear() && ' (Expired)'}
                        </span>
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
                      ₹{getTotalInvestment(subscription.project?.id || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Total Investment</p>
                    {getProjectReinvestments(subscription.project?.id || 0).length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        +{getProjectReinvestments(subscription.project?.id || 0).length} reinvestment(s)
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Reinvestment Logs */}
                {getProjectReinvestments(subscription.project?.id || 0).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                      Reinvestment History
                    </h5>
                    <div className="space-y-2">
                      {getProjectReinvestments(subscription.project?.id || 0).map((reinvestment, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-gray-600">
                              Reinvested on {new Date(reinvestment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="font-semibold text-blue-600">
                            +₹{reinvestment.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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