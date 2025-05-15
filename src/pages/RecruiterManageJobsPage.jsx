
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Briefcase, Users, Edit3, Trash2, PlusCircle, ArrowLeft, AlertTriangle, EyeOff, Eye, Loader2 } from 'lucide-react';

const RecruiterManageJobsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // For specific job actions

  const fetchJobs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company, location, posted_at, is_active, job_type, skills_required, experience_level, (SELECT COUNT(*) FROM applications WHERE applications.job_id = jobs.id) as applicant_count')
      .eq('recruiter_id', user.id)
      .order('posted_at', { ascending: false });

    if (error) {
      toast({ title: "Error Fetching Jobs", description: error.message, variant: "destructive" });
      setJobs([]);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job listing? This action also deletes all associated applications and cannot be undone.")) return;

    setActionLoading(jobId);
    // Applications will be deleted by CASCADE constraint if set up correctly in DB.
    // If not, delete them manually first:
    // const { error: appError } = await supabase.from('applications').delete().eq('job_id', jobId);
    // if (appError) {
    //   toast({ title: "Deletion Error", description: `Could not delete applications: ${appError.message}`, variant: "destructive" });
    //   setActionLoading(null);
    //   return;
    // }

    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    setActionLoading(null);
    if (error) {
      toast({ title: "Failed to Delete Job", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job Deleted", description: "The job listing has been successfully deleted." });
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    }
  };
  
  const toggleJobStatus = async (jobId, currentStatus) => {
    setActionLoading(jobId);
    const { data, error } = await supabase
      .from('jobs')
      .update({ is_active: !currentStatus })
      .eq('id', jobId)
      .select('is_active')
      .single();
    
    setActionLoading(null);
    if (error) {
      toast({ title: "Failed to Update Status", description: error.message, variant: "destructive" });
    } else if (data) {
      toast({ title: `Job ${data.is_active ? 'Activated' : 'Deactivated'}`, description: "The job listing status has been updated." });
      setJobs(prevJobs => prevJobs.map(job => job.id === jobId ? {...job, is_active: data.is_active} : job));
    }
  };


  if (loading && jobs.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-800 via-cyan-900 to-sky-900 text-white"><Loader2 className="h-12 w-12 animate-spin text-cyan-300 mr-3" /> Loading your job listings...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 via-cyan-900 to-sky-900 text-white p-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <Link to="/recruiter/dashboard">
              <Button variant="ghost" className="text-cyan-300 hover:bg-cyan-700/30 hover:text-cyan-100 mb-2 sm:mb-0">
                <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-cyan-300">Manage Your Job Listings</h1>
            <p className="text-lg text-gray-300">View, edit, or delete your posted jobs.</p>
          </div>
          <Link to="/recruiter/jobs/new">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300">
              <PlusCircle className="mr-2 h-5 w-5" /> Post New Job
            </Button>
          </Link>
        </motion.div>

        {jobs.length === 0 && !loading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl"
          >
            <Briefcase className="mx-auto h-24 w-24 text-gray-500 mb-6" />
            <p className="text-2xl text-gray-300 mb-4">You haven't posted any jobs yet.</p>
            <p className="text-gray-400 mb-6">Start by creating a new job listing to attract talent.</p>
            <Link to="/recruiter/jobs/new">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700">
                Post Your First Job
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className={`bg-gray-800/70 backdrop-blur-sm border-gray-700 hover:border-cyan-600/70 transition-all duration-300 shadow-lg flex flex-col h-full ${!job.is_active ? 'opacity-70' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-cyan-300 line-clamp-2">{job.title}</CardTitle>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${job.is_active ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <CardDescription className="text-sm text-teal-300">{job.company} - {job.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow">
                    <InfoPill icon={<Users className="h-4 w-4" />} text={`${job.applicant_count || 0} Applicants`} color="text-sky-300" />
                    <InfoPill icon={<Briefcase className="h-4 w-4" />} text={job.job_type || 'N/A'} color="text-gray-300" />
                    <InfoPill icon={<Briefcase className="h-4 w-4" />} text={job.experience_level || 'N/A'} color="text-gray-300" />
                    {job.skills_required && job.skills_required.length > 0 && (
                        <div className="mt-1">
                            <p className="text-xs text-gray-400 mb-1">Skills:</p>
                            <div className="flex flex-wrap gap-1">
                                {job.skills_required.slice(0, 3).map(skill => (
                                    <span key={skill} className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded-md">{skill}</span>
                                ))}
                                {job.skills_required.length > 3 && <span className="text-xs text-gray-400 self-end">...</span>}
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 pt-2">Posted: {new Date(job.posted_at).toLocaleDateString()}</p>
                     {!job.is_active && (
                        <div className="flex items-center text-xs text-yellow-400 p-2 bg-yellow-500/10 rounded-md mt-2">
                            <AlertTriangle className="h-4 w-4 mr-1.5 flex-shrink-0"/> This job is currently inactive.
                        </div>
                    )}
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-700/50">
                    <Link to={`/recruiter/applicants?jobId=${job.id}`}>
                        <Button variant="outline" size="sm" className="w-full border-sky-500 text-sky-300 hover:bg-sky-500 hover:text-white">
                            <Users className="mr-1.5 h-4 w-4" /> Applicants
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" disabled className="w-full border-gray-600 text-gray-400 cursor-not-allowed">
                        <Edit3 className="mr-1.5 h-4 w-4" /> Edit
                    </Button>
                    <Button 
                        onClick={() => toggleJobStatus(job.id, job.is_active)} 
                        variant="outline" 
                        size="sm" 
                        disabled={actionLoading === job.id}
                        className={`w-full ${job.is_active ? 'border-yellow-500 text-yellow-300 hover:bg-yellow-500' : 'border-green-500 text-green-300 hover:bg-green-500'} hover:text-white`}
                    >
                        {actionLoading === job.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : job.is_active ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
                        {job.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                        onClick={() => handleDeleteJob(job.id)} 
                        variant="destructive" 
                        size="sm" 
                        disabled={actionLoading === job.id}
                        className="w-full bg-red-700/50 hover:bg-red-600 text-red-300 border-red-600"
                    >
                        {actionLoading === job.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
                        Delete
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoPill = ({ icon, text, color }) => (
  <div className={`flex items-center text-xs ${color || 'text-gray-300'}`}>
    {React.cloneElement(icon, { className: `mr-1.5 flex-shrink-0 ${icon.props.className}` })} {text}
  </div>
);

export default RecruiterManageJobsPage;
