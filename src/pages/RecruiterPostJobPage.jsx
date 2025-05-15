
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { FilePlus, ArrowLeft, Briefcase, MapPin, DollarSign, Type, Tag, Activity, CheckCircle, Loader2 } from 'lucide-react';


const RecruiterPostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [jobDetails, setJobDetails] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    Currency: 'USD', // Ensure this matches the DB column name
    job_type: 'Full-time', // Ensure this matches the DB column name 'type'
    description: '',
    skills_required: '', // comma-separated string
    experience_level: 'Entry',
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to post a job.", variant: "destructive" });
      return;
    }
    if (!jobDetails.title || !jobDetails.company || !jobDetails.location || !jobDetails.description) {
      toast({ title: "Missing Required Fields", description: "Please fill in all required fields (Title, Company, Location, Description).", variant: "destructive" });
      return;
    }

    setLoading(true);

    const skillsArray = jobDetails.skills_required.split(',').map(skill => skill.trim()).filter(skill => skill);

    // Map form state to database column names
    const jobDataToInsert = {
      title: jobDetails.title,
      company: jobDetails.company,
      location: jobDetails.location,
      salary: jobDetails.salary || null, // Handle empty salary
      Currency: jobDetails.Currency, // Matches DB
      type: jobDetails.job_type, // Matches DB 'type'
      description: jobDetails.description,
      skills_required: skillsArray.length > 0 ? skillsArray : null,
      experience_level: jobDetails.experience_level,
      is_active: jobDetails.is_active,
      recruiter_id: user.id,
      // posted_at is handled by DB default
      // PostedLinkedin is not in form, assuming default or handle separately
      PostedLinkedin: false, // Default value, adjust if needed
    };
    
    const { data, error } = await supabase.from('jobs').insert([jobDataToInsert]).select().single();

    setLoading(false);
    if (error) {
      console.error("Supabase error:", error);
      toast({ title: "Job Post Failed", description: `Error: ${error.message}. Check console for details.`, variant: "destructive" });
    } else if (data) {
      toast({ title: "Job Posted Successfully!", description: `${data.title} is now live.`, variant: "default" });
      navigate('/recruiter/jobs'); 
    } else {
      toast({ title: "Job Post Issue", description: "Job may have posted, but no confirmation data was returned.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 via-cyan-900 to-sky-900 text-white p-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/recruiter/dashboard">
            <Button variant="ghost" className="text-cyan-300 hover:bg-cyan-700/30 hover:text-cyan-100 mb-4">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-cyan-300">Post a New Job</h1>
          <p className="text-lg text-gray-300">Fill in the details to find your next top talent.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-300 flex items-center">
                <Briefcase className="w-7 h-7 mr-3 text-teal-400" /> Job Details
              </CardTitle>
              <CardDescription className="text-gray-400">Provide comprehensive information about the role. Fields marked with * are required.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <FormItem icon={<Briefcase className="text-teal-400" />} label="Job Title *" htmlFor="title">
                  <Input id="title" name="title" value={jobDetails.title} onChange={handleChange} required className="bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                </FormItem>
                <FormItem icon={<Briefcase className="text-teal-400" />} label="Company Name *" htmlFor="company">
                  <Input id="company" name="company" value={jobDetails.company} onChange={handleChange} required className="bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                </FormItem>
                <FormItem icon={<MapPin className="text-teal-400" />} label="Location *" htmlFor="location">
                  <Input id="location" name="location" value={jobDetails.location} onChange={handleChange} required className="bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                </FormItem>
                 <div className="flex gap-4">
                    <FormItem icon={<DollarSign className="text-teal-400" />} label="Salary Range" htmlFor="salary" className="flex-grow">
                      <Input id="salary" name="salary" value={jobDetails.salary} onChange={handleChange} placeholder="e.g., 80000 - 100000" className="bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                    </FormItem>
                    <FormItem label="Currency" htmlFor="Currency" className="w-1/3"> {/* Name matches DB */}
                       <select id="Currency" name="Currency" value={jobDetails.Currency} onChange={handleChange} className="w-full p-2.5 rounded-md bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 text-white">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                        <option value="INR">INR</option>
                      </select>
                    </FormItem>
                 </div>
              </div>
              {/* Column 2 */}
              <div className="space-y-4">
                <FormItem icon={<Type className="text-teal-400" />} label="Job Type" htmlFor="job_type"> {/* Name is job_type, maps to 'type' in DB */}
                  <select id="job_type" name="job_type" value={jobDetails.job_type} onChange={handleChange} className="w-full p-2.5 rounded-md bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 text-white">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </FormItem>
                <FormItem icon={<Tag className="text-teal-400" />} label="Skills Required (comma-separated)" htmlFor="skills_required">
                  <Input id="skills_required" name="skills_required" value={jobDetails.skills_required} onChange={handleChange} placeholder="e.g., React, Node.js, SQL" className="bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                </FormItem>
                <FormItem icon={<Activity className="text-teal-400" />} label="Experience Level" htmlFor="experience_level">
                   <select id="experience_level" name="experience_level" value={jobDetails.experience_level} onChange={handleChange} className="w-full p-2.5 rounded-md bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 text-white">
                    <option value="Entry">Entry Level</option>
                    <option value="Junior">Junior Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead/Manager</option>
                    <option value="Executive">Executive</option>
                  </select>
                </FormItem>
                 <div className="flex items-center space-x-2 pt-2">
                    <input type="checkbox" id="is_active" name="is_active" checked={jobDetails.is_active} onChange={handleChange} className="h-4 w-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500 bg-gray-700" />
                    <Label htmlFor="is_active" className="text-gray-300">Make this job listing active immediately</Label>
                </div>
              </div>
               {/* Full Width Description */}
              <div className="md:col-span-2 space-y-1">
                 <Label htmlFor="description" className="text-gray-300 flex items-center"><FilePlus className="w-5 h-5 mr-2 text-teal-400"/>Job Description *</Label>
                <Textarea id="description" name="description" value={jobDetails.description} onChange={handleChange} rows={8} required placeholder="Provide a detailed job description, responsibilities, and requirements..." className="bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300">
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                {loading ? 'Posting Job...' : 'Post Job'}
              </Button>
            </CardFooter>
          </Card>
        </motion.form>
      </div>
    </div>
  );
};

const FormItem = ({ icon, label, htmlFor, children, className }) => (
  <div className={`space-y-1 ${className || ''}`}>
    <Label htmlFor={htmlFor} className="text-gray-300 flex items-center">
      {React.cloneElement(icon, { className: `w-5 h-5 mr-2 flex-shrink-0 ${icon.props.className}` })}
      {label}
    </Label>
    {children}
  </div>
);


export default RecruiterPostJobPage;
