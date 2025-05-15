import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, authOpLoading, user, profile: profileFromContext, loading: authContextLoading } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isRecruiterLogin = location.pathname.includes('/recruiter/login');

  const handleSuccessfulLogin = (userProfile) => {
    if (!userProfile) {
      toast({ title: "Login Issue", description: "Could not verify user role. Please try again or contact support.", variant: "destructive" });
      return;
    }

    if (isRecruiterLogin) {
      if (userProfile.role === 'recruiter') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        toast({ title: "Access Denied", description: "You are not authorized as a recruiter.", variant: "destructive" });
        // Potentially sign out user if they tried to access wrong login page
      }
    } else { // Candidate login
      if (userProfile.role === 'candidate') {
        navigate('/candidate/area', { replace: true }); 
      } else if (userProfile.role === 'recruiter') {
         toast({ title: "Recruiter Account", description: "Please use the recruiter login.", variant: "default" });
         navigate('/recruiter/login', { replace: true });
      } else {
        toast({ title: "Login Issue", description: "Could not determine user role. Please contact support.", variant: "destructive" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing Fields", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }
    await signIn(email, password);
    // Redirection is handled by the useEffect below, which waits for profileFromContext.
  };
  
  useEffect(() => {
    // This effect handles redirection after profile is loaded post-login attempt
    // or if user is already logged in and tries to access /login
    if (user && profileFromContext) {
      handleSuccessfulLogin(profileFromContext);
    }
  }, [user, profileFromContext, navigate, location.pathname]);


  if (authContextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center p-4">
        <Loader2 className="h-16 w-16 text-white animate-spin" />
      </div>
    );
  }

  // If user is already logged in (and profile is loaded), redirect them from login page
  if (user && profileFromContext) {
    const targetPath = profileFromContext.role === 'candidate' ? '/candidate/area' : 
                       profileFromContext.role === 'recruiter' ? '/recruiter/dashboard' : '/';
    return <Navigate to={targetPath} replace />;
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1}} transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}>
              <LogIn className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isRecruiterLogin ? 'Recruiter Login' : 'Candidate Login'}
            </CardTitle>
            <CardDescription>
              {isRecruiterLogin ? 'Access your recruiter dashboard.' : 'Welcome back! Sign in to continue.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50 focus:bg-white"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105" disabled={authOpLoading}>
                {authOpLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-600">
              {isRecruiterLogin ? "Not a recruiter? " : "Don't have an account? "}
              <Link to={isRecruiterLogin ? "/register" : "/register"} className="font-medium text-indigo-600 hover:underline">
                {isRecruiterLogin ? "Register as Candidate" : "Sign up"}
              </Link>
            </p>
            {isRecruiterLogin && (
              <p className="text-sm text-gray-600">
                Candidate?{" "}
                <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                  Login here
                </Link>
              </p>
            )}
            {!isRecruiterLogin && (
               <p className="text-sm text-gray-600">
                Recruiter?{" "}
                <Link to="/recruiter/login" className="font-medium text-indigo-600 hover:underline">
                  Login here
                </Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;