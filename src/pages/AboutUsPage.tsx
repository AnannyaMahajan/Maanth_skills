import React from 'react';
import { motion } from 'motion/react';
import { Globe, Users, Heart, Target, Shield, Zap } from 'lucide-react';

export default function AboutUsPage() {
  const stats = [
    { label: 'Active Users', value: '50K+' },
    { label: 'Skills Exchanged', value: '120K+' },
    { label: 'Countries', value: '45+' },
    { label: 'Success Rate', value: '98%' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Community First',
      description: 'We believe in the power of human connection and mutual growth through shared knowledge.',
    },
    {
      icon: Target,
      title: 'Skill Mastery',
      description: 'Our platform is designed to help you achieve mastery in any field through direct exchange.',
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'We prioritize the safety and privacy of our community members above all else.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Constantly evolving our matching algorithms to find your perfect skill partner.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-primary/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black text-primary tracking-tighter leading-none mb-8"
            >
              WE ARE BUILDING THE FUTURE OF <span className="italic text-secondary">KNOWLEDGE EXCHANGE.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-on-surface-variant font-medium leading-relaxed"
            >
              Maanth is more than just a platform; it's a global movement dedicated to democratizing education. 
              We believe that everyone has something valuable to teach and something new to learn. 
              By removing the financial barriers to education, we're creating a world where skills flow freely 
              between people who are passionate about growth.
            </motion.p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 translate-x-1/4" />
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-black text-primary mb-2">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-primary tracking-tight">Our Mission</h2>
              <div className="space-y-6 text-on-surface-variant font-medium leading-relaxed">
                <p>
                  In an era of rapidly changing technology and shifting job markets, the ability to learn 
                  new skills quickly is the most important asset anyone can have. Traditional education 
                  is often slow, expensive, and disconnected from real-world application.
                </p>
                <p>
                  Maanth bridges this gap by connecting learners directly with practitioners. 
                  Whether you're a developer wanting to learn pottery, or a chef wanting to master 
                  Python, our platform facilitates a direct exchange of value that benefits both parties.
                </p>
                <p>
                  We are committed to building a sustainable ecosystem where curiosity is the only 
                  currency you need to advance your personal and professional life.
                </p>
              </div>
            </div>
            <div className="relative aspect-square bg-surface-container rounded-[3rem] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop" 
                alt="Team collaboration" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-primary tracking-tight">Our Core Values</h2>
            <p className="text-on-surface-variant font-medium">The principles that guide every decision we make at Maanth.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-surface-container-high shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <value.icon size={24} />
                </div>
                <h3 className="text-lg font-black text-primary mb-3">{value.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section Placeholder */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-primary tracking-tight">Meet the Visionaries</h2>
              <p className="text-on-surface-variant font-medium max-w-xl">
                A diverse team of educators, engineers, and designers working together to redefine learning.
              </p>
            </div>
            <button className="px-8 py-4 bg-primary text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
              Join Our Team
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4 group">
                <div className="aspect-[3/4] bg-surface-container rounded-[2rem] overflow-hidden relative">
                  <img 
                    src={`https://picsum.photos/seed/team${i}/600/800`} 
                    alt="Team member" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-black text-primary">Team Member {i}</h4>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Role Title</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10 space-y-8">
          <h2 className="text-6xl font-black tracking-tighter leading-none">READY TO START YOUR <br /> <span className="italic text-secondary">LEARNING JOURNEY?</span></h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto font-medium">
            Join thousands of others who are already exchanging skills and building a better future together.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button className="px-10 py-5 bg-white text-primary rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
              Get Started Now
            </button>
            <button className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
              Contact Us
            </button>
          </div>
        </div>
        
        {/* Decorative background circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
      </section>
    </div>
  );
}
