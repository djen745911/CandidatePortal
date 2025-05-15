
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Download, UserCheck, UserX, Mail, Briefcase, Eye, Loader2 } from 'lucide-react';

const ApplicantCard = ({ applicant, index, statusColors, getResumeUrl, updateApplicationStatus, actionLoading }) => {
  const appStatusColor = statusColors[applicant.status] || statusColors.default;

  const handleStatusUpdate = (newStatus) => {
    if (!actionLoading) {
      updateApplicationStatus(applicant.id, newStatus);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700 hover:border-cyan-600/70 transition-colors duration-300 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
            <Avatar>
              <AvatarImage src={applicant.candidate?.avatar_url || undefined} alt={applicant.candidate?.full_name} />
              <AvatarFallback>{applicant.candidate?.full_name?.substring(0,2).toUpperCase() || 'N/A'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-cyan-300">{applicant.candidate?.full_name || 'N/A'}</CardTitle>
              <a href={`mailto:${applicant.candidate?.email}`} className="text-xs text-teal-400 hover:underline flex items-center">
                <Mail className="w-3 h-3 mr-1"/>{applicant.candidate?.email || 'No email'}
              </a>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${appStatusColor}`}>
            {applicant.status || 'Unknown'}
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-400">Applied: {new Date(applicant.applied_at).toLocaleDateString()}</p>
          {applicant.resume?.storage_path && (
            <a href={getResumeUrl(applicant.resume.storage_path)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
              <Button variant="outline" size="sm" className="border-sky-500 text-sky-300 hover:bg-sky-500 hover:text-white">
                 <Download className="mr-1.5 h-4 w-4" /> {applicant.resume.file_name || 'View Resume'}
              </Button>
            </a>
          )}
          {!applicant.resume?.storage_path && <p className="text-sm text-yellow-400 flex items-center"><FileText className="mr-1.5 h-4 w-4"/>No resume uploaded.</p>}
          {applicant.cover_letter && (
              <details className="text-sm text-gray-300">
                  <summary className="cursor-pointer hover:text-cyan-300">View Cover Letter</summary>
                  <p className="mt-2 p-3 bg-gray-700/50 rounded-md whitespace-pre-line">{applicant.cover_letter}</p>
              </details>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-gray-700/50">
          <Button onClick={() => handleStatusUpdate('reviewing')} disabled={actionLoading} variant="outline" size="sm" className="border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-white">
              {actionLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/> : <Eye className="mr-1.5 h-4 w-4" />} Mark Reviewing
          </Button>
           <Button onClick={() => handleStatusUpdate('interviewing')} disabled={actionLoading} variant="outline" size="sm" className="border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white">
              {actionLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/> : <UserCheck className="mr-1.5 h-4 w-4" />} Mark Interviewing
          </Button>
          <Button onClick={() => handleStatusUpdate('hired')} disabled={actionLoading} variant="outline" size="sm" className="border-green-500 text-green-300 hover:bg-green-500 hover:text-white">
              {actionLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/> : <Briefcase className="mr-1.5 h-4 w-4" />} Mark Hired
          </Button>
          <Button onClick={() => handleStatusUpdate('rejected')} disabled={actionLoading} variant="outline" size="sm" className="border-red-500 text-red-300 hover:bg-red-500 hover:text-white">
              {actionLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/> : <UserX className="mr-1.5 h-4 w-4" />} Mark Rejected
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ApplicantCard;
