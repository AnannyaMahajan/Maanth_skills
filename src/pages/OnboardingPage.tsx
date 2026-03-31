import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db, Profile } from '../lib/db';
import { geminiService } from '../services/geminiService';
import { 
  User, 
  BookOpen, 
  Repeat, 
  GraduationCap, 
  CheckCircle, 
  Upload, 
  FileText, 
  Brain, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  Linkedin,
  Github,
  Globe,
  MapPin,
  Building,
  BadgeCheck,
  AlertCircle,
  Loader2,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

type Step = 'personal' | 'intent' | 'skills_learn' | 'skills_offer' | 'complete';

interface SkillOffer {
  name: string;
  verified: boolean;
  verification_type: 'certificate' | 'assessment' | 'none';
  verification_date?: string;
  temp_id: string;
}

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('personal');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    full_name: profile?.full_name || '',
    bio: '',
    location: '',
    college: '',
    social_links: {
      linkedin: '',
      github: '',
      portfolio: ''
    },
    intent: '' as 'learn' | 'swap' | 'teach',
    skills_to_learn: [] as string[],
    skills_to_offer: [] as SkillOffer[]
  });

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const updateFormData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (step === 'personal') {
      if (!formData.username || !formData.full_name) {
        toast.error('Please fill in required fields');
        return;
      }
      setStep('intent');
    } else if (step === 'intent') {
      if (!formData.intent) {
        toast.error('Please select an intent');
        return;
      }
      if (formData.intent === 'learn') {
        setStep('skills_learn');
      } else {
        setStep('skills_offer');
      }
    } else if (step === 'skills_learn' || step === 'skills_offer') {
      if (step === 'skills_learn' && formData.skills_to_learn.length === 0) {
        toast.error('Please add at least one skill you want to learn');
        return;
      }
      if (step === 'skills_offer' && formData.skills_to_offer.length === 0) {
        toast.error('Please add at least one skill you can offer');
        return;
      }
      setStep('complete');
    }
  };

  const finishOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Strip temp_id from skills_to_offer before saving
      const cleanedSkillsOffer = formData.skills_to_offer.map(({ temp_id, ...rest }) => rest);
      
      await db.profiles.update(user.uid, {
        ...formData,
        skills_to_offer: cleanedSkillsOffer,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      });
      await refreshProfile();
      toast.success('Profile setup complete!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error finishing onboarding:', error);
      toast.error(`Failed to save profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'personal':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Personal Information</h2>
              <p className="text-muted-foreground">Let's start with the basics to build your profile.</p>
            </div>

            <div className="grid gap-6 max-w-xl mx-auto">
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-primary/20 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.full_name}
                      onChange={(e) => updateFormData({ full_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => updateFormData({ username: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="johndoe"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio / Tagline</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => updateFormData({ bio: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => updateFormData({ location: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">College / Organization</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.college}
                      onChange={(e) => updateFormData({ college: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Stanford University"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Social Links</label>
                <div className="grid gap-3">
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.social_links.linkedin}
                      onChange={(e) => updateFormData({ social_links: { ...formData.social_links, linkedin: e.target.value } })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.social_links.github}
                      onChange={(e) => updateFormData({ social_links: { ...formData.social_links, github: e.target.value } })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="GitHub URL"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.social_links.portfolio}
                      onChange={(e) => updateFormData({ social_links: { ...formData.social_links, portfolio: e.target.value } })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Portfolio URL"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'intent':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">What are you here for?</h2>
              <p className="text-muted-foreground">Select your primary goal on the platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { id: 'learn', title: 'Want to Learn', desc: 'I want to acquire a new skill', icon: BookOpen, color: 'blue' },
                { id: 'swap', title: 'Want to Swap', desc: 'I have a skill and want to exchange it', icon: Repeat, color: 'orange' },
                { id: 'teach', title: 'Want to Teach', desc: 'I want to offer my skill to others', icon: GraduationCap, color: 'green' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateFormData({ intent: item.id })}
                  className={`relative p-8 rounded-2xl border-2 text-left transition-all hover:shadow-xl group ${
                    formData.intent === item.id 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  {formData.intent === item.id && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'skills_learn':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">What do you want to learn?</h2>
              <p className="text-muted-foreground">Add skills you're interested in acquiring.</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="skill-learn-input"
                  className="flex-1 px-4 py-2 rounded-lg border bg-background outline-none"
                  placeholder="e.g. React, UI Design, Public Speaking"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !formData.skills_to_learn.includes(val)) {
                        updateFormData({ skills_to_learn: [...formData.skills_to_learn, val] });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const el = document.getElementById('skill-learn-input') as HTMLInputElement;
                    const val = el.value.trim();
                    if (val && !formData.skills_to_learn.includes(val)) {
                      updateFormData({ skills_to_learn: [...formData.skills_to_learn, val] });
                      el.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.skills_to_learn.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                    {skill}
                    <button 
                      onClick={() => updateFormData({ skills_to_learn: formData.skills_to_learn.filter(s => s !== skill) })}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'skills_offer':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">What skills can you offer?</h2>
              <p className="text-muted-foreground">List the skills you want to swap or teach.</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="skill-offer-input"
                  className="flex-1 px-4 py-2 rounded-lg border bg-background outline-none"
                  placeholder="e.g. Python, Photography, Guitar"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !formData.skills_to_offer.find(s => s.name === val)) {
                        updateFormData({ 
                          skills_to_offer: [...formData.skills_to_offer, { 
                            name: val, 
                            verified: false, 
                            verification_type: 'none',
                            temp_id: Math.random().toString(36).substr(2, 9)
                          }] 
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const el = document.getElementById('skill-offer-input') as HTMLInputElement;
                    const val = el.value.trim();
                    if (val && !formData.skills_to_offer.find(s => s.name === val)) {
                      updateFormData({ 
                        skills_to_offer: [...formData.skills_to_offer, { 
                          name: val, 
                          verified: false, 
                          verification_type: 'none',
                          temp_id: Math.random().toString(36).substr(2, 9)
                        }] 
                      });
                      el.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  Add
                </button>
              </div>

              <div className="grid gap-3">
                {formData.skills_to_offer.map(skill => (
                  <div key={skill.temp_id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{skill.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateFormData({ skills_to_offer: formData.skills_to_offer.filter(s => s.temp_id !== skill.temp_id) })}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-xl mx-auto py-12"
          >
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">All Set!</h2>
              <p className="text-muted-foreground">Your profile is ready. Welcome to Maanth SkillSwap!</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/50 border text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Status</span>
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 font-bold uppercase">Complete</span>
              </div>
            </div>
            <button 
              onClick={finishOnboarding}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ 
            width: step === 'personal' ? '25%' : 
                   step === 'intent' ? '50%' : 
                   step === 'skills_learn' || step === 'skills_offer' ? '75%' : '100%' 
          }}
        />
      </div>

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      {step !== 'complete' && (
        <footer className="border-t bg-background/80 backdrop-blur-md py-6 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => {
                if (step === 'intent') setStep('personal');
                if (step === 'skills_learn' || step === 'skills_offer') setStep('intent');
              }}
              disabled={step === 'personal'}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              {step === 'skills_learn' || step === 'skills_offer' ? 'Finish' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
