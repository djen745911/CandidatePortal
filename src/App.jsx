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
const CandidateAreaPage = lazy(() => import('@/pages/CandidateAreaPage'));
const CandidateDashboardPage = lazy(() => import('@/pages/CandidateDashboardPage'));
const RecruiterDashboardPage = lazy(() => import('@/pages/RecruiterDashboardPage'));
const JobListPage = lazy(() => import('@/pages/JobListPage')); 
const JobDetailPage = lazy(() => import('@/pages/JobDetailPage'));
const CandidateApplicationsPage = lazy(() => import('@/pages/CandidateApplicationsPage'));
const CandidateProfilePage = lazy(() => import('@/pages/CandidateProfilePage'));
const RecruiterPostJobPage = lazy(() => import('@/pages/RecruiterPostJobPage'));
const RecruiterManageJobsPage = lazy(() => import('@/pages/RecruiterManageJobsPage'));
const RecruiterApplicantsPage = lazy(() => import('@/pages/RecruiterApplicantsPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><p>Loading page...</p></div>}>
          <Routes>
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/recruiter/login" element={<LoginPage />} /> 
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/jobs/:jobId" element={<JobDetailPage />} />

              {/* Protected candidate routes */}
              <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
                <Route path="/candidate" element={<CandidateHomePage />} />
                <Route path="/candidate/area" element={<Navigate to="/candidate" replace />} />
                <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
                <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
                <Route path="/candidate/profile" element={<CandidateProfilePage />} />
              </Route>

              {/* Protected recruiter routes */}
              <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
                <Route path="/recruiter/jobs/new" element={<RecruiterPostJobPage />} />
                <Route path="/recruiter/jobs" element={<RecruiterManageJobsPage />} />
                <Route path="/recruiter/applicants" element={<RecruiterApplicantsPage />} />
              </Route>
              
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