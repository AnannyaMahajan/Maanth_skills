import React from 'react';
import { Search, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SKILLS } from '../constants';
import { SkillCard } from '../components/SkillCard';
import { cn } from '../lib/utils';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = React.useState<string | null>('Artisan');

  const categories = ['Visual Design', 'Creative Coding', 'Sound Architecture'];
  const levels = ['Apprentice', 'Artisan', 'Master'];

  const filteredSkills = SKILLS.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.practitioner.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    const matchesLevel = !selectedLevel || skill.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 w-full flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-10 shrink-0">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Category</h3>
          <div className="space-y-3">
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  selectedCategory === cat ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                )}>
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Level</h3>
          <div className="space-y-3">
            {levels.map(level => (
              <label key={level} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="level"
                  checked={selectedLevel === level}
                  onChange={() => setSelectedLevel(level)}
                  className="border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  selectedLevel === level ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                )}>
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 bg-surface-container-low rounded-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Artisans are more likely to accept swaps involving complex creative coding projects.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-grow">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-primary mb-2">The Marketplace</h1>
            <p className="text-on-surface-variant">Discover human talent curated for the digital era.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-primary px-4 py-2 bg-surface-container-low rounded-full whitespace-nowrap">
              <span>Showing:</span>
              <span className="text-secondary">{filteredSkills.length} Results</span>
            </div>
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map(skill => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <SkillCard skill={skill} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
