
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, FileText, Briefcase, Settings, LogOut, Building, Search } from 'lucide-react';

const CandidateAreaPage = () => {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white"><p>Loading Candidate Area...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile && profile.role !== 'candidate') {
    return <Navigate to={profile.role === 'recruiter' ? "/recruiter/dashboard" : "/"} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <header className="bg-black/40 backdrop-blur-md shadow-xl p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-600 bg-clip-text text-transparent">
            My Candidate Space
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-300 hidden sm:block">Welcome, {profile?.full_name || user.email}!</span>
            <Button onClick={signOut} variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20 hover:text-red-300">
              <LogOut className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="text-center mb-12"
        >
          <User className="w-24 h-24 mx-auto text-cyan-400 mb-4 p-3 bg-white/10 rounded-full shadow-lg" />
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
            Welcome to Your Portal
          </h1>
          <p className="text-xl text-gray-300">Manage your job applications, profile, and explore new opportunities.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ActionCard
            icon={<Search className="w-10 h-10 text-teal-400" />}
            title="Find Jobs"
            description="Explore current openings and find your perfect match."
            linkTo="/jobs"
            delay={0.1}
            buttonText="Browse Job Listings"
          />
          <ActionCard
            icon={<FileText className="w-10 h-10 text-cyan-400" />}
            title="My Applications"
            description="Keep track of all your job applications and their statuses."
            linkTo="/candidate/applications"
            delay={0.2}
            buttonText="View Applications"
          />
          <ActionCard
            icon={<Settings className="w-10 h-10 text-sky-400" />}
            title="Update Profile"
            description="Keep your CV and personal information up-to-date."
            linkTo="/candidate/profile"
            delay={0.3}
            buttonText="Edit My Profile"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 p-8 bg-white/5 backdrop-blur-sm rounded-xl shadow-2xl text-center"
        >
          <h2 className="text-3xl font-semibold text-gray-100 mb-4">Ready for the next step?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Your dream job could be just a click away. Ensure your profile is complete to stand out to recruiters.
          </p>
          <Link to="/jobs">
            <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 px-8 text-lg rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105">
              <Briefcase className="mr-2 h-5 w-5" /> Explore All Jobs
            </Button>
          </Link>
        </motion.div>
      </main>

       <footer className="py-10 mt-16 text-center text-gray-500 border-t border-gray-700/50">
          <p>&copy; {new Date().getFullYear()} Candidate Portal. All rights reserved.</p>
          <p className="text-sm">Empowering your career journey.</p>
      </footer>
    </div>
  );
};

const ActionCard = ({ icon, title, description, linkTo, delay, buttonText }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className="bg-gray-800/60 backdrop-blur-md p-8 rounded-xl shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
  >
    <div className="flex justify-center mb-5">{React.cloneElement(icon, { className: `${icon.props.className} p-2 bg-white/10 rounded-full` })}</div>
    <h2 className="text-2xl font-semibold text-center text-gray-100 mb-3">{title}</h2>
    <p className="text-gray-400 text-center mb-6 flex-grow">{description}</p>
    <Link to={linkTo} className="mt-auto">
      <Button variant="outline" className="w-full border-cyan-500 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-colors duration-200 py-3 text-md">
        {buttonText}
      </Button>
    </Link>
  </motion.div>
);

export default CandidateAreaPage;
