
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Briefcase, UserCircle, LogOut } from 'lucide-react';

const CandidateDashboardPage = () => {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-black text-white"><p>Loading dashboard...</p></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, but their role is not candidate, redirect them.
  // Or if they are a candidate, they should ideally be in /candidate/area first.
  // This page can serve as a more detailed view or be deprecated if /candidate/area covers all needs.
  if (profile && profile.role !== 'candidate') {
     return <Navigate to={profile.role === 'recruiter' ? "/recruiter/dashboard" : "/"} replace />;
  }
  // Optionally, if you want to enforce /candidate/area as the primary entry:
  // if (profile && profile.role === 'candidate') {
  //   return <Navigate to="/candidate/area" replace />;
  // }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-black text-white">
      <header className="bg-black/30 backdrop-blur-md shadow-lg p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/candidate/area" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Candidate Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-indigo-300">Welcome, {profile?.full_name || user.email}</span>
            <Button onClick={signOut} variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20 hover:text-red-300">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-semibold mb-8 text-indigo-300">Detailed Dashboard</h1>
          <p className="text-gray-300 mb-6">This is a more detailed dashboard view. You might include specific stats or quick actions here.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={<Briefcase className="w-10 h-10 text-purple-400" />}
            title="Browse Jobs"
            description="Find and apply for your next role."
            linkTo="/jobs" 
            delay={0.1}
          />
          <DashboardCard
            icon={<FileText className="w-10 h-10 text-indigo-400" />}
            title="Application History"
            description="Track your submitted applications."
            linkTo="/candidate/applications"
            delay={0.2}
          />
          <DashboardCard
            icon={<UserCircle className="w-10 h-10 text-blue-400" />}
            title="Manage Profile"
            description="Update your CV and personal details."
            linkTo="/candidate/profile"
            delay={0.3}
          />
        </div>
      </main>
       <footer className="py-8 mt-12 text-center text-gray-400 border-t border-gray-700">
          <p>&copy; {new Date().getFullYear()} Candidate Portal. Your career journey starts here.</p>
      </footer>
    </div>
  );
};

const DashboardCard = ({ icon, title, description, linkTo, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-xl hover:shadow-indigo-500/30 transition-shadow duration-300"
  >
    <div className="flex items-center space-x-4 mb-4">
      {icon}
      <h2 className="text-2xl font-semibold text-indigo-200">{title}</h2>
    </div>
    <p className="text-gray-400 mb-6">{description}</p>
    <Link to={linkTo}>
      <Button variant="outline" className="w-full border-indigo-500 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-colors">
        Go to {title}
      </Button>
    </Link>
  </motion.div>
);

export default CandidateDashboardPage;
