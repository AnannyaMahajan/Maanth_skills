import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { SKILLS } from '../constants';
import { ArrowLeft, ChevronDown, Info, Send } from 'lucide-react';

export default function SwapRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const skill = SKILLS.find(s => s.id === id) || SKILLS[0];
  
  const [selectedSkill, setSelectedSkill] = React.useState('Professional Product Photography');
  const [message, setMessage] = React.useState('');

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-all mb-16"
        >
          <ArrowLeft size={16} />
          Back to Listings
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Context */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 bg-[#FDD828] text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                Requesting Swap
              </span>
              <h1 className="text-7xl font-black text-[#002A24] tracking-tighter leading-[0.9]">
                {skill.title}
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-md">
                You're initiating a skill exchange with <span className="font-bold text-primary">{skill.practitioner.name}</span>. {skill.practitioner.name.split(' ')[0]} is a master potter with 12 years of experience in reduction firing.
              </p>
            </div>

            {/* Practitioner Card */}
            <div className="bg-white/40 backdrop-blur-sm p-8 rounded-[2.5rem] inline-flex flex-col gap-6 border border-white/20">
              <div className="flex items-center gap-4">
                <img 
                  src={skill.practitioner.avatar} 
                  alt={skill.practitioner.name} 
                  className="w-16 h-16 rounded-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-black text-primary">{skill.practitioner.name}</h4>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Studio Artisan • London
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#00423A] to-[#002A24] p-6 rounded-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <div className="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center text-white/20">
                    <span className="text-4xl font-black">Skill</span>
                  </div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">
                    {skill.title}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              </div>
            </div>
          </motion.div>

          {/* Right Column: The Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-primary/5 space-y-10"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-primary tracking-tight">Your Proposition</h2>
              <p className="text-sm text-on-surface-variant">Choose which of your expertise you'd like to offer {skill.practitioner.name.split(' ')[0]} in return.</p>
            </div>

            <div className="space-y-8">
              {/* Skill Select */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Skill to Offer</label>
                <div className="relative">
                  <select 
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full bg-surface-bright border-none rounded-2xl py-5 px-6 text-sm font-bold text-primary appearance-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option>Professional Product Photography</option>
                    <option>UI Design Systems</option>
                    <option>Generative Art Coding</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={20} />
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Personal Message</label>
                <textarea 
                  placeholder={`Tell ${skill.practitioner.name.split(' ')[0]} why you'd like to learn her skill and how your expertise can benefit her project...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-surface-bright border-none rounded-2xl py-5 px-6 text-sm font-medium text-primary min-h-[160px] focus:ring-2 focus:ring-primary transition-all resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="flex gap-4 p-6 bg-surface-bright rounded-2xl border border-surface-container-high">
                <div className="text-primary shrink-0">
                  <Info size={20} />
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {skill.practitioner.name.split(' ')[0]} usually responds within <span className="font-bold text-primary">48 hours</span>. You will be notified once she reviews your request.
                </p>
              </div>

              {/* Submit Button */}
              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/chat')}
                  className="w-full py-5 bg-[#FDD828] text-primary font-black text-xl rounded-full flex items-center justify-center gap-3 hover:scale-[0.98] transition-all shadow-xl shadow-secondary/20"
                >
                  Send Swap Request
                  <Send size={24} className="rotate-[-45deg] translate-x-1 -translate-y-1" />
                </button>
                <p className="text-center text-[8px] uppercase font-bold text-on-surface-variant tracking-[0.2em]">
                  By sending, you agree to Maanth Community Guidelines
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
