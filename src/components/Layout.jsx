
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, LogIn, UserPlus, LogOut, Settings, Briefcase, UserCircle, LayoutGrid } from 'lucide-react';

const Layout = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const getNavLinkClass = (path) => {
    return location.pathname === path 
      ? "bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  CandidatePortal
                </span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className={getNavLinkClass("/")}>
                  <Home className="mr-1 h-5 w-5" /> Home
                </Link>
                <Link to="/jobs" className={getNavLinkClass("/jobs")}>
                  <Briefcase className="mr-1 h-5 w-5" /> Jobs
                </Link>
                {user ? (
                  <>
                    {profile?.role === 'candidate' && (
                      <Link to="/candidate/area" className={getNavLinkClass("/candidate/area")}>
                        <UserCircle className="mr-1 h-5 w-5" /> My Area
                      </Link>
                    )}
                    {profile?.role === 'recruiter' && (
                      <Link to="/recruiter/dashboard" className={getNavLinkClass("/recruiter/dashboard")}>
                        <LayoutGrid className="mr-1 h-5 w-5" /> Dashboard
                      </Link>
                    )}
                    <Button onClick={signOut} variant="ghost" className="text-red-300 hover:bg-red-500/20 hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium">
                      <LogOut className="mr-1 h-5 w-5" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={getNavLinkClass("/login")}>
                      <LogIn className="mr-1 h-5 w-5" /> Login
                    </Link>
                    <Link to="/register" className={getNavLinkClass("/register")}>
                      <UserPlus className="mr-1 h-5 w-5" /> Register
                    </Link>
                  </>
                )}
              </div>
            </div>
             <div className="md:hidden flex items-center">
              {user ? (
                 <Button onClick={signOut} variant="ghost" size="sm" className="text-red-300 hover:bg-red-500/20 hover:text-red-200">
                    <LogOut className="h-5 w-5" />
                  </Button>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-indigo-300 hover:bg-indigo-700 hover:text-white">
                    <LogIn className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
