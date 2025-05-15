import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserCircle, UploadCloud, Save, ArrowLeft, Trash2, FileText } from 'lucide-react';

const CandidateProfilePage = () => {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [existingResumes, setExistingResumes] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);


  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || null);
    }
    if (user) {
      fetchResumes();
    }
    if (!authLoading) setPageLoading(false);
  }, [profile, user, authLoading]);

  const fetchResumes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('resumes')
      .select('id, file_name, uploaded_at, storage_path')
      .eq('candidate_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      toast({ title: "Error fetching resumes", description: error.message, variant: "destructive" });
    } else {
      setExistingResumes(data || []);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);
    const updates = {
      id: user.id,
      full_name: fullName,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      toast({ title: "Profile Update Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      fetchProfile(user.id); 
    }
    setUploading(false);
  };
  
  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const updates = {
        id: user.id,
        avatar_url: publicUrl,
        updated_at: new Date(),
      };
      let { error: updateError } = await supabase.from('profiles').upsert(updates);
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      fetchProfile(user.id);
      toast({ title: "Avatar Updated", description: "Your avatar has been changed." });

    } catch (error) {
      toast({ title: "Avatar Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCvUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      toast({ title: "No file selected", description: "Please select a CV to upload.", variant: "destructive" });
      return;
    }
    const file = event.target.files[0];
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid File Type", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) { 
        toast({ title: "File Too Large", description: "CV file size should not exceed 5MB.", variant: "destructive" });
        return;
    }
    setCvFile(file); 
    
    try {
        setCvUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `cv-${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        const { error: dbError } = await supabase.from('resumes').insert({
            candidate_id: user.id,
            file_name: file.name,
            storage_path: filePath,
            file_type: file.type
        });

        if (dbError) throw dbError;

        toast({ title: "CV Uploaded", description: `${file.name} has been successfully uploaded.` });
        setCvFile(null); 
        document.getElementById('cv-upload-input').value = ''; 
        fetchResumes(); 

    } catch (error) {
        toast({ title: "CV Upload Failed", description: error.message, variant: "destructive" });
    } finally {
        setCvUploading(false);
    }
  };

  const deleteResume = async (resumeId, storagePath) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
        const { error: storageError } = await supabase.storage.from('resumes').remove([storagePath]);
        if (storageError) throw storageError;

        const { error: dbError } = await supabase.from('resumes').delete().eq('id', resumeId);
        if (dbError) throw dbError;
        
        toast({ title: "Resume Deleted", description: "The resume has been successfully deleted." });
        fetchResumes(); 
    } catch (error) {
        toast({ title: "Error Deleting Resume", description: error.message, variant: "destructive" });
    }
  };


  if (pageLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><p>Loading profile...</p></div>;
  }

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
          <h1 className="text-4xl font-bold text-indigo-300">Manage Your Profile</h1>
          <p className="text-lg text-gray-400">Keep your information and CV up-to-date.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-300 flex items-center">
                  <UserCircle className="w-8 h-8 mr-3 text-purple-400" /> Personal Information
                </CardTitle>
                <CardDescription className="text-gray-400">Update your name and avatar.</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        {avatarUrl ? (
                            <img-replace src={avatarUrl} alt="User Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg" />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-indigo-500">
                                <UserCircle className="w-20 h-20 text-gray-500" />
                            </div>
                        )}
                        <Label htmlFor="avatar-upload-input" className="cursor-pointer text-indigo-400 hover:text-indigo-300 transition-colors">
                            {uploading ? 'Uploading...' : 'Change Avatar'}
                        </Label>
                        <Input id="avatar-upload-input" type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                    </div>

                  <div>
                    <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-gray-700 border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email (Cannot be changed)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-700/50 border-gray-600 cursor-not-allowed"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={uploading || authLoading} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    <Save className="w-5 h-5 mr-2" /> {uploading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-300 flex items-center">
                  <UploadCloud className="w-8 h-8 mr-3 text-purple-400" /> Manage CV / Resume
                </CardTitle>
                <CardDescription className="text-gray-400">Upload or update your CV (PDF or DOCX, max 5MB).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="cv-upload-input" className="text-gray-300">Upload New CV</Label>
                  <Input
                    id="cv-upload-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvUpload}
                    disabled={cvUploading}
                    className="bg-gray-700 border-gray-600 file:text-indigo-300 file:bg-gray-600 file:border-0 file:rounded file:px-3 file:py-1.5 file:mr-3 hover:file:bg-indigo-500"
                  />
                   {cvUploading && <p className="text-sm text-indigo-400 mt-2">Uploading CV...</p>}
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-300 mb-3">Uploaded Resumes:</h4>
                    {existingResumes.length > 0 ? (
                        <ul className="space-y-3">
                            {existingResumes.map(resume => (
                                <li key={resume.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-md">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-5 h-5 text-indigo-400" />
                                        <a 
                                            href={supabase.storage.from('resumes').getPublicUrl(resume.storage_path).data.publicUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-300 hover:underline truncate max-w-[150px] sm:max-w-[200px]"
                                            title={resume.file_name}
                                        >
                                            {resume.file_name}
                                        </a>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => deleteResume(resume.id, resume.storage_path)} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No resumes uploaded yet.</p>
                    )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;