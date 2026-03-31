import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Globe, Link as LinkIcon, Mail, Pencil, Camera, 
  CheckCircle2, BarChart3, Zap, Database, Image as ImageIcon, 
  Palette, Compass, ArrowUpRight, Settings, MessageSquare, 
  ShieldCheck, Clock, Shield, BookOpen, Github, Loader2, Globe as GlobeIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile, getSignedUrl, deleteFile } from '../lib/storage';
import { db } from '../lib/db';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Edit form state
  const [editData, setEditData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    college: '',
    social_links: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  });

  useEffect(() => {
    if (profile) {
      setEditData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        college: profile.college || '',
        social_links: {
          linkedin: profile.social_links?.linkedin || '',
          github: profile.social_links?.github || '',
          portfolio: profile.social_links?.portfolio || ''
        }
      });
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const { path, url } = await uploadFile(file, user.uid, 'profile', 'avatar');
      await db.profiles.update(user.uid, { avatar_url: path });
      await refreshProfile();
      toast.success('Avatar updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await db.profiles.update(user.uid, {
        ...editData,
        updated_at: new Date().toISOString()
      });
      await refreshProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const offeredSkills = profile.skills_to_offer || [];
  const skillsWanted = profile.skills_to_learn || [];

  const filteredOfferedSkills = offeredSkills.filter(skill => 
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSkillsWanted = skillsWanted.filter(skill => 
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-bright py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Profile Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-12 items-start md:items-end"
        >
          <div className="relative group">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden bg-surface-container shadow-2xl relative">
              <img 
                src={profile.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop"} 
                alt={profile.full_name} 
                className={cn(
                  "w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700",
                  loading && "opacity-50"
                )}
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={handleAvatarClick}
                disabled={loading}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white disabled:opacity-50"
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera size={32} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {loading ? 'Uploading...' : 'Update Avatar'}
                  </span>
                </div>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            {profile.onboarding_completed && (
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-secondary text-on-secondary rounded-2xl flex items-center justify-center shadow-lg z-10">
                <CheckCircle2 size={24} />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-[0.2em]">
                  {profile.intent === 'teach' ? 'Expert Mentor' : profile.intent === 'swap' ? 'Skill Swapper' : 'Learner'}
                </p>
                {profile.onboarding_completed && (
                  <div className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[9px] font-black uppercase tracking-widest">
                    Verified Member
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4 max-w-md">
                  <input 
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                    className="text-4xl font-black text-primary tracking-tighter leading-none bg-transparent border-b-2 border-primary outline-none w-full"
                    placeholder="Full Name"
                  />
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="font-bold">@</span>
                    <input 
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({...editData, username: e.target.value})}
                      className="bg-transparent border-b border-on-surface-variant outline-none w-full"
                      placeholder="username"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-6xl md:text-7xl font-black text-primary tracking-tighter leading-none">
                    {profile.full_name}
                  </h1>
                  <p className="text-sm font-bold text-on-surface-variant">@{profile.username}</p>
                </>
              )}

              {isEditing ? (
                <textarea 
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  className="text-xl text-on-surface-variant font-medium max-w-xl leading-relaxed bg-transparent border-2 border-surface-container-high rounded-xl p-4 w-full outline-none focus:border-primary"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-xl text-on-surface-variant font-medium max-w-xl leading-relaxed">
                  {profile.bio || "No bio added yet."}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-primary">
              {profile.social_links?.portfolio && (
                <a href={profile.social_links.portfolio} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform flex items-center gap-2 group">
                  <Globe size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Website</span>
                </a>
              )}
              {profile.social_links?.linkedin && (
                <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform flex items-center gap-2 group">
                  <LinkIcon size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">LinkedIn</span>
                </a>
              )}
              {profile.social_links?.github && (
                <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform flex items-center gap-2 group">
                  <Github size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">GitHub</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              to="/chat"
              className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg"
            >
              <MessageSquare size={18} />
              Message
            </Link>
            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-full bg-green-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={18} />}
                  Save
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-full border-2 border-surface-container-high text-on-surface-variant font-bold hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-8 py-3 rounded-full border-2 border-primary text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-all"
              >
                <Pencil size={18} />
                Edit Profile
              </button>
            )}
          </div>
        </motion.header>

        {/* Narrative & Impact Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 bg-surface-container-low p-10 rounded-[2rem] space-y-6">
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Location</p>
                <p className="text-xl font-medium text-primary">{profile.location || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">College / Org</p>
                <p className="text-xl font-medium text-primary">{profile.college || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="bg-primary text-on-primary p-10 rounded-[2rem] flex flex-col justify-between min-h-[300px]">
            <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Exchange Impact</p>
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-black">{profile.skills_to_offer?.length || 0}</h2>
                <p className="text-xs uppercase font-bold opacity-60 tracking-widest mt-1">Skills Offered</p>
              </div>
              <div>
                <h2 className="text-5xl font-black">{profile.skills_to_learn?.length || 0}</h2>
                <p className="text-xs uppercase font-bold opacity-60 tracking-widest mt-1">Skills Wanted</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Active Member</span>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-xl"
        >
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant" size={24} />
          <input 
            type="text"
            placeholder="Search through skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-16 py-6 bg-surface-container-low border-2 border-surface-container-high rounded-[2rem] focus:border-primary outline-none transition-all font-bold text-xl text-primary shadow-sm hover:shadow-md"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Skills & Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Skills Offered */}
          <div className="bg-surface-bright border-2 border-surface-container-high p-8 rounded-[2rem] space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-primary">Skills Offered</h3>
              <ArrowUpRight size={20} className="text-on-surface-variant" />
            </div>
            <div className="space-y-3">
              {filteredOfferedSkills.length > 0 ? (
                filteredOfferedSkills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl group hover:bg-surface-container transition-all">
                    <div className="flex items-center gap-4">
                      <Zap size={18} className="text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm">{skill.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {skill.verified && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full">
                          <ShieldCheck size={12} />
                          <span className="text-[9px] font-black uppercase tracking-wider">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant italic p-4">No skills found matching "{searchQuery}"</p>
              )}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="bg-surface-bright border-2 border-surface-container-high p-8 rounded-[2rem] space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-primary">Skills Wanted</h3>
              <Settings size={20} className="text-secondary" />
            </div>
            <div className="space-y-3">
              {filteredSkillsWanted.length > 0 ? (
                filteredSkillsWanted.map((skill) => (
                  <div key={skill} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl group hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer">
                    <BookOpen size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">{skill}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant italic p-4">No skills found matching "{searchQuery}"</p>
              )}
            </div>
          </div>

          {/* Showcase Placeholder */}
          <div className="bg-surface-container-low border-2 border-dashed border-surface-container-highest p-8 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant">
              <ImageIcon size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-primary">Showcase Your Work</h4>
              <p className="text-xs text-on-surface-variant max-w-[180px]">Upload case studies or project artifacts to increase trust.</p>
            </div>
          </div>
        </div>

        {/* Featured Collaboration */}
        <section className="space-y-8">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-[0.2em]">Featured Collaboration</p>
          
          <div className="bg-surface-bright border-2 border-surface-container-high rounded-[2.5rem] overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 space-y-8">
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest rounded-full">Case Study</span>
                  <h2 className="text-5xl font-black text-primary tracking-tight">Berlin Green Nodes</h2>
                  <p className="text-lg text-on-surface-variant leading-relaxed">
                    A collaborative project where I exchanged Urban Planning expertise for Advanced Data Scraping skills. Together we mapped 400+ unused urban plots for community gardening.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full border-2 border-surface-bright object-cover" referrerPolicy="no-referrer" />
                    <div className="w-10 h-10 rounded-full border-2 border-surface-bright bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">+3</div>
                  </div>
                  <p className="text-xs font-bold text-on-surface-variant">Collaborated with Elena R. and 3 others</p>
                </div>
              </div>
              
              <div className="h-80 lg:h-auto overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop" 
                  alt="Berlin Green Nodes" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
