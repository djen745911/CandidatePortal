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
      ? "bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors backdrop-blur-sm"
      : "text-gray-300 hover:bg-white/5 hover:text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <nav className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  CandidatePortal
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-1">
                <Link to="/" className={getNavLinkClass("/")}>
                  <Home className="mr-2 h-4 w-4" /> Home
                </Link>
                <Link to="/jobs" className={getNavLinkClass("/jobs")}>
                  <Briefcase className="mr-2 h-4 w-4" /> Jobs
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {profile?.role === 'candidate' && (
                    <Link to="/candidate" className={getNavLinkClass("/candidate")}>
                      <UserCircle className="mr-2 h-4 w-4" /> My Space
                    </Link>
                  )}
                  {profile?.role === 'recruiter' && (
                    <Link to="/recruiter/dashboard" className={getNavLinkClass("/recruiter/dashboard")}>
                      <LayoutGrid className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  )}
                  <div className="pl-4 border-l border-white/10">
                    <span className="text-sm text-indigo-300 mr-4">
                      {profile?.full_name || user.email}
                    </span>
                    <Button 
                      onClick={signOut} 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" className="text-indigo-300 hover:bg-indigo-500/20">
                      <LogIn className="mr-2 h-4 w-4" /> Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="ghost" className="text-purple-300 hover:bg-purple-500/20">
                      <UserPlus className="mr-2 h-4 w-4" /> Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              {user ? (
                <Button 
                  onClick={signOut} 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-300 hover:bg-red-500/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              ) : (
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-indigo-300 hover:bg-indigo-500/20"
                  >
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

      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CandidatePortal. All rights reserved.</p>
          <p className="text-sm mt-1">Connecting talent with opportunity</p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
};

export default Layout;