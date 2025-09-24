import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import { Project } from '../types';
import RegistrationPopup from '../components/RegistrationPopup';
import ProfileDropdown from '../components/ProfileDropdown';
import SharedNavigation from '../components/SharedNavigation';
import { Zap, MapPin, TrendingUp, Users, ArrowRight, Play, Star, Calendar, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicProjects: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects...');
      const response = await projectsAPI.getActiveProjects();
      console.log('Projects response:', response);
      // The API returns the array directly in response.data
      setProjects(response.data);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Please check if the backend is running.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check if the backend is running on port 8080.');
      } else {
        toast.error('Failed to load projects: ' + (error.response?.data || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (project: Project) => {
    if (!isAuthenticated) {
      setSelectedProject(project);
      setShowRegistrationPopup(true);
      return;
    }
    // If authenticated, redirect to the protected projects page
    navigate('/app/projects');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <SharedNavigation />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="hero-title mb-6">
              Active Solar Projects
            </h1>
            <p className="hero-subtitle mb-8">
              Explore our portfolio of rooftop solar projects and start earning Green Credits today
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="btn-outline"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
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

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Projects</h3>
              <p className="text-gray-600">Check back soon for new solar projects!</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>If you're seeing this message, it might be because:</p>
                <ul className="mt-2 space-y-1">
                  <li>• The backend server is not running</li>
                  <li>• There are no active projects in the database</li>
                  <li>• There's a network connectivity issue</li>
                </ul>
              </div>
            </div>
          ) : (
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
                        <p className="text-sm text-gray-600 font-medium mb-1">Min Contribution</p>
                        <p className="text-xl font-bold text-green-600">
                          ₹{(project.minContribution || project.subscriptionPrice || 999).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Solar Capital Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                        <p className="text-xs text-gray-600 font-medium mb-1">Efficiency</p>
                        <p className="text-sm font-bold text-yellow-700">
                          {project.efficiency || 'MEDIUM'}
                        </p>
                      </div>
                      <div className={`text-center p-3 rounded-lg border ${
                        (project.operationalValidityYear || 2025) >= new Date().getFullYear()
                          ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                      }`}>
                        <p className="text-xs text-gray-600 font-medium mb-1">Validity</p>
                        <p className={`text-sm font-bold ${
                          (project.operationalValidityYear || 2025) >= new Date().getFullYear()
                            ? 'text-purple-700'
                            : 'text-gray-500'
                        }`}>
                          {project.operationalValidityYear || 2025}
                          {(project.operationalValidityYear || 2025) < new Date().getFullYear() && (
                            <span className="block text-xs text-red-500">Expired</span>
                          )}
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
                        <span>₹5 per kWh</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSubscribe(project)}
                      className="w-full btn-primary flex items-center justify-center space-x-2 group"
                    >
                      <span>Subscribe Now</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action - Different content for authenticated vs non-authenticated users */}
      {isAuthenticated ? (
        <section className="py-16 bg-green-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">Explore More Investment Opportunities</h2>
            <p className="text-xl mb-8">Discover new projects and manage your existing portfolio</p>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-white/80 text-sm mb-2">Your Portfolio</div>
                <h3 className="text-white font-semibold mb-3">View Active Investments</h3>
                <button
                  onClick={() => navigate('/app/projects')}
                  className="w-full bg-white text-green-600 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  My Projects
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-white/80 text-sm mb-2">Track Performance</div>
                <h3 className="text-white font-semibold mb-3">Monitor Earnings</h3>
                <button
                  onClick={() => navigate('/app/earnings')}
                  className="w-full bg-white text-green-600 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Check Earnings
                </button>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/app/wallet')}
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Manage Wallet
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 bg-green-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Solar Journey?</h2>
            <p className="text-xl mb-8">Join thousands of investors who are already earning Green Credits</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRegister}
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/')}
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Zap className="h-8 w-8 text-green-400 mr-2" />
                <span className="text-xl font-bold">SunYield</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing solar investment opportunities for everyone. We're building India's largest community of renewable energy investors, making sustainable wealth creation accessible to all.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate(isAuthenticated ? '/app/projects' : '/projects')} className="hover:text-white transition-colors">Projects</button></li>
                <li><button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/benefits')} className="hover:text-white transition-colors">Benefits</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Started</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={handleLogin} className="hover:text-white transition-colors font-semibold">Login</button></li>
                <li><button onClick={handleRegister} className="hover:text-white transition-colors">Register</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Exit Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SunYield. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <RegistrationPopup
        isOpen={showRegistrationPopup}
        onClose={() => setShowRegistrationPopup(false)}
        projectName={selectedProject?.name}
      />
    </div>
  );
};

export default PublicProjects; 