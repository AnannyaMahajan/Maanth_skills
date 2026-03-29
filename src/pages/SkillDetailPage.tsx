import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SKILLS } from '../constants';
import { ChevronRight, Star, Clock, Calendar, ArrowRightLeft, Database, Building2, Music, Settings, Layout, Code } from 'lucide-react';

export default function SkillDetailPage() {
  const { id } = useParams();
  const skill = SKILLS.find(s => s.id === id) || SKILLS[0];

  return (
    <div className="bg-[#F5F2ED] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
        >
          <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
          <ChevronRight size={10} />
          <span className="hover:text-primary transition-colors">{skill.category}</span>
          <ChevronRight size={10} />
          <span className="text-primary">{skill.title}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Content Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-8 space-y-16"
          >
            {/* Hero Image & Title Section */}
            <div className="space-y-10">
              <div className="aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden bg-[#002A24] shadow-2xl">
                <img 
                  src={skill.image} 
                  alt={skill.title} 
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className="bg-[#FDD828] text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Available
                  </span>
                  <span className="bg-white/50 backdrop-blur-sm text-on-surface-variant px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-surface-container-high">
                    6 Sessions Left
                  </span>
                </div>
                <h1 className="text-7xl font-black text-[#002A24] tracking-tighter leading-[0.9]">
                  {skill.title}
                </h1>
                <p className="text-xl text-on-surface-variant font-medium leading-relaxed max-w-2xl">
                  {skill.description}
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] space-y-6 shadow-sm border border-surface-container-high">
                <div className="w-12 h-12 bg-[#F5F2ED] rounded-2xl flex items-center justify-center text-primary">
                  <Settings size={24} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-primary">The Approach</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">
                    We won't just design a static logo. I'll teach you how to build dynamic systems using Processing and Midjourney prompts that generate infinite variations of a brand's visual DNA.
                  </p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] space-y-6 shadow-sm border border-surface-container-high">
                <div className="w-12 h-12 bg-[#F5F2ED] rounded-2xl flex items-center justify-center text-primary">
                  <Layout size={24} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-primary">What You'll Learn</h3>
                  <ul className="space-y-3 text-on-surface-variant text-sm font-medium">
                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Algorithmic pattern generation</li>
                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Responsive typography systems</li>
                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> AI-assisted brand storytelling</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Long Description */}
            <article className="space-y-8">
              <h2 className="text-4xl font-black text-primary tracking-tight">About this Offering</h2>
              <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant font-medium">
                <p>
                  In the "Digital Atelier" of the modern era, brands are no longer static images in a style guide. They are dynamic entities. This exchange focuses on bridging the gap between traditional graphic design principles and the frontier of generative technology.
                </p>
                <p>
                  Whether you are a seasoned creative director or a curious developer, this session is tailored to demystify how math and art collide. We will spend 2 hours deep-diving into your specific project or exploring a hypothetical brand together.
                </p>
              </div>
            </article>

            {/* Practitioner Looking For Section */}
            <div className="bg-[#002A24] text-white p-12 rounded-[3rem] relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-10">{skill.practitioner.name.split(' ')[0]} is looking to learn...</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { icon: Database, name: 'Knowledge Graphs' },
                    { icon: Layout, name: 'System Architecture' },
                    { icon: Music, name: 'Music Theory' }
                  ].map((item) => (
                    <div key={item.name} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                      <item.icon className="block mb-4 text-[#FDD828]" size={24} />
                      <span className="font-bold text-lg leading-tight block">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </div>
          </motion.div>

          {/* Sidebar / Action Column */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-4 space-y-10 sticky top-28"
          >
            {/* Action Card */}
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-primary/5 border border-surface-container-high">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] block mb-2">Duration</span>
                  <span className="text-3xl font-black text-primary italic">2.5 Hours</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] block mb-2">Value</span>
                  <span className="text-3xl font-black text-primary">Swap Only</span>
                </div>
              </div>
              <div className="space-y-4">
                <Link
                  to={`/marketplace/${skill.id}/request`}
                  className="w-full bg-[#FDD828] text-primary py-5 rounded-full font-black text-xl hover:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-secondary/20"
                >
                  Request Swap
                  <ArrowRightLeft size={24} />
                </Link>
                <button className="w-full bg-[#002A24] text-white py-5 rounded-full font-black text-xl hover:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20">
                  Book Session
                  <Calendar size={24} />
                </button>
              </div>
              <p className="mt-8 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Average response time: <span className="text-primary">2 hours</span>
              </p>
            </div>

            {/* Practitioner Profile */}
            <div className="bg-white p-10 rounded-[3rem] text-center border border-surface-container-high shadow-sm">
              <div className="relative w-28 h-28 mx-auto mb-6">
                <img 
                  src={skill.practitioner.avatar} 
                  alt={skill.practitioner.name} 
                  className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-[#4ADE80] border-4 border-white rounded-full" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-1">{skill.practitioner.name}</h3>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-8">{skill.practitioner.role}</p>
              
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <span className="block text-2xl font-black text-primary">{skill.practitioner.swaps}</span>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Swaps</span>
                </div>
                <div className="w-px h-10 bg-surface-container-high" />
                <div className="text-center">
                  <span className="block text-2xl font-black text-primary">{skill.practitioner.rating}</span>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Rating</span>
                </div>
              </div>

              <p className="text-on-surface-variant text-sm leading-relaxed mb-8 italic font-medium">
                "I believe the best way to learn is to teach. I'm currently obsessed with how data structures can inform visual aesthetics."
              </p>
              
              <button className="text-primary font-black text-xs uppercase tracking-[0.2em] border-b-2 border-primary hover:opacity-70 transition-all pb-1">
                View Full Profile
              </button>
            </div>

            {/* Social Proof */}
            <div className="px-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-6 text-center">Trusted By</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {['Creative Lab', 'Indie Hackers', 'UI Collective'].map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-surface-container-high shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
