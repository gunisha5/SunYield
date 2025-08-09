import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI, projectsAPI, subscriptionsAPI } from '../services/api';
import { Project, Subscription, Wallet as WalletType } from '../types';
import { 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [walletData, projectsData, subscriptionsData] = await Promise.all([
          walletAPI.getWallet(),
          projectsAPI.getActiveProjects(),
          subscriptionsAPI.getSubscriptionHistory(),
        ]);

        setWallet(walletData.data);
        setProjects(projectsData.data);
        setSubscriptions(subscriptionsData.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      name: 'Total Balance',
      value: `₹${wallet?.balance?.toLocaleString() || '0'}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      name: 'Total Earnings',
      value: `₹${wallet?.totalEarnings?.toLocaleString() || '0'}`,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      name: 'Active Projects',
      value: projects.length.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: Zap,
    },
    {
      name: 'Total Invested',
      value: `₹${wallet?.totalInvested?.toLocaleString() || '0'}`,
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Users,
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.fullName || user?.email}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex items-center">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`ml-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Subscriptions</h3>
          {subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.slice(0, 5).map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.project.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{subscription.project.subscriptionPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.paymentStatus === 'SUCCESS'
                          ? 'bg-green-100 text-green-800'
                          : subscription.paymentStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {subscription.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No subscriptions yet</p>
          )}
        </div>

        {/* Active Projects */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Projects</h3>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₹{project.subscriptionPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.energyCapacity} MW
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No active projects</p>
          )}
        </div>
      </div>


    </div>
  );
};

export default Dashboard; 