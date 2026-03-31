import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { SKILLS } from '../constants';
import { SkillCard } from '../components/SkillCard';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const { user } = useAuth();
  const featuredSkills = SKILLS.slice(0, 3);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[800px] flex items-center pt-12">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-bold text-[10px] uppercase tracking-widest">
              The Digital Atelier
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-primary leading-[0.9] tracking-tighter">
              Craft your <span className="text-on-primary-container italic">future</span>, <br />one swap at a time.
            </h1>
            <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
              Maanth is a curated gallery of human talent. Exchange high-level skills with global practitioners without currency—just pure, intentional growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to={user ? "/dashboard" : "/auth"}
                className="bg-secondary-container text-on-secondary-container px-10 py-5 rounded-full font-black text-lg shadow-xl shadow-secondary-container/20 hover:scale-105 transition-transform text-center"
              >
                {user ? "Go to Dashboard" : "Start Swapping"}
              </Link>
              <button className="bg-surface-container-low text-primary px-10 py-5 rounded-full font-bold text-lg hover:bg-surface-container-high transition-colors">
                How it works
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl rotate-3 bg-primary">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&q=80" 
                alt="Collaborative Space" 
                className="w-full h-full object-cover mix-blend-multiply opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 50, rotate: -10 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-10 -left-10 w-64 bg-surface-container-lowest p-6 rounded-xl shadow-xl hidden md:block"
            >
              <div className="flex gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <p className="font-bold text-primary text-sm leading-snug">
                "Swapping Prompt Engineering for 3D Architecture was the best pivot of my career."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" 
                  alt="Julian R." 
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Julian R. • Architect
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-surface-container-low -z-10 translate-x-1/4" />
      </section>

      {/* Marketplace Preview */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter mb-6">Current Opportunities</h2>
              <p className="text-on-surface-variant text-lg">
                Browse curated skills from our community of digital artisans. Every card represents a genuine human connection ready to be forged.
              </p>
            </div>
            <Link 
              to="/marketplace" 
              className="font-bold text-primary border-b-2 border-primary pb-1 mb-2 hover:text-primary-container transition-colors"
            >
              Explore Marketplace
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {featuredSkills.map((skill, i) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <SkillCard skill={skill} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-32"
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter leading-tight">
                A Protocol for <br /><span className="text-on-primary-container">Human Exchange.</span>
              </h2>
              <div className="space-y-10">
                {[
                  { step: 1, title: 'Display Your Craft', desc: "Create a listing for the skill you've mastered. Be specific about your experience and the tools you use." },
                  { step: 2, title: 'Find a Counterparty', desc: "Search the marketplace for a skill you desire. Initiate an exchange proposal defining the swap duration." },
                  { step: 3, title: 'The Knowledge Swap', desc: "Collaborate directly via our secure workshop interface. No money, just mutual elevation." }
                ].map((item, i) => (
                  <motion.div 
                    key={item.step} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container text-secondary-container flex items-center justify-center font-black text-xl">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary mb-2">{item.title}</h4>
                      <p className="text-on-surface-variant">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-primary p-12 rounded-[2.5rem] text-on-primary flex flex-col justify-center relative overflow-hidden"
            >
              <div className="relative z-10">
                <Sparkles size={48} className="text-secondary-container mb-6" />
                <h3 className="text-3xl font-black mb-6">Why Maanth?</h3>
                <p className="text-on-primary-container text-lg leading-relaxed mb-8">
                  In a world obsessed with monetization, we believe the highest form of transaction is the transfer of human wisdom. We built Maanth to facilitate connections that purely economic systems overlook.
                </p>
                <ul className="space-y-4">
                  {['Zero Transaction Fees', 'Verified Practitioner Profiles', 'Structured Learning Frameworks'].map((text) => (
                    <li key={text} className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-secondary-container" />
                      <span className="font-bold">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(10,66,53,1)_0%,rgba(0,42,33,1)_100%)]" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <section className="py-32 border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter">Explore by Discipline</h2>
            <p className="text-on-surface-variant text-lg font-medium">
              From traditional craftsmanship to cutting-edge digital arts, find the perfect domain for your next evolution.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Digital Design', count: '1.2K Listings', color: 'bg-blue-50' },
              { name: 'Software Engineering', count: '2.4K Listings', color: 'bg-green-50' },
              { name: 'Fine Arts & Pottery', count: '850 Listings', color: 'bg-orange-50' },
              { name: 'Marketing & Growth', count: '1.1K Listings', color: 'bg-purple-50' },
              { name: 'Data Science & AI', count: '1.5K Listings', color: 'bg-indigo-50' },
              { name: 'Music & Sound Design', count: '600 Listings', color: 'bg-pink-50' },
              { name: 'Writing & Content', count: '900 Listings', color: 'bg-yellow-50' },
              { name: 'Business Strategy', count: '1.3K Listings', color: 'bg-teal-50' },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={cn("p-8 rounded-[2rem] border border-surface-container-high hover:shadow-xl transition-all cursor-pointer group", cat.color)}
              >
                <h4 className="font-black text-primary mb-1 group-hover:translate-x-1 transition-transform">{cat.name}</h4>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{cat.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-primary text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                HEAR FROM OUR <br /><span className="italic text-secondary">GLOBAL COMMUNITY.</span>
              </h2>
              <p className="text-xl opacity-80 font-medium leading-relaxed max-w-lg">
                Real stories from real practitioners who have transformed their lives through the power of skill exchange.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} className="w-12 h-12 rounded-full border-4 border-primary object-cover" />
                  ))}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-black text-xl">4.9/5</span>
                  <span className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Average User Rating</span>
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              {[
                { name: 'Sarah L.', role: 'UX Designer', text: "Maanth completely changed how I view education. I traded my Figma skills for advanced React patterns and saved thousands in course fees." },
                { name: 'David K.', role: 'Fullstack Dev', text: "The quality of connections here is unmatched. You're not just learning a skill; you're building a professional network of high-level peers." }
              ].map((t, i) => (
                <motion.div 
                  key={t.name}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 space-y-4"
                >
                  <p className="text-lg font-medium italic">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center font-black text-xs">
                      {t.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(10,66,53,1)_0%,rgba(0,42,33,1)_100%)]" />
      </section>

      {/* FAQ Section */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-primary tracking-tight">Frequently Asked Questions</h2>
            <p className="text-on-surface-variant font-medium">Everything you need to know about the Maanth protocol.</p>
          </div>
          <div className="space-y-6">
            {[
              { q: "Is Maanth really free?", a: "Yes. Maanth is built on the principle of direct value exchange. We do not charge transaction fees for skill swaps. Our platform is sustained by optional premium features for power users." },
              { q: "How do I know if a partner is reliable?", a: "Every user has a verified profile with a history of successful swaps and peer reviews. We encourage starting with smaller sessions to build trust." },
              { q: "What if I don't have a 'high-level' skill?", a: "Everyone has something valuable to offer. Whether it's language tutoring, basic coding, or even organizational skills, there's always someone looking to learn what you know." },
              { q: "Can I swap multiple skills at once?", a: "Absolutely. Many of our most successful users engage in multi-disciplinary swaps that span several weeks or months." }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-surface-container-low rounded-[2rem] border border-surface-container-high space-y-3"
              >
                <h4 className="text-lg font-black text-primary">{faq.q}</h4>
                <p className="text-on-surface-variant font-medium leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 max-w-7xl mx-auto px-8"
      >
        <div className="bg-secondary-container rounded-[3rem] px-8 py-20 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter mb-8">Ready to evolve?</h2>
            <p className="text-on-secondary-container text-xl font-bold mb-12 uppercase tracking-widest">Join 4,000+ artisans swapping today.</p>
            <Link
              to="/marketplace"
              className="inline-block bg-primary text-on-primary px-12 py-6 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl"
            >
              Create Your First Listing
            </Link>
          </div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </motion.section>
    </div>
  );
}
