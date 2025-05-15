import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ApplicantFilters = ({ filters, setFilters }) => {
  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  // Placeholder for skill/experience filters - to be implemented if backend supports it
  // const handleSkillChange = (e) => {
  //   setFilters(prev => ({ ...prev, skills: e.target.value }));
  // };
  // const handleExperienceChange = (e) => {
  //   setFilters(prev => ({ ...prev, experience: e.target.value }));
  // };

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="mb-8 p-6 bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl"
    >
        <h2 className="text-xl font-semibold text-cyan-200 mb-4 flex items-center"><Filter className="mr-2 h-5 w-5"/>Filter Applicants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 
            <Input 
              placeholder="Filter by skills..." 
              value={filters.skills || ''} 
              onChange={handleSkillChange} 
              className="bg-gray-700 border-gray-600 focus:border-cyan-500 text-white" 
            />
            <Input 
              placeholder="Filter by experience..." 
              value={filters.experience || ''} 
              onChange={handleExperienceChange} 
              className="bg-gray-700 border-gray-600 focus:border-cyan-500 text-white" 
            /> 
            */}
            <select 
              value={filters.status} 
              onChange={handleStatusChange} 
              className="p-2.5 rounded-md bg-gray-700 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 text-white"
            >
                <option value="">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="reviewing">Reviewing</option>
                <option value="interviewing">Interviewing</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
            </select>
        </div>
    </motion.div>
  );
};

export default ApplicantFilters;