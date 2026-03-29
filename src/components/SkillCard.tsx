import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Skill } from '../types';
import { cn } from '../lib/utils';

interface SkillCardProps {
  skill: Skill;
  className?: string;
  key?: React.Key;
}

export function SkillCard({ skill, className }: SkillCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("bg-surface-container-lowest rounded-xl p-8 hover:bg-surface-bright transition-all group h-full flex flex-col", className)}
    >
      <div className="aspect-video mb-8 rounded-lg overflow-hidden relative">
        <img 
          src={skill.image} 
          alt={skill.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            skill.level === 'Master' ? "bg-secondary-container text-on-secondary-container" : "bg-primary text-on-primary"
          )}>
            {skill.level}
          </span>
        </div>
        {skill.available && (
          <div className="absolute top-4 right-4">
            <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Available
            </span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-black text-primary tracking-tight">{skill.title}</h3>
        <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-lg">
          <Star size={14} className="fill-secondary text-secondary" />
          <span className="text-sm font-bold text-primary">{skill.practitioner.rating}</span>
        </div>
      </div>
      
      <p className="text-on-surface-variant mb-8 line-clamp-3 text-sm leading-relaxed">
        {skill.description}
      </p>
      
      <div className="flex items-center justify-between border-t border-surface-container-high pt-6 mt-auto">
        <div className="flex items-center gap-3">
          <img 
            src={skill.practitioner.avatar} 
            alt={skill.practitioner.name}
            className="w-10 h-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-bold uppercase tracking-widest">{skill.practitioner.name}</span>
        </div>
        <Link 
          to={`/marketplace/${skill.id}`}
          className="text-primary-container hover:underline font-bold text-sm"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
