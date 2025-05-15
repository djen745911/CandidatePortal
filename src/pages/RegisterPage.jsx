import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signUp, authOpLoading, user, profile: profileFromContext, loading: authContextLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!fullName.trim()) {
      toast({ title: "Full Name Required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    const { error, data } = await signUp(email, password, fullName);

    if (!error && data.user) {
      // No automatic navigation here, user needs to confirm email.
      // AuthContext will handle user state once confirmed and logged in.
      // If auto-login after signup is desired, that logic would be in AuthContext or here.
    } else if (error) {
      // Toast is handled by AuthContext
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // User already exists, toast handled by AuthContext
      // Potentially navigate to login
      // navigate('/login');
    }
  };

  if (authContextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
        <Loader2 className="h-16 w-16 text-white animate-spin" />
      </div>
    );
  }

  // If user is already logged in (and profile is loaded), redirect them from register page
  if (user && profileFromContext) {
    const targetPath = profileFromContext.role === 'candidate' ? '/candidate/area' : 
                       profileFromContext.role === 'recruiter' ? '/recruiter/dashboard' : '/';
    return <Navigate to={targetPath} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1}} transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}>
              <UserPlus className="mx-auto h-16 w-16 text-teal-600 mb-4" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">Create Account</CardTitle>
            <CardDescription>Join our platform to find your next opportunity.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-white/50 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
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
              <div className="space-y-1">
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
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/50 focus:bg-white"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105" disabled={authOpLoading}>
                {authOpLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:underline">
                Sign In
              </Link>
            </p>
             <p className="text-sm text-gray-600 mt-2">
              Are you a recruiter?{' '}
              <Link to="/recruiter/login" className="font-medium text-teal-600 hover:underline">
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;