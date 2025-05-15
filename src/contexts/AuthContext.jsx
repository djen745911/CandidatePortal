
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // General loading state for auth initialization and profile fetching
  const [authOpLoading, setAuthOpLoading] = useState(false); // Specific loading for auth operations like signIn/signUp
  const { toast } = useToast();

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, role, avatar_url`)
        .eq('id', userId)
        .single();

      if (error && status !== 406) { 
        console.error('Error fetching profile:', error);
        setProfile(null); 
        return null;
      }
      if (data) {
        setProfile(data);
        return data;
      }
      setProfile(null);
      return null;
    } catch (error) {
      console.error('Catch block: Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    setLoading(true); // Start with loading true
    const getSessionAndProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          toast({ title: "Auth Error", description: "Failed to get session.", variant: "destructive" });
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        console.error("Critical error in getSessionAndProfile:", e);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true); // Set loading true during auth state changes
      try {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch(e){
        console.error("Error in onAuthStateChange handler:", e);
        setUser(null);
        setProfile(null);
      } finally {
         setLoading(false); // Ensure loading is set to false
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [toast, fetchProfile]);


  const value = {
    user,
    profile,
    loading, 
    authOpLoading,
    signIn: async (email, password) => {
      setAuthOpLoading(true);
      let result = { data: null, error: null };
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        result = { data, error };
        if (error) {
          toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        } else if (data.user) {
          // fetchProfile will be called by onAuthStateChange, but calling here can expedite profile availability.
          // However, onAuthStateChange should be the canonical source of truth for profile after auth events.
          // For immediate UI updates, we might rely on onAuthStateChange to set profile and loading.
          toast({ title: "Login Successful", description: "Welcome back!" });
        }
      } catch (e) {
        result.error = e;
        toast({ title: "Login Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
        setAuthOpLoading(false);
      }
      return result; 
    },
    signUp: async (email, password, fullName, role = 'candidate') => {
      setAuthOpLoading(true);
      let result = { data: null, error: null };
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            }
          }
        });
        result = { data, error };
        if (error) {
          toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
           toast({ title: "Registration Info", description: "User already exists. Please log in.", variant: "default" });
        }
        else if (data.user) {
          toast({ title: "Registration Successful", description: "Please check your email to verify your account." });
        }
      } catch (e) {
        result.error = e;
        toast({ title: "Registration Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
        setAuthOpLoading(false);
      }
      return result;
    },
    signOut: async () => {
      setAuthOpLoading(true);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Logged Out", description: "You have been successfully logged out." });
          // setUser(null) and setProfile(null) will be handled by onAuthStateChange
        }
      } catch (e) {
        toast({ title: "Logout Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
        setAuthOpLoading(false);
      }
    },
    fetchProfile // Expose fetchProfile if needed elsewhere
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
