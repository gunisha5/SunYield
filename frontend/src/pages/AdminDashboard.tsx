import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Users, 
  FolderOpen, 
  CreditCard, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Zap,
  Image,
  Tag
} from 'lucide-react';
import ProjectImageUpload from '../components/ProjectImageUpload';
import { adminAPI, couponAPI } from '../services/api';
import api from '../services/api';
import { DashboardStats, User, Project, KYC, Coupon } from '../types';

interface KYCData {
  id: number;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  documentType: string;
  documentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [kycData, setKycData] = useState<KYCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    location: '',
    energyCapacity: 0,
    subscriptionPrice: 0,
    minContribution: 999,
    efficiency: 'MEDIUM',
    operationalValidityYear: 2025,
    description: '',
    status: 'ACTIVE'
  }); // Updated for Solar Capital
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [monthlyWithdrawalCap, setMonthlyWithdrawalCap] = useState<number>(3000);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedProjectForImage, setSelectedProjectForImage] = useState<Project | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newCoupon, setNewCoupon] = useState<Omit<Coupon, 'id' | 'currentUsage' | 'createdAt' | 'updatedAt'>>({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minAmount: 0,
    maxDiscount: 0,
    maxUsage: 0,
    isActive: true,
    validFrom: undefined,
    validUntil: undefined
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchProjects(),
        fetchKycData(),
        fetchPendingPayments(),
        fetchMonthlyWithdrawalCap(),
        fetchCoupons()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await adminAPI.getAllProjects();
      console.log('[DEBUG] Fetched projects:', response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchKycData = async () => {
    try {
      const response = await adminAPI.getPendingKyc();
      setKycData(response.data);
    } catch (error) {
      console.error('Error fetching KYC data:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await adminAPI.getPendingSubscriptions();
      setPendingPayments(response.data);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const fetchMonthlyWithdrawalCap = async () => {
    try {
      const response = await adminAPI.getMonthlyWithdrawalCap();
      setMonthlyWithdrawalCap(response.data.cap);
    } catch (error) {
      console.error('Error fetching monthly withdrawal cap:', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await couponAPI.getAllCoupons();
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const updateMonthlyWithdrawalCap = async (newCap: number) => {
    try {
      const response = await api.post('/api/admin/config/monthly-withdrawal-cap', { amount: newCap });

      toast.success('Monthly withdrawal cap updated successfully!');
      setMonthlyWithdrawalCap(newCap);
      setShowConfigModal(false);
    } catch (error) {
      console.error('Error updating monthly withdrawal cap:', error);
      toast.error('Failed to update monthly withdrawal cap');
    }
  };

  const approveKyc = async (kycId: number) => {
    try {
      const response = await api.post(`/api/admin/kyc/${kycId}/approve`);

      toast.success('KYC approved successfully!');
      fetchKycData();
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC');
    }
  };

  const rejectKyc = async (kycId: number) => {
    try {
      const response = await api.post(`/api/admin/kyc/${kycId}/reject`, { notes: 'KYC rejected by admin' });

      toast.success('KYC rejected successfully!');
      fetchKycData();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC');
    }
  };

  const updateUserRole = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    try {
      const response = await api.put(`/api/admin/users/${userId}/role`, { role: newRole });

      toast.success('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const updateProjectStatus = async (projectId: number, newStatus: 'ACTIVE' | 'PAUSED') => {
    try {
      await adminAPI.updateProjectStatus(projectId, newStatus);
      toast.success('Project status updated successfully!');
      fetchProjects();
    } catch (error: any) {
      console.error('Error updating project status:', error);
      toast.error(error.response?.data?.message || 'Failed to update project status');
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject({ ...project });
    setShowEditModal(true);
  };

  const saveProject = async () => {
    if (!editingProject) return;

    try {
      console.log('[DEBUG] Updating project with data:', editingProject);
      await adminAPI.updateProject(editingProject.id, editingProject);
      console.log('[DEBUG] Project update successful, refreshing data...');
      toast.success('Project updated successfully!');
      setShowEditModal(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const deleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteProject(projectId);
      toast.success('Project deleted successfully!');
      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const createProject = async () => {
    try {
      await adminAPI.createProject(newProject);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setNewProject({
        name: '',
        location: '',
        energyCapacity: 0,
        subscriptionPrice: 0,
        minContribution: 999,
        efficiency: 'MEDIUM',
        operationalValidityYear: 2025,
        description: '',
        status: 'ACTIVE'
      });
      fetchProjects();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const approvePayment = async (orderId: string) => {
    try {
      const response = await api.post(`/api/admin/subscriptions/${orderId}/approve`);

      toast.success('Payment approved successfully!');
      fetchPendingPayments();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('Failed to approve payment');
    }
  };

  const rejectPayment = async (orderId: string) => {
    try {
      const response = await api.post(`/api/admin/subscriptions/${orderId}/reject`);

      toast.success('Payment rejected successfully!');
      fetchPendingPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    }
  };

  const addCreditsToUser = async (userId: number, amount: number) => {
    try {
      const response = await api.post(`/api/admin/users/${userId}/add-credits`, { 
        amount: amount,
        notes: 'Credits added by admin'
      });

      toast.success('Credits added successfully!');
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    }
  };

  const addEnergyToProject = async (projectId: number, energyAmount: number) => {
    try {
      const response = await api.post(`/api/admin/projects/${projectId}/add-energy`, {
        energyProduced: energyAmount,
        date: new Date().toISOString().split('T')[0] // Send only the date part (YYYY-MM-DD)
      });

      toast.success('Energy data added successfully!');
      // Refresh projects data to show updated information
      fetchProjects();
    } catch (error) {
      console.error('Error adding energy data:', error);
      toast.error('Failed to add energy data');
    }
  };

  // Coupon Management Functions
  const openCouponModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setNewCoupon({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minAmount: coupon.minAmount || 0,
        maxDiscount: coupon.maxDiscount || 0,
        maxUsage: coupon.maxUsage || 0,
        isActive: coupon.isActive,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil
      });
    } else {
      setEditingCoupon(null);
      setNewCoupon({
        code: '',
        name: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minAmount: 0,
        maxDiscount: 0,
        maxUsage: 0,
        isActive: true,
        validFrom: undefined,
        validUntil: undefined
      });
    }
    setShowCouponModal(true);
  };

  const saveCoupon = async () => {
    try {
      if (editingCoupon) {
        const response = await couponAPI.updateCoupon(editingCoupon.id, newCoupon);
        toast.success('Coupon updated successfully!');
      } else {
        const response = await couponAPI.createCoupon(newCoupon);
        toast.success('Coupon created successfully!');
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      console.error(`Error ${editingCoupon ? 'updating' : 'creating'} coupon:`, error);
      toast.error(error.response?.data?.message || `Failed to ${editingCoupon ? 'update' : 'create'} coupon`);
    }
  };

  const deleteCoupon = async (couponId: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      await couponAPI.deleteCoupon(couponId);
      toast.success('Coupon deleted successfully!');
      fetchCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FolderOpen className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Projects</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.totalProjects || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-yellow-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending KYC</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.pendingKycRequests || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.totalSubscriptions || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Management</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      user.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.kycStatus === 'APPROVED' ? 'Verified' : 
                       user.kycStatus === 'REJECTED' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as 'USER' | 'ADMIN')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Project Management</h3>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Contribution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    {project.description && (
                      <div className="text-xs text-gray-500 mt-1">{project.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (project.operationalValidityYear || 2025) >= new Date().getFullYear()
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {project.operationalValidityYear || 2025}
                      {(project.operationalValidityYear || 2025) < new Date().getFullYear() && ' (Expired)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.energyCapacity} kW</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{project.minContribution || 999}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.efficiency === 'HIGH' ? 'bg-green-100 text-green-800' :
                      project.efficiency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.efficiency || 'MEDIUM'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={project.status}
                      onChange={(e) => updateProjectStatus(project.id, e.target.value as 'ACTIVE' | 'PAUSED')}
                      className="text-sm border border-gray-300 rounded px-2 py-1 mr-2"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                    </select>
                    <button 
                      onClick={() => {
                        const energyAmount = prompt(`Enter energy generated (kWh) for ${project.name}:`);
                        if (energyAmount && !isNaN(Number(energyAmount))) {
                          addEnergyToProject(project.id, Number(energyAmount));
                        }
                      }}
                      className="text-green-600 hover:text-green-900 mr-2"
                      title="Add Energy Data"
                    >
                      <Zap className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProjectForImage(project);
                        setShowImageUploadModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-900 mr-2"
                      title="Upload Image"
                    >
                      <Image className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => openEditModal(project)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Edit Project"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteProject(project.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderKyc = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Pending KYC Requests</h3>
        
        {kycData.length === 0 ? (
          <p className="text-gray-500">No pending KYC requests</p>
        ) : (
          <div className="space-y-4">
            {kycData.map((kyc) => (
              <div key={kyc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{kyc.user.fullName}</h4>
                    <p className="text-sm text-gray-500">{kyc.user.email}</p>
                    <p className="text-sm text-gray-500">Document: {kyc.documentNumber}</p>
                    <p className="text-sm text-gray-500">Type: {kyc.documentType}</p>
                    <p className="text-sm text-gray-500">Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => approveKyc(kyc.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectKyc(kyc.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Payment Management</h3>
        {pendingPayments.length === 0 ? (
          <p className="text-gray-500">No payments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentOrderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.user.fullName}</div>
                      <div className="text-sm text-gray-500">{payment.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.project.name}</div>
                      <div className="text-sm text-gray-500">{payment.project.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{(payment.contributionAmount || payment.project.subscriptionPrice || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                        payment.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.subscribedAt ? new Date(payment.subscribedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.paymentStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => approvePayment(payment.paymentOrderId)}
                            className="text-green-600 hover:text-green-900 mr-2"
                            title="Approve Payment"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => rejectPayment(payment.paymentOrderId)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Payment"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {payment.paymentStatus === 'SUCCESS' && (
                        <span className="text-green-600 text-xs">✓ Approved</span>
                      )}
                      {payment.paymentStatus === 'FAILED' && (
                        <span className="text-red-600 text-xs">✗ Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Coupon Management</h3>
          <button
            onClick={() => openCouponModal()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{coupon.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{coupon.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      coupon.discountType === 'PERCENTAGE' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {coupon.discountType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.currentUsage} / {coupon.maxUsage || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      coupon.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openCouponModal(coupon)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Withdrawal Cap (₹)</label>
            <div className="flex items-center mt-1">
              <input
                type="number"
                value={monthlyWithdrawalCap}
                onChange={(e) => setMonthlyWithdrawalCap(Number(e.target.value))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter cap"
              />
              <button
                onClick={() => updateMonthlyWithdrawalCap(monthlyWithdrawalCap)}
                className="ml-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Save Cap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'kyc'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              KYC
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'coupons'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Coupons
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'config'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configuration
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'kyc' && renderKyc()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'coupons' && renderCoupons()}
          {activeTab === 'config' && renderConfig()}
        </div>

        {/* Edit Project Modal */}
        {showEditModal && editingProject && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input
                      type="text"
                      value={editingProject.name}
                      onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={editingProject.location}
                      onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Energy Capacity (MW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingProject.energyCapacity}
                      onChange={(e) => setEditingProject({ ...editingProject, energyCapacity: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Operational Validity Year</label>
                    <input
                      type="number"
                      min="2024"
                      max="2050"
                      value={editingProject.operationalValidityYear || 2025}
                      onChange={(e) => setEditingProject({ ...editingProject, operationalValidityYear: parseInt(e.target.value) || 2025 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter operational validity year"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Contribution (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProject.minContribution || 999}
                      onChange={(e) => setEditingProject({ ...editingProject, minContribution: parseFloat(e.target.value) || 999 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Efficiency Rating</label>
                    <select
                      value={editingProject.efficiency || 'MEDIUM'}
                      onChange={(e) => setEditingProject({ ...editingProject, efficiency: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="HIGH">High (14% annual)</option>
                      <option value="MEDIUM">Medium (12% annual)</option>
                      <option value="LOW">Low (11% annual)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editingProject.description || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={editingProject.status}
                      onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as 'ACTIVE' | 'PAUSED' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProject}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
        {showImageUploadModal && selectedProjectForImage && (
          <ProjectImageUpload
            projectId={selectedProjectForImage.id}
            projectName={selectedProjectForImage.name}
            currentImageUrl={selectedProjectForImage.imageUrl}
            onImageUploaded={(imageUrl) => {
              // Update the project in the local state
              setProjects(projects.map(p => 
                p.id === selectedProjectForImage.id 
                  ? { ...p, imageUrl } 
                  : p
              ));
              setShowImageUploadModal(false);
              setSelectedProjectForImage(null);
            }}
            onClose={() => {
              setShowImageUploadModal(false);
              setSelectedProjectForImage(null);
            }}
          />
        )}

        {/* Coupon Modal */}
        {showCouponModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Coupon Code *</label>
                    <input
                      type="text"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., WELCOME10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      value={newCoupon.name}
                      onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Welcome Discount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Coupon description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Type *</label>
                    <select
                      value={newCoupon.discountType}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Discount Value * ({newCoupon.discountType === 'PERCENTAGE' ? '%' : '₹'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCoupon.discountValue}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder={newCoupon.discountType === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 500'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCoupon.minAmount || 0}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Minimum order amount"
                    />
                  </div>
                  {newCoupon.discountType === 'PERCENTAGE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maximum Discount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newCoupon.maxDiscount || 0}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Maximum discount amount"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maximum Usage</label>
                    <input
                      type="number"
                      value={newCoupon.maxUsage || 0}
                      onChange={(e) => setNewCoupon({ ...newCoupon, maxUsage: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0 for unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valid From</label>
                    <input
                      type="datetime-local"
                      value={newCoupon.validFrom || ''}
                      onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                    <input
                      type="datetime-local"
                      value={newCoupon.validUntil || ''}
                      onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCoupon.isActive}
                        onChange={(e) => setNewCoupon({ ...newCoupon, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCouponModal(false);
                      setEditingCoupon(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCoupon}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={newProject.location}
                      onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Energy Capacity (MW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newProject.energyCapacity}
                      onChange={(e) => setNewProject({ ...newProject, energyCapacity: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter capacity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Operational Validity Year</label>
                    <input
                      type="number"
                      min="2024"
                      max="2050"
                      value={newProject.operationalValidityYear}
                      onChange={(e) => setNewProject({ ...newProject, operationalValidityYear: parseInt(e.target.value) || 2025 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter operational validity year"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Contribution (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProject.minContribution}
                      onChange={(e) => setNewProject({ ...newProject, minContribution: parseFloat(e.target.value) || 999 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter minimum contribution"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Efficiency Rating</label>
                    <select
                      value={newProject.efficiency}
                      onChange={(e) => setNewProject({ ...newProject, efficiency: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="HIGH">High (14% annual)</option>
                      <option value="MEDIUM">Medium (12% annual)</option>
                      <option value="LOW">Low (11% annual)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as 'ACTIVE' | 'PAUSED' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewProject({
                        name: '',
                        location: '',
                        energyCapacity: 0,
                        subscriptionPrice: 0,
                        minContribution: 999,
                        efficiency: 'MEDIUM',
                        operationalValidityYear: 2025,
                        description: '',
                        status: 'ACTIVE'
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createProject}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 