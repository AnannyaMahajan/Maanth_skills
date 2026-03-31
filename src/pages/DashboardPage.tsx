import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Store, 
  User, 
  Settings, 
  ArrowRightLeft, 
  Palette, 
  Code, 
  Languages, 
  ChevronRight, 
  Plus, 
  Search, 
  Sparkles,
  Calendar,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/db';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [noteCount, setNoteCount] = useState<number | null>(null);
  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const [skillHistory, setSkillHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [count, swaps, history] = await Promise.all([
          db.notes.count(user.id),
          db.swap_requests.list(user.id).catch(() => [
            { title: 'Digital Illustration for SEO Writing', with_user_name: 'Sarah Jenkins', status: 'Accepted', category: 'design' },
            { title: 'React Mentorship for Pottery Lessons', with_user_name: 'David K.', status: 'Pending', category: 'code' },
            { title: 'Mandarin Practice for UI Design', with_user_name: 'Li Wei', status: 'Accepted', category: 'languages' }
          ]),
          db.skill_history.list(user.id).catch(() => [
            { skill_name: 'Digital Illustration', participant_name: 'Sarah Jenkins', status: 'Completed', date: 'Oct 12, 2024' },
            { skill_name: 'SEO Writing', participant_name: 'Sarah Jenkins', status: 'Completed', date: 'Oct 12, 2024' },
            { skill_name: 'Pottery Basics', participant_name: 'David K.', status: 'Cancelled', date: 'Sep 28, 2024' },
            { skill_name: 'React Mentorship', participant_name: 'David K.', status: 'In Progress', date: 'Ongoing' },
          ])
        ]);
        setNoteCount(count);
        setSwapRequests(swaps);
        setSkillHistory(history);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const subscription = supabase
      .channel('dashboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getIcon = (category: string) => {
    switch (category) {
      case 'design': return Palette;
      case 'code': return Code;
      case 'languages': return Languages;
      default: return Sparkles;
    }
  };

  const getColor = (category: string) => {
    switch (category) {
      case 'design': return 'bg-primary-container text-on-primary-container';
      case 'code': return 'bg-tertiary-container text-on-tertiary-container';
      case 'languages': return 'bg-primary-container text-on-primary-container';
      default: return 'bg-secondary-container text-on-secondary-container';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return CheckCircle2;
      case 'Cancelled': return XCircle;
      case 'In Progress': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'Cancelled': return 'text-red-600 bg-red-50';
      case 'In Progress': return 'text-blue-600 bg-blue-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-surface-container-low flex flex-col h-full border-r-0">
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 text-primary bg-surface-container-highest rounded-xl font-bold transition-all duration-300">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/marketplace" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-medium transition-all duration-300">
            <Store size={20} />
            <span>Marketplace</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-medium transition-all duration-300">
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-medium transition-all duration-300">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="p-8">
          <Link 
            to="/marketplace"
            className="w-full py-4 bg-secondary-container text-on-secondary-container rounded-full font-bold text-sm tracking-wide hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRightLeft size={18} />
            Exchange Skill
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-surface-bright">
        {/* Header / Welcome */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-12 pt-12 pb-8 flex justify-between items-end"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-2">Welcome back</p>
            <h2 className="text-5xl font-extrabold text-primary tracking-tighter">
              {profile?.full_name?.split(' ')[0] || 'User'}.
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border-2 border-primary/10">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={24} className="text-primary" />
              )}
            </div>
          </div>
        </motion.header>

        {/* Bento Grid Layout */}
        <div className="px-12 pb-12 grid grid-cols-12 gap-8">
          {/* Left Column: Active Swap Requests */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-12 lg:col-span-8 space-y-8"
          >
            {/* Total Notes Card */}
            <div className="bg-surface-container-low rounded-xl p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">Total Notes</h3>
                  <p className="text-sm text-on-surface-variant">Your total count of notes</p>
                </div>
              </div>
              <div className="text-right">
                {loading ? (
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Loading...</span>
                ) : (
                  <span className="text-4xl font-black text-primary">{noteCount !== null ? noteCount : 0}</span>
                )}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary">Active Swap Requests</h3>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {swapRequests.length} Total
                </span>
              </div>
              <div className="space-y-4">
                {swapRequests.map((swap, i) => {
                  const Icon = getIcon(swap.category);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <Link 
                        to="/chat"
                        className="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between group hover:bg-surface-bright transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getColor(swap.category)}`}>
                            <Icon size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface">{swap.title}</h4>
                            <p className="text-sm text-on-surface-variant">with {swap.with_user_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full ${
                            swap.status === 'Accepted' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {swap.status}
                          </span>
                          <ChevronRight size={20} className="text-outline-variant group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* My Skills Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-container-low p-8 rounded-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Offered Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {['UI Design', 'Design Systems', 'Prototyping'].map(skill => (
                    <span key={skill} className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold">{skill}</span>
                  ))}
                  <button className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-surface-container-low p-8 rounded-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Wanted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {['Pottery', 'Mandarin', 'SEO'].map(skill => (
                    <span key={skill} className="px-4 py-2 bg-surface-container-highest text-primary rounded-full text-xs font-bold">{skill}</span>
                  ))}
                  <button className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Skill Swap History Section */}
            <div className="bg-surface-container-low rounded-xl p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <History size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-primary">Skill Swap History</h3>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {skillHistory.length} Total
                </span>
              </div>
              
              <div className="space-y-4">
                {skillHistory.map((entry, i) => {
                  const StatusIcon = getStatusIcon(entry.status);
                  return (
                    <div 
                      key={i}
                      className="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between group hover:bg-surface-bright transition-all duration-300 border border-transparent hover:border-outline-variant/30"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                           <img 
                             src={`https://i.pravatar.cc/100?u=${entry.participant_name}`} 
                             alt={entry.participant_name} 
                             className="w-full h-full object-cover"
                             referrerPolicy="no-referrer"
                           />
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{entry.skill_name}</h4>
                          <p className="text-sm text-on-surface-variant">with {entry.participant_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Date</p>
                          <p className="text-xs font-bold text-on-surface">{entry.date}</p>
                        </div>
                        <div className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full",
                          getStatusColor(entry.status)
                        )}>
                          <StatusIcon size={14} />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {entry.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button className="mt-8 w-full py-4 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all flex items-center justify-center gap-2">
                Download Full Report (PDF)
              </button>
            </div>
          </motion.section>

          {/* Right Column: Session Schedule */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-12 lg:col-span-4 space-y-8"
          >
            <div className="bg-primary text-on-primary p-8 rounded-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6">Session Schedule</h3>
                <div className="space-y-6">
                  {[
                    { date: '24', month: 'Oct', title: 'UI Design Workshop', time: '14:00 • Sarah Jenkins' },
                    { date: '26', month: 'Oct', title: 'Mandarin Basics', time: '10:30 • Li Wei' },
                    { date: '29', month: 'Oct', title: 'SEO Fundamentals', time: '16:00 • Sarah Jenkins' }
                  ].map((session, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-black opacity-60">{session.month}</p>
                        <p className="text-xl font-black">{session.date}</p>
                      </div>
                      <div className="flex-1 border-l border-on-primary/20 pl-4">
                        <h4 className="font-bold text-sm">{session.title}</h4>
                        <p className="text-xs opacity-70">{session.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-10 w-full py-3 bg-on-primary text-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-bright transition-colors">
                  View Calendar
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-container rounded-full blur-3xl opacity-50" />
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-on-secondary-container" />
              </div>
              <h4 className="font-bold text-primary mb-2">New Match Found!</h4>
              <p className="text-xs text-on-surface-variant mb-6">We found an expert in French Cooking looking for UI help.</p>
              <button className="text-primary font-bold text-xs uppercase tracking-widest underline underline-offset-4 decoration-2">
                Explore Profile
              </button>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
