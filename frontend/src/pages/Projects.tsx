import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, subscriptionsAPI } from '../services/api';
import { Project } from '../types';
import { MapPin, Zap, DollarSign, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import RegistrationPopup from '../components/RegistrationPopup';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    // If user is not authenticated, redirect to landing page
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    fetchProjects();
  }, [isAuthenticated, navigate]);

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

  const handleSubscribe = async (project: Project) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setSelectedProject(project);
      setShowRegistrationPopup(true);
      return;
    }

    try {
      setSubscribing(project.id);
      const response = await subscriptionsAPI.subscribeToProject(project.id);
      
      // Show success message and refresh projects
      toast.success(`Successfully subscribed to ${response.data.projectName}!`);
      fetchProjects(); // Refresh the projects list
      
    } catch (error: any) {
      console.error('Error subscribing to project:', error);
      const errorMessage = error.response?.data || 'Failed to subscribe to project';
      toast.error(errorMessage);
    } finally {
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
    <div className="min-h-screen bg-gray-50">
      {/* Projects Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22dots%22 width=%2220%22 height=%2220%22 patternUnits=%22userSpaceOnUse%22%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%221%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23dots)%22/%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 mb-6 gradient-text">
              Premium Solar Investments
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully curated portfolio of high-performing solar installations and start earning rewards
            </p>
          </div>
          
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {projects.map((project, index) => (
              <div 
                key={project.id} 
                className="project-card group"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="project-image relative overflow-hidden">
                  {project.imageUrl ? (
                    <img 
                      src={`http://localhost:8080/api/projects/images/${project.imageUrl.split('/').pop()}`}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to default design if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Design (shown when no image or image fails to load) */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${project.imageUrl ? 'hidden' : ''}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="h-20 w-20 text-green-600 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {project.status}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                    {project.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-6">
                    <MapPin className="h-5 w-5 mr-2 text-green-500" />
                    <span className="font-medium">{project.location}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <p className="text-sm text-gray-600 font-medium mb-1">Energy Capacity</p>
                      <p className="text-xl font-bold text-gray-900">
                        {project.energyCapacity} MW
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <p className="text-sm text-gray-600 font-medium mb-1">Price</p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{project.subscriptionPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Project Stats */}
                  <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Active project</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>12-15% returns</span>
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(project)}
                    disabled={subscribing === project.id || project.status !== 'ACTIVE'}
                    className="w-full btn-primary flex items-center justify-center space-x-2 group"
                  >
                    {subscribing === project.id ? (
                      <div className="loading-spinner mx-auto"></div>
                    ) : (
                      <>
                        <span>Subscribe Now</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-16">
              <Zap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No projects available</h3>
              <p className="text-gray-600">
                Check back later for new solar energy projects.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Popup */}
      <RegistrationPopup
        isOpen={showRegistrationPopup}
        onClose={() => setShowRegistrationPopup(false)}
        projectName={selectedProject?.name}
      />
    </div>
  );
};

export default Projects; 