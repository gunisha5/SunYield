import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Search, CreditCard, TrendingUp, Users, Globe, Shield, ArrowRight, CheckCircle, Sun, Battery, DollarSign } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Solar Capital Logo */}
            <div className="flex items-center -ml-8">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center text-2xl font-bold text-green-600 hover:text-green-700 transition-colors pl-8 group"
                >
                  <Zap className="h-8 w-8 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Solar Capital
                </button>
              </div>
            </div>
            
            {/* Center - Navigation Links */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className="text-green-600 font-semibold border-b-2 border-green-600 pb-1 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => navigate('/benefits')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Benefits
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Explore Projects
              </button>
            </div>
            
            {/* Right side - Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="btn-primary"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="hero-title mb-6">
              How Solar Capital Works
            </h1>
            <p className="hero-subtitle mb-8">
              Your complete guide to investing in solar energy projects and earning sustainable returns
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From registration to earning returns, we've made solar investment as simple as possible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="card text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Explore Projects</h3>
              <p className="text-gray-600 mb-6">
                Browse our curated selection of solar projects. Each project is thoroughly vetted and includes detailed information about location, capacity, and expected returns.
              </p>
              <div className="flex items-center justify-center text-green-600 font-semibold">
                <span>Browse Projects</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="card text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Invest Securely</h3>
              <p className="text-gray-600 mb-6">
                Choose your investment amount and complete the transaction through our secure payment system. Start with as little as $100.
              </p>
              <div className="flex items-center justify-center text-blue-600 font-semibold">
                <span>Secure Payment</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="card text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sun className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Solar Generation</h3>
              <p className="text-gray-600 mb-6">
                Your investment goes directly to solar panel installation and maintenance. The panels generate clean electricity and revenue from energy sales.
              </p>
              <div className="flex items-center justify-center text-purple-600 font-semibold">
                <span>Clean Energy</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="card text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Earn Returns</h3>
              <p className="text-gray-600 mb-6">
                Receive regular payments based on energy production and sales. Track your earnings in real-time through our dashboard.
              </p>
              <div className="flex items-center justify-center text-orange-600 font-semibold">
                <span>Track Earnings</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Complete Investment Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From project selection to ongoing returns, here's everything you need to know
            </p>
          </div>

          <div className="space-y-12">
            {/* Project Selection */}
            <div className="card-hover">
              <div className="flex items-start space-x-6">
                <div className="bg-green-100 p-4 rounded-xl">
                  <Search className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Project Selection & Due Diligence</h3>
                  <p className="text-gray-600 mb-4">
                    Our team of experts carefully selects solar projects based on multiple criteria including location, solar irradiance, grid connectivity, and financial viability. Each project undergoes rigorous due diligence to ensure maximum returns and minimal risk.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Location analysis and solar resource assessment
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Financial modeling and return projections
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Technical feasibility and grid integration
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Regulatory compliance and permitting
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Investment Process */}
            <div className="card-hover">
              <div className="flex items-start space-x-6">
                <div className="bg-blue-100 p-4 rounded-xl">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment & Ownership</h3>
                  <p className="text-gray-600 mb-4">
                    When you invest in a solar project, you're purchasing a fractional ownership stake in the actual solar installation. This gives you direct ownership of the energy production and revenue generated by your portion of the solar array.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Fractional ownership of solar assets
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Secure blockchain-based ownership records
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Transparent investment tracking
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Flexible investment amounts starting at $100
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Energy Production */}
            <div className="card-hover">
              <div className="flex items-start space-x-6">
                <div className="bg-purple-100 p-4 rounded-xl">
                  <Battery className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Energy Production & Sales</h3>
                  <p className="text-gray-600 mb-4">
                    Your solar panels generate clean electricity that's sold to the grid or directly to consumers. Revenue comes from power purchase agreements, energy sales, and government incentives for renewable energy production.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Real-time energy production monitoring
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Grid integration and power sales
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Renewable energy credits and incentives
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Automated revenue collection and distribution
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Returns & Monitoring */}
            <div className="card-hover">
              <div className="flex items-start space-x-6">
                <div className="bg-orange-100 p-4 rounded-xl">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Returns & Portfolio Management</h3>
                  <p className="text-gray-600 mb-4">
                    Receive regular payments based on your share of energy production and sales. Our platform provides comprehensive monitoring tools to track performance, earnings, and environmental impact.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Monthly or quarterly dividend payments
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Real-time performance dashboard
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Environmental impact tracking
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Portfolio diversification across multiple projects
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Solar Capital?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most transparent and accessible solar investment platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Regulated</h3>
              <p className="text-gray-600">
                All investments are backed by real assets and comply with financial regulations. Your ownership is recorded on secure blockchain technology.
              </p>
            </div>

            <div className="card text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Democratized Access</h3>
              <p className="text-gray-600">
                Start investing with just $100. We've removed the barriers that traditionally kept solar investment out of reach for most people.
              </p>
            </div>

            <div className="card text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Environmental Impact</h3>
              <p className="text-gray-600">
                Every investment directly contributes to clean energy production and reduces carbon emissions. Track your environmental impact in real-time.
              </p>
            </div>

            <div className="card text-center">
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Predictable Returns</h3>
              <p className="text-gray-600">
                Solar energy production is highly predictable, providing stable returns over the 25+ year lifespan of solar panels.
              </p>
            </div>

            <div className="card text-center">
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600">
                Monitor your investments 24/7 with our comprehensive dashboard showing energy production, earnings, and performance metrics.
              </p>
            </div>

            <div className="card text-center">
              <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Revenue Streams</h3>
              <p className="text-gray-600">
                Earn from energy sales, government incentives, renewable energy credits, and carbon offset programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Solar Investment Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join thousands of investors who are already earning returns while making a positive environmental impact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRegister}
              className="bg-white text-green-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-green-600 transition-colors"
            >
              Explore Projects
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;

