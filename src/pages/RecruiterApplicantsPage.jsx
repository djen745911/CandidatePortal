
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Filter, Loader2 } from 'lucide-react';
import ApplicantCard from '@/components/recruiter/ApplicantCard';
import ApplicantFilters from '@/components/recruiter/ApplicantFilters';

const statusColors = {
  applied: 'bg-blue-700 text-blue-200',
  reviewing: 'bg-yellow-700 text-yellow-200',
  interviewing: 'bg-purple-700 text-purple-200',
  hired: 'bg-green-700 text-green-200',
  rejected: 'bg-red-700 text-red-200',
  default: 'bg-gray-700 text-gray-300',
};


const RecruiterApplicantsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // For status updates
  const [filters, setFilters] = useState({ status: '' });

  const fetchJobAndApplicants = useCallback(async () => {
    if (!user || !jobId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('title')
        .eq('id', jobId)
        .eq('recruiter_id', user.id) // Ensure recruiter owns this job
        .single();

      if (jobError || !jobData) {
        toast({ title: "Error", description: jobError?.message || "Could not fetch job details or access denied.", variant: "destructive" });
        setJobTitle('Unknown Job');
        setApplicants([]); // Clear applicants if job fetch fails
        setLoading(false);
        return;
      }
      setJobTitle(jobData.title);

      let query = supabase
        .from('applications')
        .select(`
          id, 
          applied_at, 
          status, 
          cover_letter,
          candidate:profiles (id, full_name, email, avatar_url),
          resume:resumes (id, file_name, storage_path)
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data: appData, error: appError } = await query;

      if (appError) {
        throw appError;
      }
      setApplicants(appData || []);

    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast({ title: "Error Fetching Applicants", description: error.message, variant: "destructive" });
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, [user, jobId, toast, filters]);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [fetchJobAndApplicants]);
  
  const updateApplicationStatus = async (applicationId, newStatus) => {
    setActionLoading(applicationId);
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);
    setActionLoading(null);

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status Updated", description: `Application status changed to ${newStatus}.` });
      setApplicants(prev => prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
    }
  };

  const getResumeUrl = (storagePath) => {
    if (!storagePath) return null;
    // Ensure 'resumes' is the correct bucket name
    const { data } = supabase.storage.from('resumes').getPublicUrl(storagePath);
    return data.publicUrl;
  };
  
  if (loading && applicants.length === 0 && jobId) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-800 via-cyan-900 to-sky-900 text-white"><Loader2 className="h-12 w-12 animate-spin text-cyan-300 mr-3" /> Loading applicants for {jobTitle || 'job'}...</div>;
  }

  if (!jobId) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-800 via-red-900 to-pink-900 text-white p-6">
            <Users className="w-24 h-24 text-red-300 mb-6" />
            <h1 className="text-3xl font-bold mb-4">No Job Selected</h1>
            <p className="text-lg text-red-200 mb-6">Please select a job from the 'Manage Jobs' page to view applicants.</p>
            <Link to="/recruiter/jobs">
                <Button variant="outline" size="lg" className="border-red-300 text-red-200 hover:bg-red-300 hover:text-black">
                    <ArrowLeft className="mr-2 h-5 w-5" /> Go to Manage Jobs
                </Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 via-cyan-900 to-sky-900 text-white p-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/recruiter/jobs">
            <Button variant="ghost" className="text-cyan-300 hover:bg-cyan-700/30 hover:text-cyan-100 mb-2">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Manage Jobs
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-cyan-300">Applicants for: <span className="text-teal-300">{jobTitle}</span></h1>
          <p className="text-lg text-gray-300">Review and manage candidates who applied for this role.</p>
        </motion.div>

        <ApplicantFilters filters={filters} setFilters={setFilters} />

        {applicants.length === 0 && !loading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl"
          >
            <Users className="mx-auto h-24 w-24 text-gray-500 mb-6" />
            <p className="text-2xl text-gray-300 mb-4">No applicants match your current filters, or no one has applied yet.</p>
            <p className="text-gray-400">Check back later or adjust your filters.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {applicants.map((app, index) => (
              <ApplicantCard 
                key={app.id} 
                applicant={app} 
                index={index}
                statusColors={statusColors}
                getResumeUrl={getResumeUrl}
                updateApplicationStatus={updateApplicationStatus}
                actionLoading={actionLoading === app.id} // Pass loading state for individual card
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterApplicantsPage;
