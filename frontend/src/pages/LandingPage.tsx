import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import { Project } from '../types';
import RegistrationPopup from '../components/RegistrationPopup';
import SubscriptionPopup from '../components/SubscriptionPopup';
import ProfileDropdown from '../components/ProfileDropdown';
import SharedNavigation from '../components/SharedNavigation';
import SolarCalculator from './SolarCalculator';
import { 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Users, 
  MapPin, 
  CheckCircle, 
  ArrowRight,
  Play,
  Star,
  Shield,
  Globe,
  Target,
  Calendar,
  Wallet
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    // Fetch projects for the showcase (always fetch, regardless of auth status)
    fetchProjects();
  }, []);



  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getActiveProjects();
      setProjects(response.data.slice(0, 3)); // Show only first 3 projects
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubscribe = (project: Project) => {
    setSelectedProject(project);
    
    if (isAuthenticated) {
      // If user is authenticated, show subscription popup
      setShowSubscriptionPopup(true);
    } else {
      // If user is not authenticated, show registration popup
      setShowRegistrationPopup(true);
    }
  };



  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <SharedNavigation />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center relative z-10">
            {/* Floating Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 floating" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 floating" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-yellow-200 rounded-full opacity-20 floating" style={{ animationDelay: '2s' }}></div>
            
            <h1 className="hero-title mb-8">
              {isAuthenticated ? (
                <>
                  Welcome Back to{' '}
                  <span className="gradient-text">SunYield</span>
                </>
              ) : (
                <>
                  Invest in Solar Energy{' '}
                  <span className="gradient-text">Without Limits</span>
                </>
              )}
            </h1>
            <p className="hero-subtitle mb-12">
              {isAuthenticated ? (
                "Track your investments, monitor performance, and discover new opportunities to grow your solar portfolio."
              ) : (
                "Join our community of smart investors who earn attractive returns while powering India's renewable energy revolution. Start with just ₹999 and watch your money grow sustainably."
              )}
            </p>
            
            {/* Stats Cards - Different content for authenticated vs non-authenticated users */}
            {isAuthenticated ? (
              <div className="flex flex-wrap justify-center gap-8 mb-12">
                <div className="stats-card transform hover:scale-105 transition-all duration-300">
                  <div className="stats-number">Your Portfolio</div>
                  <div className="stats-label">Active Investments</div>
                </div>
                <div className="stats-card transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                  <div className="stats-number">Track</div>
                  <div className="stats-label">Real-time Performance</div>
                </div>
                <div className="stats-card transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.4s' }}>
                  <div className="stats-number">Grow</div>
                  <div className="stats-label">New Opportunities</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-8 mb-12">
                <div className="stats-card transform hover:scale-105 transition-all duration-300">
                  <div className="stats-number">{projects.length}+</div>
                  <div className="stats-label">Active Projects</div>
                </div>
                <div className="stats-card transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                  <div className="stats-number">12-15%</div>
                  <div className="stats-label">Expected Returns</div>
                </div>
                <div className="stats-card transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.4s' }}>
                  <div className="stats-number">₹999</div>
                  <div className="stats-label">Starting Price</div>
                </div>
              </div>
            )}
            
            {/* CTA Buttons - Different content for authenticated vs non-authenticated users */}
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="btn-primary text-lg px-10 py-5 flex items-center space-x-3 group"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => navigate('/app/projects')}
                  className="btn-outline text-lg px-10 py-5 flex items-center space-x-3 group"
                >
                  <span>Manage Portfolio</span>
                  <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleRegister}
                  className="btn-primary text-lg px-10 py-5 flex items-center space-x-3 group"
                >
                  <span>Begin Investing Today</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => navigate(isAuthenticated ? '/app/projects' : '/projects')}
                  className="btn-outline text-lg px-10 py-5 flex items-center space-x-3 group"
                >
                  <span>Explore Projects</span>
                  <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            )}
            
            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>SEC Registered</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Verified Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span>Environmental Impact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solar Calculator Section - Only for non-logged-in users */}
      {!isAuthenticated && (
        <section className="py-24 bg-gray-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-gray-900 mb-6 gradient-text">
                Calculate Your Solar Savings
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover how much you can save on your electricity bills with solar energy.
              </p>
            </div>
            <SolarCalculator isHomePage={true} />
          </div>
        </section>
      )}


      {/* Featured Projects Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22dots%22 width=%2220%22 height=%2220%22 patternUnits=%22userSpaceOnUse%22%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%221%22 fill=%22%2310b981%22 opacity=%220.1%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23dots)%22/%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 mb-6 gradient-text">
              {isAuthenticated ? "Your Solar Portfolio" : "Premium Solar Investments"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isAuthenticated 
                ? "Manage your existing investments and discover new opportunities to diversify your portfolio"
                : "Discover our carefully curated portfolio of high-performing solar installations across educational institutions and commercial buildings"
              }
            </p>
          </div>
          
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
                    <span>{isAuthenticated ? "Add to Portfolio" : "Subscribe Now"}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={() => navigate(isAuthenticated ? '/app/projects' : '/projects')}
              className="btn-outline"
            >
              {isAuthenticated ? "Manage Portfolio" : "View All Projects"}
            </button>
          </div>
        </div>
      </section>



      {/* Trust & Security Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%2210%22 height=%2210%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 10 0 L 0 0 0 10%22 fill=%22none%22 stroke=%22%2310b981%22 stroke-width=%220.5%22 opacity=%220.1%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23grid)%22/%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 mb-6 gradient-text">
              Your Investment Security
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Backed by regulatory compliance and industry best practices for complete investor confidence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Compliant</h3>
              <p className="text-gray-600 text-sm">
                Fully compliant with all regulatory requirements and industry standards.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure Platform</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Bank-grade security with SSL encryption and secure payment processing.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Government Recognized</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Officially recognized by the Government of India as an innovative startup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-24 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3Cpattern id=%22stars%22 width=%2220%22 height=%2220%22 patternUnits=%22userSpaceOnUse%22%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%220.5%22 fill=%22white%22 opacity=%220.1%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23stars)%22/%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-5xl font-black text-white mb-6">
              Ready to Grow Your{' '}
              <span className="text-yellow-300">Wealth?</span>
            </h2>
            <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of savvy investors who are already earning impressive returns while supporting India's clean energy transformation
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleRegister}
                className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 group"
              >
                <span>Start Investing Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => navigate(isAuthenticated ? '/app/projects' : '/projects')}
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 group"
              >
                <span>Explore Projects</span>
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Secure Investment</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Guaranteed Returns</span>
              </div>
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
            
            {isAuthenticated ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><button onClick={() => navigate('/app/projects')} className="hover:text-white transition-colors">Projects</button></li>
                    <li><button onClick={() => navigate('/app/dashboard')} className="hover:text-white transition-colors">Dashboard</button></li>
                    <li><button onClick={() => navigate('/app/earnings')} className="hover:text-white transition-colors">Earnings</button></li>
                    <li><button onClick={() => navigate('/app/wallet')} className="hover:text-white transition-colors">Wallet</button></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><button onClick={() => navigate('/app/profile')} className="hover:text-white transition-colors">Profile</button></li>
                    <li><button onClick={() => navigate('/app/subscriptions')} className="hover:text-white transition-colors">Subscriptions</button></li>
                    <li><button onClick={() => navigate('/app/engagement')} className="hover:text-white transition-colors">Engagement</button></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Support</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>Help Center</li>
                    <li>Contact Support</li>
                    <li>FAQ</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SunYield. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Registration Popup */}
      <RegistrationPopup
        isOpen={showRegistrationPopup}
        onClose={() => setShowRegistrationPopup(false)}
        projectName={selectedProject?.name}
      />

      {/* Subscription Popup */}
      {showSubscriptionPopup && selectedProject && (
        <SubscriptionPopup
          project={selectedProject}
          onClose={() => {
            console.log('Closing subscription popup');
            setShowSubscriptionPopup(false);
          }}
        />
      )}
    </div>
  );
};

export default LandingPage; 