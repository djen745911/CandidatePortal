import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, AlertCircle, Loader2, ServerCrash } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Attempting to fetch jobs...");
    try {
      const { data, error: supabaseError, status, count } = await supabase
        .from('jobs')
        .select('id, title, company, location, salary, type, description, posted_at, Currency', { count: 'exact' })
        .order('posted_at', { ascending: false });

      console.log("Supabase fetch response:", { data, supabaseError, status, count });

      if (supabaseError) {
        console.error('Supabase error fetching jobs:', { status, message: supabaseError.message, details: supabaseError.details, hint: supabaseError.hint });
        throw supabaseError;
      }
      
      setJobs(data || []);

      if (data && data.length === 0) {
        console.warn("Successfully fetched from 'jobs' table, but no jobs were returned. The table might be empty or filters (if any were applied) resulted in no matches. Count from Supabase:", count);
        toast({
          title: "No Jobs Found",
          description: "The jobs table was queried successfully but returned no entries. It might be empty.",
          variant: "default",
          duration: 5000,
        });
      } else if (!data) {
        console.warn("Supabase returned null data for jobs, but no explicit error. This is unusual. Count from Supabase:", count);
         toast({
          title: "Empty Response",
          description: "Received an empty response from the database for jobs.",
          variant: "default",
          duration: 5000,
        });
      } else {
        console.log(`Successfully fetched ${data.length} jobs. Count from Supabase: ${count}`);
      }

    } catch (err) {
      console.error("Catch block: Error fetching jobs:", err);
      const errorMessage = err.message || 'Failed to fetch jobs. Please check console for details.';
      setError(errorMessage);
      toast({
        title: "Error Fetching Jobs",
        description: `Could not load job listings. ${errorMessage}. If RLS is disabled, check table name, columns, and network.`,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setLoading(false);
      console.log("Finished fetchJobs attempt. Loading set to false.");
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatSalary = (salary, currency) => {
    if (!salary) return "Not Disclosed";
    const cleanSalary = String(salary).replace(/[^0-9.-]+/g,"");
    return `${currency || ''}${cleanSalary}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-6 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 text-indigo-400 animate-spin mb-6" />
        <p className="text-2xl text-indigo-300">Loading job opportunities...</p>
        <p className="text-md text-indigo-400 mt-2">Please wait a moment. Checking the job board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-pink-900 text-white p-6 flex flex-col items-center justify-center text-center">
        <ServerCrash className="h-20 w-20 text-red-400 mb-6" />
        <h1 className="text-4xl font-bold text-red-300 mb-3">Something Went Wrong</h1>
        <p className="text-xl text-red-400 mb-4">We couldn't load the job listings.</p>
        <p className="text-sm text-gray-300 bg-black/30 p-3 rounded-md mb-6 max-w-md">{error}</p>
        <p className="text-md text-indigo-300 mb-2">Please check your internet connection. Since RLS is disabled, verify the 'jobs' table name and columns in your Supabase project.</p>
        <p className="text-md text-indigo-300 mb-6">Open the browser console (F12) for more detailed error messages from Supabase.</p>
        <Button onClick={fetchJobs} className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 text-lg">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Explore Job Opportunities
          </h1>
          <p className="text-xl text-indigo-300">Find your next career move with us.</p>
        </header>

        <div className="mb-8 p-6 bg-black/20 backdrop-blur-md rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-indigo-200 mb-4">Filter Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><input type="text" placeholder="Keywords (e.g., React, Python)" className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" /></div>
            <div><input type="text" placeholder="Location (e.g., New York, Remote)" className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" /></div>
            <div>
              <select className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white">
                <option value="" className="text-gray-400 bg-gray-800">Job Type</option>
                <option value="Full-time" className="bg-gray-800">Full-time</option>
                <option value="Part-time" className="bg-gray-800">Part-time</option>
                <option value="Contract" className="bg-gray-800">Contract</option>
                <option value="Internship" className="bg-gray-800">Internship</option>
              </select>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-full text-white">Search</Button>
          </div>
        </div>

        {!loading && jobs.length === 0 && (
          <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center text-2xl text-gray-300 mt-16 py-12 bg-black/20 backdrop-blur-sm rounded-lg shadow-xl"
          >
              <Briefcase className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
              <p className="font-semibold">No Job Opportunities Found</p>
              <p className="text-lg text-gray-400 mt-2">
                It seems there are no jobs posted at the moment. <br/>
                Please check your Supabase 'jobs' table to ensure it has entries.
              </p>
              <p className="text-sm text-gray-500 mt-4">(If you're an administrator, ensure jobs are published.)</p>
          </motion.div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/30 flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl text-indigo-300 line-clamp-2">{job.title}</CardTitle>
                    <CardDescription className="text-purple-300">{job.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow">
                    <InfoItem icon={<MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />} text={job.location || 'Not Specified'} />
                    <InfoItem icon={<DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0" />} text={formatSalary(job.salary, job.Currency)} />
                    <InfoItem icon={<Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />} text={job.type || 'Not Specified'} />
                    <p className="text-gray-400 text-sm line-clamp-3">{job.description || 'No description available.'}</p>
                  </CardContent>
                  <CardFooter className="mt-auto pt-4">
                    <Link to={`/jobs/${job.id}`} className="w-full">
                      <Button variant="outline" className="w-full border-indigo-500 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-colors duration-200">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const InfoItem = ({ icon, text }) => (
  <div className="flex items-start space-x-2">
    {React.cloneElement(icon, { className: `${icon.props.className} flex-shrink-0` })}
    <span className="text-gray-300">{text}</span>
  </div>
);

export default JobListPage;