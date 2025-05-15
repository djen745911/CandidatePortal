import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Briefcase, UserPlus, LogIn } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex flex-col items-center justify-center p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
          Candidate Portal
        </h1>
        <p className="text-xl md:text-2xl text-indigo-200 max-w-2xl mx-auto">
          Discover your next career opportunity or find the perfect talent for your team.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "backOut" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
      >
        <FeatureCard
          icon={<Briefcase className="w-12 h-12 text-purple-300" />}
          title="Browse Jobs"
          description="Explore a wide range of job openings from top companies."
          linkTo="/jobs"
          delay={0.4}
        />
        <FeatureCard
          icon={<UserPlus className="w-12 h-12 text-indigo-300" />}
          title="Candidate Area"
          description="Register or login to manage your applications and profile."
          linkTo="/login"
          delay={0.6}
        />
        <FeatureCard
          icon={<LogIn className="w-12 h-12 text-blue-300" />}
          title="Recruiter Hub"
          description="Access tools to post jobs and manage applicants."
          linkTo="/recruiter/login"
          delay={0.8}
        />
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-16 text-center text-indigo-300 text-sm"
      >
        <p>&copy; {new Date().getFullYear()} Candidate Portal. All rights reserved.</p>
        <p>Powered by Hostinger & Supabase</p>
      </motion.footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, linkTo, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="flex justify-center mb-6">{icon}</div>
    <h2 className="text-2xl font-semibold mb-3 text-center">{title}</h2>
    <p className="text-indigo-200 mb-6 text-center">{description}</p>
    <Link to={linkTo} className="block w-full">
      <Button variant="outline" className="w-full bg-transparent border-indigo-300 text-indigo-100 hover:bg-indigo-500 hover:text-white transition-colors">
        Go to {title}
      </Button>
    </Link>
  </motion.div>
);

export default HomePage;