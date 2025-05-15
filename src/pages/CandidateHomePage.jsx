import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, MapPin, DollarSign, Search, FileText, Clock, AlertTriangle, Loader2, Filter } from 'lucide-react';

const CandidateHomePage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch recent jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('posted_at', { ascending: false })
          .limit(3);

        if (jobsError) throw jobsError;
        setJobs(jobsData || []);

        // Fetch user's recent applications
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select(`
            id,
            applied_at,
            status,
            job:jobs (
              id,
              title,
              company,
              location
            )
          `)
          .eq('candidate_id', user.id)
          .order('applied_at', { ascending: false })
          .limit(3);

        if (appsError) throw appsError;
        setApplications(appsData || []);

        // Check if user has uploaded a resume
        const { data: resumeData, error: resumeError } = await supabase
          .from('resumes')
          .select('id')
          .eq('candidate_id', user.id)
          .single();

        if (resumeError && resumeError.code !== 'PGRST116') throw resumeError;
        setHasResume(!!resumeData);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error Loading Data",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user || (profile && profile.role !== 'candidate')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      {/* Welcome Section */}
      <section className="pt-12 pb-6 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back, {profile?.full_name || 'Candidate'}!
            </h1>
            <p className="text-xl text-indigo-300">Your journey to the perfect role starts here.</p>
          </motion.div>
        </div>
      </section>

      {/* Resume Alert */}
      {!hasResume && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="container mx-auto px-6 mb-8"
        >
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3" />
              <p className="text-yellow-300">Upload your resume to start applying for jobs!</p>
            </div>
            <Link to="/candidate/profile">
              <Button variant="outline" className="border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black">
                Upload Resume
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-6 space-y-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <QuickActionCard
            icon={<Search className="h-6 w-6 text-purple-400" />}
            title="Find Jobs"
            description="Browse latest opportunities"
            linkTo="/jobs"
          />
          <QuickActionCard
            icon={<FileText className="h-6 w-6 text-blue-400" />}
            title="My Applications"
            description="Track your applications"
            linkTo="/candidate/applications"
          />
          <QuickActionCard
            icon={<Briefcase className="h-6 w-6 text-cyan-400" />}
            title="Update Profile"
            description="Keep your info current"
            linkTo="/candidate/profile"
          />
          <QuickActionCard
            icon={<Filter className="h-6 w-6 text-pink-400" />}
            title="Job Preferences"
            description="Set your preferences"
            linkTo="/candidate/profile"
          />
        </motion.div>

        {/* Recent Jobs */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-indigo-300">Recent Job Postings</h2>
            <Link to="/jobs">
              <Button variant="ghost" className="text-indigo-300 hover:text-indigo-200">
                View All Jobs
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400">No jobs available at the moment.</p>
              </CardContent>
            </Card>
          )}
        </motion.section>

        {/* Recent Applications */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-indigo-300">Recent Applications</h2>
            <Link to="/candidate/applications">
              <Button variant="ghost" className="text-indigo-300 hover:text-indigo-200">
                View All Applications
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : applications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((application, index) => (
                <ApplicationCard key={application.id} application={application} index={index} />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400">You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="mt-4">
                  <Button variant="outline" className="border-indigo-500 text-indigo-300 hover:bg-indigo-500 hover:text-white">
                    Browse Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.section>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, title, description, linkTo }) => (
  <Link to={linkTo}>
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-indigo-500/50 transition-all duration-300">
      <CardContent className="flex items-center p-4">
        <div className="mr-4 p-2 bg-gray-700/50 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-indigo-300">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const JobCard = ({ job, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
  >
    <Card className="bg-gray-800/50 border-gray-700 hover:border-indigo-500/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl text-indigo-300">{job.title}</CardTitle>
        <CardDescription className="text-purple-300">{job.company}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-gray-300">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          {job.location}
        </div>
        <div className="flex items-center text-gray-300">
          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
          {formatSalary(job.salary, job.Currency)}
        </div>
        <Link to={`/jobs/${job.id}`}>
          <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  </motion.div>
);

const ApplicationCard = ({ application, index }) => {
  const statusColors = {
    submitted: 'text-blue-300 bg-blue-500/20',
    reviewing: 'text-yellow-300 bg-yellow-500/20',
    accepted: 'text-green-300 bg-green-500/20',
    rejected: 'text-red-300 bg-red-500/20',
    default: 'text-gray-300 bg-gray-500/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 hover:border-indigo-500/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl text-indigo-300">{application.job.title}</CardTitle>
          <CardDescription className="text-purple-300">{application.job.company}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {application.job.location}
          </div>
          <div className="flex items-center text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            Applied: {new Date(application.applied_at).toLocaleDateString()}
          </div>
          <div className={`inline-flex px-2 py-1 rounded-full text-sm ${statusColors[application.status] || statusColors.default}`}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </div>
          <Link to={`/jobs/${application.job.id}`}>
            <Button variant="outline" className="w-full mt-2 border-indigo-500 text-indigo-300 hover:bg-indigo-500 hover:text-white">
              View Job
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const formatSalary = (salary, currency = '$') => {
  if (!salary) return "Not Disclosed";
  return `${currency}${salary.toLocaleString()}`;
};

export default CandidateHomePage;