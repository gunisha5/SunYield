import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OtpVerification from './pages/OtpVerification';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Subscriptions from './pages/Subscriptions';
import Earnings from './pages/Earnings';
import PublicProjects from './pages/PublicProjects';
import HowItWorks from './pages/HowItWorks';
import AboutSolarCapital from './pages/AboutSolarCapital';
import Benefits from './pages/Benefits';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import MockPayment from './pages/MockPayment';
import Engagement from './pages/Engagement';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/projects" element={<PublicProjects />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<AboutSolarCapital />} />
            <Route path="/benefits" element={<Benefits />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/mock-payment" element={<MockPayment />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="engagement" element={<Engagement />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Catch-all route - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 