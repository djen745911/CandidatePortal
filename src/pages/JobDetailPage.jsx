import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft, FileText, Loader2, AlertTriangle, ServerCrash } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

const JobDetailPage = () => {
  const { jobId } = useParams();
  const { user, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchJobDetails = useCallback(async () => {
    if (!jobId) {
      setError("No job ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('jobs')
        .select('id, title, company, location, salary, type, description, posted_at, Currency')
        .eq('id', jobId)
        .single();

      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') { 
          setJob(null); 
          setError(`Job with ID ${jobId} not found.`);
          toast({
            title: "Job Not Found",
            description: `The specific job (ID: ${jobId}) could not be located. It might have been removed.`,
            variant: "destructive",
          });
        } else {
          throw supabaseError;
        }
      } else if (data) {
        setJob(data);
      } else {
        setJob(null);
        setError(`Job with ID ${jobId} not found.`);
         toast({
            title: "Job Not Found",
            description: `The specific job (ID: ${jobId}) could not be located.`,
            variant: "destructive",
          });
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err.message || 'Failed to fetch job details.');
      toast({
        title: "Error Loading Job",
        description: `Could not load job details: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [jobId, toast]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const formatSalary = (salary, currency) => {
    if (!salary) return "Not Disclosed";
    const cleanSalary = String(salary).replace(/[^0-9.-]+/g,"");
    return `${currency || ''}${cleanSalary}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="h-16 w-16 text-indigo-400 animate-spin mb-6" />
        <p className="text-2xl text-indigo-300">Loading Job Details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-red-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale:0.5 }} animate={{ opacity: 1, scale:1 }} transition={{ duration: 0.5 }}>
          <AlertTriangle className="h-20 w-20 text-red-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4 text-red-300">Job Not Found</h1>
          <p className="text-xl text-red-400 mb-2">
            {error || "The job you are looking for does not exist or may have been removed."}
          </p>
          <p className="text-sm text-gray-300 mb-8">Please check the job ID or try browsing other available positions.</p>
          <Link to="/jobs">
            <Button variant="outline" className="border-red-400 text-red-300 hover:bg-red-400 hover:text-white">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Jobs
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const canApply = user && profile && profile.role === 'candidate';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/jobs">
            <Button variant="ghost" className="text-indigo-300 hover:bg-indigo-700/30 hover:text-indigo-100">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Jobs
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardHeader className="border-b border-gray-700 pb-6">
              <CardTitle className="text-4xl font-bold text-indigo-300 mb-2">{job.title}</CardTitle>
              <CardDescription className="text-xl text-purple-300">{job.company}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-2xl font-semibold text-indigo-200 border-b border-indigo-700 pb-2">Job Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{job.description || "No description provided."}</p>
              </div>
              <aside className="space-y-6 p-6 bg-black/20 rounded-lg">
                <h3 className="text-xl font-semibold text-indigo-200 mb-4">Job Overview</h3>
                <InfoItem icon={<MapPin className="h-5 w-5 text-gray-400" />} label="Location" text={job.location || "Not specified"} />
                <InfoItem icon={<DollarSign className="h-5 w-5 text-gray-400" />} label="Salary" text={formatSalary(job.salary, job.Currency)} />
                <InfoItem icon={<Clock className="h-5 w-5 text-gray-400" />} label="Job Type" text={job.type || "Not specified"} />
                <InfoItem icon={<Briefcase className="h-5 w-5 text-gray-400" />} label="Posted" text={job.posted_at ? new Date(job.posted_at).toLocaleDateString() : "Not specified"} />
              </aside>
            </CardContent>
            <CardFooter className="border-t border-gray-700 pt-6">
              {canApply ? (
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300">
                  <FileText className="mr-2 h-5 w-5" /> Apply Now
                </Button>
              ) : user ? (
                 <p className="text-sm text-yellow-400">Login as a candidate to apply for this job.</p>
              ) : (
                <Link to="/login">
                  <Button size="lg" className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800">
                    Login to Apply
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, text }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-lg text-gray-200">{text}</p>
    </div>
  </div>
);

export default JobDetailPage;