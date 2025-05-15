import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const CandidateHomePage = lazy(() => import('@/pages/CandidateHomePage'));
const CandidateApplicationsPage = lazy(() => import('@/pages/CandidateApplicationsPage'));
const CandidateProfilePage = lazy(() => import('@/pages/CandidateProfilePage'));
const JobListPage = lazy(() => import('@/pages/JobListPage'));
const JobDetailPage = lazy(() => import('@/pages/JobDetailPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <p>Loading page...</p>
          </div>
        }>
          <Routes>
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/jobs/:jobId" element={<JobDetailPage />} />

              {/* Protected candidate routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/candidate" element={<CandidateHomePage />} />
                <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
                <Route path="/candidate/profile" element={<CandidateProfilePage />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;