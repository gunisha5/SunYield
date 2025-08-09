import React, { useState, useEffect } from 'react';
import { projectsAPI, subscriptionsAPI } from '../services/api';
import { Project } from '../types';
import { MapPin, Zap, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getActiveProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (projectId: number) => {
    try {
      setSubscribing(projectId);
      const response = await subscriptionsAPI.initiateSubscription(projectId);
      
      // Redirect to mock payment page
      const project = projects.find(p => p.id === projectId);
      const paymentUrl = `/mock-payment?orderId=${response.data.paymentOrderId}&amount=${project?.subscriptionPrice}&projectName=${encodeURIComponent(project?.name || '')}&userEmail=${encodeURIComponent(localStorage.getItem('userEmail') || '')}`;
      
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Error subscribing to project:', error);
      toast.error('Failed to subscribe to project');
      setSubscribing(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Solar Projects</h1>
        <p className="text-gray-600">Invest in renewable energy projects and earn returns</p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="space-y-4">
              {/* Project Image Placeholder */}
              <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <Zap className="h-12 w-12 text-primary-600" />
              </div>

              {/* Project Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Energy Capacity</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {project.energyCapacity} MW
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Subscription Price</p>
                  <p className="text-lg font-semibold text-primary-600">
                    ₹{project.subscriptionPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Project Status */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {project.status}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Active</span>
                </div>
              </div>

              {/* Subscribe Button */}
              <button
                onClick={() => handleSubscribe(project.id)}
                disabled={subscribing === project.id || project.status !== 'ACTIVE'}
                className="btn-primary w-full flex items-center justify-center"
              >
                {subscribing === project.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <Zap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later for new solar energy projects.
          </p>
        </div>
      )}

      {/* Project Benefits */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Why Invest in Solar Projects?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Stable Returns</h4>
            <p className="text-xs text-gray-500 mt-1">
              Earn consistent returns from renewable energy production
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Clean Energy</h4>
            <p className="text-xs text-gray-500 mt-1">
              Support sustainable energy and reduce carbon footprint
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">Local Impact</h4>
            <p className="text-xs text-gray-500 mt-1">
              Invest in projects that benefit local communities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects; 