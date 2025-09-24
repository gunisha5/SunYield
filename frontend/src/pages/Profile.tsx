import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { kycAPI } from '../services/api';
import { User, KYCData } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Award,
  Settings,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [kycData, setKycData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showKycForm, setShowKycForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('AADHAR');
  const [documentNumber, setDocumentNumber] = useState('');
  const [pan, setPan] = useState('');

  useEffect(() => {
    console.log('[DEBUG] Profile component - User data:', JSON.stringify(user, null, 2));
    if (user) {
      fetchKycData();
    }
  }, [user]);

  const fetchKycData = async () => {
    try {
      setLoading(true);
      const response = await kycAPI.getKYCStatus();
      setKycData(response.data);
    } catch (error) {
      console.error('Error fetching KYC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleKycSubmit = async () => {
    if (!selectedFile || !documentNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', documentType);
      formData.append('documentNumber', documentNumber);

      await kycAPI.submitKYC(formData);
      toast.success('KYC submitted successfully!');
      setShowKycForm(false);
      setSelectedFile(null);
      setDocumentNumber('');
      fetchKycData();
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast.error('Failed to submit KYC');
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600 max-w-2xl">
          Manage your account information, KYC verification, and security settings
        </p>
      </div>

      {/* Profile Overview */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <UserIcon className="h-12 w-12 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.fullName || 'User'}</h2>
            <p className="text-gray-600 mb-3">{user?.email}</p>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                kycData?.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                kycData?.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {getKycStatusIcon(kycData?.status || 'NOT_SUBMITTED')}
                <span className="ml-1">
                  {kycData?.status === 'APPROVED' ? 'Verified' : 
                   kycData?.status === 'REJECTED' ? 'Rejected' : 
                   kycData ? 'Pending' : 'Not Verified'}
                </span>
              </span>
              <span className="text-sm text-gray-500">
                Member since {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            <p className="text-gray-600">Your account details and contact information</p>
          </div>
          <div className="p-2 bg-primary-100 rounded-lg">
            <Settings className="h-5 w-5 text-primary-600" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
              </div>
              <span className="text-gray-900 font-medium">{user?.fullName || 'Not provided'}</span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
              </div>
              <span className="text-gray-900 font-medium">{user?.email}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <label className="text-sm font-semibold text-gray-700">Contact Number</label>
              </div>
              <span className="text-gray-900 font-medium">{user?.contact || 'Not provided'}</span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <Award className="h-5 w-5 text-gray-400 mr-2" />
                <label className="text-sm font-semibold text-gray-700">Account Role</label>
              </div>
              <span className="text-gray-900 font-medium capitalize">{user?.role?.toLowerCase() || 'User'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">KYC Verification</h2>
            <p className="text-gray-600">Complete verification to access all features</p>
          </div>
          <div className="p-2 bg-primary-100 rounded-lg">
            <Shield className="h-5 w-5 text-primary-600" />
          </div>
        </div>

        {kycData ? (
          <div className="space-y-4">
            <div className="group border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-primary-50 transition-colors duration-300">
                    {getKycStatusIcon(kycData.status)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {kycData.documentType} - {kycData.documentNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted on {new Date(kycData.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(kycData.status)}`}>
                  {kycData.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No KYC submitted</h3>
            <p className="text-gray-600 mb-6">
              Complete your KYC verification to access all features including withdrawals and gifts.
            </p>
            <button
              onClick={() => setShowKycForm(true)}
              className="btn-primary"
            >
              <Upload className="h-5 w-5 mr-2" />
              Submit KYC
            </button>
          </div>
        )}

        {(!kycData || kycData.status === 'REJECTED') && kycData && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowKycForm(true)}
              className="btn-primary"
            >
              <Upload className="h-5 w-5 mr-2" />
              {kycData.status === 'REJECTED' ? 'Resubmit KYC' : 'Submit KYC'}
            </button>
          </div>
        )}
      </div>

      {/* KYC Form Modal */}
      {showKycForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300">
            <div className="text-center mb-6">
              <div className="p-3 bg-primary-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Submit KYC</h3>
              <p className="text-gray-600">Complete your identity verification</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="AADHAR">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document Number</label>
                <input
                  type="text"
                  className="form-input w-full"
                  placeholder="Enter document number"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-300 transition-colors duration-300">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      {selectedFile ? selectedFile.name : 'Choose a file'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleKycSubmit}
                  className="btn-primary flex-1"
                >
                  Submit KYC
                </button>
                <button
                  onClick={() => {
                    setShowKycForm(false);
                    setSelectedFile(null);
                    setDocumentNumber('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 