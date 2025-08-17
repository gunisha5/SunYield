import React, { useState, useEffect } from 'react';
import { earningsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EarningsSummary {
  totalInvestment: number;
  totalEarnings: number;
  monthlyIncome: number;
  recoveryPercentage: number;
  annualizedReturn: number;
  totalSubscriptions: number;
  totalRewards: number;
}

interface ProjectEarnings {
  projectId: number;
  projectName: string;
  projectLocation: string;
  energyCapacity: number;
  investmentAmount: number;
  totalEarnings: number;
  recoveryPercentage: number;
  monthlyEarnings: number;
  totalKwh: number;
  subscriptionDate: string;
}

const Earnings: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [projectEarnings, setProjectEarnings] = useState<ProjectEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [periodEarnings, setPeriodEarnings] = useState<number>(0);

  useEffect(() => {
    fetchEarningsData();
  }, [user]); // Add user as dependency

  useEffect(() => {
    fetchPeriodEarnings();
  }, [selectedPeriod]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, breakdownResponse] = await Promise.all([
        earningsAPI.getEarningsSummary(),
        earningsAPI.getProjectEarningsBreakdown()
      ]);
      
      setSummary(summaryResponse.data);
      setProjectEarnings(breakdownResponse.data);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodEarnings = async () => {
    try {
      const response = await earningsAPI.getEarningsByPeriod(selectedPeriod);
      setPeriodEarnings(response.data.earnings);
    } catch (error) {
      console.error('Error fetching period earnings:', error);
      setPeriodEarnings(0);
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
        <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
        <p className="text-gray-600">Track your profits and see which projects are performing best</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Investment</p>
              <p className="text-2xl font-semibold text-gray-900">₹{summary?.totalInvestment?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">₹{summary?.totalEarnings?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Income</p>
              <p className="text-2xl font-semibold text-green-600">₹{summary?.monthlyIncome?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recovery %</p>
              <p className="text-2xl font-semibold text-green-600">{summary?.recoveryPercentage?.toFixed(1) || '0'}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Earnings by Period</h3>
          <div className="flex space-x-2">
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ₹{periodEarnings.toLocaleString()}
          </div>
          <p className="text-gray-600">
            Earnings for this {selectedPeriod}
          </p>
        </div>
      </div>

      {/* Top Performing Project */}
      {projectEarnings.length > 0 && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">🏆 Top Performing Project</h3>
              <p className="text-xl font-bold text-gray-900 mb-1">{projectEarnings[0].projectName}</p>
              <p className="text-gray-600 mb-2">{projectEarnings[0].projectLocation}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="font-medium text-green-600">
                  {projectEarnings[0].recoveryPercentage.toFixed(1)}% recovered
                </span>
                <span className="text-gray-500">
                  ₹{projectEarnings[0].monthlyEarnings.toLocaleString()}/month
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ₹{projectEarnings[0].totalEarnings.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">Total Earnings</p>
            </div>
          </div>
        </div>
      )}

      {/* Project-wise Earnings */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Project-wise Earnings</h3>
        
        {projectEarnings.length > 0 ? (
          <div className="space-y-4">
            {projectEarnings.map((project, index) => (
              <div key={project.projectId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{project.projectName}</h4>
                        <p className="text-sm text-gray-500">{project.projectLocation}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Investment</p>
                        <p className="text-lg font-bold text-gray-900">₹{project.investmentAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Earnings</p>
                        <p className="text-lg font-bold text-green-600">₹{project.totalEarnings.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Monthly Income</p>
                        <p className="text-lg font-bold text-blue-600">₹{project.monthlyEarnings.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Recovery %</p>
                        <p className="text-lg font-bold text-purple-600">{project.recoveryPercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        <span>{project.energyCapacity} MW</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Since {new Date(project.subscriptionDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        <span>{project.totalKwh.toFixed(1)} kWh generated</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="flex items-center justify-end mb-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-600">
                        {project.recoveryPercentage.toFixed(1)}% recovered
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Real earnings from solar generation</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings data yet</h3>
            <p className="text-gray-600">
              Start investing in solar projects to see your earnings here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings; 