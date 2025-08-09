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
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  pendingKyc: number;
  totalSubscriptions: number;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Project {
  id: number;
  name: string;
  location: string;
  energyCapacity: number;
  subscriptionPrice: number;
  status: 'ACTIVE' | 'PAUSED';
}

interface KYCData {
  id: number;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  pan: string;
  documentPath: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
    status: 'ACTIVE'
  });
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [monthlyWithdrawalCap, setMonthlyWithdrawalCap] = useState<number>(3000);
  const [showConfigModal, setShowConfigModal] = useState(false);
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
        fetchMonthlyWithdrawalCap()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const adminToken = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:8080/admin/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      setStats(data);
    }
  };

  const fetchUsers = async () => {
    const adminToken = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:8080/admin/users', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    }
  };

  const fetchProjects = async () => {
    const adminToken = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:8080/admin/projects', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      setProjects(data);
    }
  };

  const fetchKycData = async () => {
    const adminToken = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:8080/admin/kyc/pending', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      setKycData(data);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8080/admin/subscriptions/pending', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const fetchMonthlyWithdrawalCap = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8080/admin/config/monthly-withdrawal-cap', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMonthlyWithdrawalCap(Number(data.amount));
      }
    } catch (error) {
      console.error('Error fetching monthly withdrawal cap:', error);
    }
  };

  const updateMonthlyWithdrawalCap = async (newCap: number) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8080/admin/config/monthly-withdrawal-cap', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: newCap }),
      });

      if (response.ok) {
        const result = await response.text();
        toast.success(result || 'Monthly withdrawal cap updated successfully!');
        setMonthlyWithdrawalCap(newCap);
        setShowConfigModal(false);
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to update monthly withdrawal cap');
      }
    } catch (error) {
      console.error('Error updating monthly withdrawal cap:', error);
      toast.error('Failed to update monthly withdrawal cap');
    }
  };

  const approveKyc = async (kycId: number) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/kyc/${kycId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('KYC approved successfully!');
        fetchKycData();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to approve KYC');
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC');
    }
  };

  const rejectKyc = async (kycId: number) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/kyc/${kycId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: 'KYC rejected by admin' }),
      });

      if (response.ok) {
        toast.success('KYC rejected successfully!');
        fetchKycData();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to reject KYC');
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC');
    }
  };

  const updateUserRole = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success('User role updated successfully!');
        fetchUsers();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const updateProjectStatus = async (projectId: number, newStatus: 'ACTIVE' | 'PAUSED') => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Project status updated successfully!');
        fetchProjects();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject({ ...project });
    setShowEditModal(true);
  };

  const saveProject = async () => {
    if (!editingProject) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProject),
      });

      if (response.ok) {
        toast.success('Project updated successfully!');
        setShowEditModal(false);
        setEditingProject(null);
        fetchProjects();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const deleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Project deleted successfully!');
        fetchProjects();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const createProject = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        toast.success('Project created successfully!');
        setShowCreateModal(false);
        setNewProject({
          name: '',
          location: '',
          energyCapacity: 0,
          subscriptionPrice: 0,
          status: 'ACTIVE'
        });
        fetchProjects();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const approvePayment = async (orderId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/subscriptions/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Payment approved successfully!');
        fetchPendingPayments();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to approve payment');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('Failed to approve payment');
    }
  };

  const rejectPayment = async (orderId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/subscriptions/${orderId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Payment rejected successfully!');
        fetchPendingPayments();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    }
  };

  const addCreditsToUser = async (userId: number, amount: number) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/users/${userId}/add-credits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: amount,
          notes: 'Credits added by admin'
        }),
      });

      if (response.ok) {
        toast.success('Credits added successfully!');
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to add credits');
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    }
  };

  const addEnergyToProject = async (projectId: number, energyAmount: number) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8080/admin/projects/${projectId}/add-energy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          energyProduced: energyAmount,
          date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const result = await response.text();
        toast.success(result || 'Energy data added successfully!');
        // Refresh projects data to show updated information
        fetchProjects();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to add energy data');
      }
    } catch (error) {
      console.error('Error adding energy data:', error);
      toast.error('Failed to add energy data');
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
            <p className="text-2xl font-semibold text-gray-900">{stats?.pendingKyc || 0}</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy & Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.energyCapacity} kW</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{project.subscriptionPrice}</td>
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
                    <p className="text-sm text-gray-500">Document: {kyc.pan}</p>
                    <p className="text-sm text-gray-500">File: {kyc.documentPath}</p>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{payment.project.subscriptionPrice.toLocaleString()}</td>
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
                    <label className="block text-sm font-medium text-gray-700">Subscription Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProject.subscriptionPrice}
                      onChange={(e) => setEditingProject({ ...editingProject, subscriptionPrice: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                    <label className="block text-sm font-medium text-gray-700">Subscription Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProject.subscriptionPrice}
                      onChange={(e) => setNewProject({ ...newProject, subscriptionPrice: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter price"
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