
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, Users, FilePlus, LogOut, BarChart3, CheckSquare } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const RecruiterDashboardPage = () => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoadingStats(false);
        return;
      }
      setLoadingStats(true);
      try {
        // Fetch total jobs posted by the recruiter
        const { count: jobsCount, error: jobsError } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('recruiter_id', user.id);

        if (jobsError) throw jobsError;

        // Fetch total applications received for the recruiter's jobs
        const { data: recruiterJobs, error: recruiterJobsError } = await supabase
          .from('jobs')
          .select('id')
          .eq('recruiter_id', user.id);

        if (recruiterJobsError) throw recruiterJobsError;

        let applicationsCount = 0;
        if (recruiterJobs && recruiterJobs.length > 0) {
          const jobIds = recruiterJobs.map(job => job.id);
          const { count: appsCount, error: appsError } = await supabase
            .from('applications')
            .select('id', { count: 'exact', head: true })
            .in('job_id', jobIds);
          
          if (appsError) throw appsError;
          applicationsCount = appsCount;
        }
        
        setStats({ totalJobs: jobsCount || 0, totalApplications: applicationsCount || 0 });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({ title: "Error", description: "Could not load dashboard statistics.", variant: "destructive" });
        setStats({ totalJobs: 0, totalApplications: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    if (!authLoading && user) {
      fetchStats();
    } else if (!authLoading && !user) {
      setLoadingStats(false);
    }
  }, [user, authLoading, toast]);


  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-700 via-cyan-800 to-sky-900 text-white"><p>Loading dashboard...</p></div>;
  }

  if (!user) {
    return <Navigate to="/recruiter/login" replace />;
  }
  
  if (profile && profile.role !== 'recruiter') {
     return <Navigate to={profile.role === 'candidate' ? "/candidate/area" : "/"} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-700 via-cyan-800 to-sky-900 text-white">
      <header className="bg-black/30 backdrop-blur-md shadow-lg p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
           <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Recruiter Hub
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-300">Welcome, {profile?.full_name || user.email}</span>
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
          <h1 className="text-4xl font-semibold mb-8 text-cyan-300">Recruiter Dashboard</h1>
        </motion.div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatCard
            icon={<Briefcase className="w-10 h-10 text-teal-300" />}
            title="Total Jobs Posted"
            value={loadingStats ? "Loading..." : stats.totalJobs}
            delay={0.05}
          />
          <StatCard
            icon={<CheckSquare className="w-10 h-10 text-sky-300" />}
            title="Total Applications Received"
            value={loadingStats ? "Loading..." : stats.totalApplications}
            delay={0.1}
          />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={<FilePlus className="w-10 h-10 text-teal-400" />}
            title="Post New Job"
            description="Create and publish new job listings."
            linkTo="/recruiter/jobs/new"
            delay={0.15}
          />
          <DashboardCard
            icon={<Briefcase className="w-10 h-10 text-cyan-400" />}
            title="Manage Jobs"
            description="View and edit your active job posts."
            linkTo="/recruiter/jobs"
            delay={0.2}
          />
          <DashboardCard
            icon={<Users className="w-10 h-10 text-sky-400" />}
            title="View Applicants"
            description="Review candidates for your jobs. Select a job from 'Manage Jobs' to view its applicants."
            linkTo="/recruiter/jobs" // Direct to manage jobs, then they select a job to view applicants
            delay={0.25}
          />
        </div>
        
        {/* Placeholder for future chart */}
        {/* <div className="mt-10 bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold text-cyan-200 mb-4 flex items-center">
                <BarChart3 className="w-7 h-7 mr-3 text-purple-400" /> Application Trends
            </h2>
            <p className="text-gray-400">Chart displaying applications per job will be available soon.</p>
        </div> */}
      </main>
      <footer className="py-8 mt-12 text-center text-gray-300 border-t border-cyan-700/50">
          <p>&copy; {new Date().getFullYear()} Recruiter Hub. Find your next top talent.</p>
      </footer>
    </div>
  );
};

const StatCard = ({ icon, title, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg flex items-center space-x-4"
  >
    <div className="p-3 bg-black/20 rounded-lg">{icon}</div>
    <div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);


const DashboardCard = ({ icon, title, description, linkTo, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl hover:shadow-cyan-500/30 transition-shadow duration-300 flex flex-col"
  >
    <div className="flex items-center space-x-4 mb-4">
      {icon}
      <h2 className="text-2xl font-semibold text-cyan-200">{title}</h2>
    </div>
    <p className="text-gray-300 mb-6 flex-grow">{description}</p>
    <Link to={linkTo}>
      <Button variant="outline" className="w-full border-cyan-500 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-colors">
        Go to {title}
      </Button>
    </Link>
  </motion.div>
);

export default RecruiterDashboardPage;
