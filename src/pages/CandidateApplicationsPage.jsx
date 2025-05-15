import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Clock, Info, ArrowLeft } from 'lucide-react';

// Dummy data - replace with actual API calls
const dummyApplications = [
  { id: 'app1', jobId: '1', jobTitle: 'Software Engineer', company: 'Tech Solutions Inc.', status: 'Submitted', appliedDate: '2025-05-10' },
  { id: 'app2', jobId: '2', jobTitle: 'Product Manager', company: 'Innovate Hub', status: 'Under Review', appliedDate: '2025-05-05' },
  { id: 'app3', jobId: '3', jobTitle: 'UX Designer', company: 'Creative Designs Co.', status: 'Interview Scheduled', appliedDate: '2025-04-28' },
];

const statusColors = {
  'Submitted': 'text-blue-400 bg-blue-900/30',
  'Under Review': 'text-yellow-400 bg-yellow-900/30',
  'Interview Scheduled': 'text-green-400 bg-green-900/30',
  'Rejected': 'text-red-400 bg-red-900/30',
};

const CandidateApplicationsPage = () => {
  // In a real app, fetch applications for the logged-in candidate
  const applications = dummyApplications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
           <Link to="/candidate/dashboard">
            <Button variant="ghost" className="text-indigo-300 hover:bg-indigo-700/30 hover:text-indigo-100 mb-4">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-indigo-300">My Applications</h1>
          <p className="text-lg text-gray-400">Track the status of your job applications.</p>
        </motion.div>

        {applications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-12"
          >
            <FileText className="mx-auto h-24 w-24 text-gray-600 mb-6" />
            <p className="text-2xl text-gray-400 mb-4">You haven't applied for any jobs yet.</p>
            <Link to="/jobs">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                Browse Jobs
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {applications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700 hover:border-indigo-600 transition-colors duration-300">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-indigo-300">{app.jobTitle}</CardTitle>
                      <p className="text-sm text-purple-400 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />{app.company}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[app.status] || 'text-gray-400 bg-gray-700'}`}>
                      {app.status}
                    </span>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="text-sm text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-2" /> Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                    </div>
                    <Link to={`/jobs/${app.jobId}`}>
                      <Button variant="outline" size="sm" className="border-indigo-500 text-indigo-300 hover:bg-indigo-500 hover:text-white">
                        <Info className="w-4 h-4 mr-2" /> View Job
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateApplicationsPage;