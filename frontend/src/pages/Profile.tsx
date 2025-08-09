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
  Clock
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account and verification</p>
      </div>

      {/* Profile Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user?.fullName || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <label className="form-label">Email</label>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user?.email}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="form-label">Contact Number</label>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user?.contact || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <label className="form-label">Account Status</label>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-2" />
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  kycData?.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                  kycData?.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {kycData?.status === 'APPROVED' ? 'Verified' : 
                   kycData?.status === 'REJECTED' ? 'Rejected' : 
                   kycData ? 'Pending' : 'Not Submitted'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">KYC Verification</h3>
          {(!kycData || kycData.status === 'REJECTED') && (
            <button
              onClick={() => setShowKycForm(true)}
              className="btn-primary"
            >
              <Upload className="h-5 w-5 mr-2" />
              Submit KYC
            </button>
          )}
        </div>

        {kycData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {getKycStatusIcon(kycData.status)}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {kycData.documentType} - {kycData.documentNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted on {new Date(kycData.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKycStatusColor(kycData.status)}`}>
                {kycData.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No KYC submitted</h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete your KYC verification to access all features.
            </p>
          </div>
        )}
      </div>

      {/* KYC Form Modal */}
      {showKycForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit KYC</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="input-field"
                >
                  <option value="AADHAR">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>

              <div>
                <label className="form-label">Document Number</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter document number"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Upload Document</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, PDF (Max 5MB)
                </p>
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