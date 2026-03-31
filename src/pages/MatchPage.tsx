import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { X, Repeat, Bookmark, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotifications } from '../contexts/NotificationContext';

const CURRENT_USER = {
  id: 'me',
  skillsOffer: [
    { name: 'Urban Planning', level: 'Expert' },
    { name: 'Data Visualization', level: 'Intermediate' },
    { name: 'Brand Strategy', level: 'Master' }
  ],
  skillsWant: [
    { name: 'Pottery', level: 'Intermediate' },
    { name: 'Glazing', level: 'Expert' },
    { name: 'React', level: 'Intermediate' },
    { name: 'Three.js', level: 'Expert' }
  ],
  interests: ['Design', 'Crafts']
};

const INTERACTION_HISTORY = [
  { profileId: '1', type: 'like' }, // Liked Elena (Pottery/Design)
];

const MATCH_DATA = [
  {
    id: '1',
    name: 'Elena Rossi',
    title: 'UI DESIGN FOR POTTERY',
    bio: '"Blending digital precision with the soul of clay. I build design systems by day and hand-coil vases by night. Looking to trade Figma mastery for glazing secrets."',
    skillsOffer: [
      { name: 'Figma', level: 'Master', verified: true },
      { name: 'User Research', level: 'Expert', verified: true },
      { name: 'Design Systems', level: 'Master', verified: true },
      { name: 'Glazing', level: 'Expert', verified: true }
    ],
    skillsWant: [
      { name: 'Pottery', level: 'Intermediate', verified: true },
      { name: 'Glazing', level: 'Expert', verified: true },
      { name: 'Kiln Management', level: 'Intermediate', verified: false },
      { name: 'Data Visualization', level: 'Intermediate', verified: true }
    ],
    interests: ['Design', 'Crafts'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    title: 'CREATIVE CODING FOR ARCHITECTURE',
    bio: '"Architect by training, coder by passion. I create generative structures that respond to environmental data. Seeking to swap WebGL expertise for sustainable material science."',
    skillsOffer: [
      { name: 'Three.js', level: 'Expert', verified: true },
      { name: 'React', level: 'Intermediate', verified: true },
      { name: 'Generative Design', level: 'Master', verified: false }
    ],
    skillsWant: [
      { name: 'Material Science', level: 'Expert', verified: true },
      { name: 'Sustainability', level: 'Intermediate', verified: false },
      { name: 'Urban Planning', level: 'Expert', verified: true }
    ],
    interests: ['Architecture', 'Design', 'Coding'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop'
  }
];

function calculateMatchScore(profile: typeof MATCH_DATA[0]) {
  let score = 0;
  const insights: string[] = [];

  // 1. Skill Overlap & Level Alignment (Max 50 points)
  const theyHaveWhatIWant = profile.skillsOffer.filter(s => 
    CURRENT_USER.skillsWant.some(sw => sw.name === s.name)
  );
  
  const iHaveWhatTheyWant = CURRENT_USER.skillsOffer.filter(s => 
    profile.skillsWant.some(sw => sw.name === s.name)
  );

  if (theyHaveWhatIWant.length > 0 && iHaveWhatTheyWant.length > 0) {
    score += 20;
    insights.push("Mutual Skill Match");
  }

  theyHaveWhatIWant.forEach(s => {
    score += 10;
    if (s.verified) score += 5;
    const want = CURRENT_USER.skillsWant.find(sw => sw.name === s.name);
    if (want && s.level === want.level) score += 5;
  });

  iHaveWhatTheyWant.forEach(s => {
    score += 5;
    const want = profile.skillsWant.find(sw => sw.name === s.name);
    if (want && want.verified) score += 2;
  });

  // 2. Interest Overlap (Max 20 points)
  const sharedInterests = profile.interests.filter(i => CURRENT_USER.interests.includes(i));
  if (sharedInterests.length > 0) {
    score += Math.min(sharedInterests.length * 10, 20);
    insights.push(`${sharedInterests.length} Shared Interests`);
  }

  // 3. Interaction Similarity (Max 30 points)
  const similarInteractions = INTERACTION_HISTORY.filter(h => {
    const likedProfile = MATCH_DATA.find(p => p.id === h.profileId);
    if (!likedProfile) return false;
    return profile.skillsOffer.some(s => likedProfile.skillsOffer.some(ls => ls.name === s.name));
  }).length;
  
  if (similarInteractions > 0) {
    score += Math.min(similarInteractions * 15, 30);
    insights.push("Similar to your likes");
  }

  return {
    percentage: Math.min(Math.round(score + 35), 99),
    insights: insights.slice(0, 2)
  };
}

export default function MatchPage() {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [radius, setRadius] = React.useState(15);
  
  const processedMatches = React.useMemo(() => {
    return MATCH_DATA.map(profile => {
      const { percentage, insights } = calculateMatchScore(profile);
      return {
        ...profile,
        matchPercentage: percentage,
        insights
      };
    });
  }, []);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Visual feedback for swiping
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);
  const cardScale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 120;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 500) {
      // Swipe Right (Like/Swap)
      animateSwipe(200);
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Swipe Left (Pass)
      animateSwipe(-200);
    } else {
      // Reset
      x.set(0);
    }
  };

  const [showMatchModal, setShowMatchModal] = React.useState(false);
  const [matchedUser, setMatchedUser] = React.useState<any>(null);

  const animateSwipe = (direction: number) => {
    const currentCard = processedMatches[currentIndex];
    
    if (direction > 0) {
      // Swipe Right (Swap)
      // Simulate a match 50% of the time for the demo
      if (Math.random() > 0.5) {
        setMatchedUser(currentCard);
        setShowMatchModal(true);
      } else {
        addNotification({
          type: 'swap_request',
          title: 'Swap Request Sent',
          description: `You requested a swap with ${currentCard.name}.`,
          link: '/dashboard'
        });
      }
    }

    // We use a temporary state to trigger the exit animation
    // In a real app, we'd probably handle the data update here
    setCurrentIndex((prev) => (prev + 1) % processedMatches.length);
    x.set(0); // Reset x for the next card
  };

  const currentCard = processedMatches[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col lg:flex-row gap-12 min-h-[calc(100vh-80px)]">
      {/* Match Modal Overlay */}
      <AnimatePresence>
        {showMatchModal && matchedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#002A24]/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FDD828] via-primary to-[#FDD828]" />
              
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-primary tracking-tighter italic">It's a Match!</h2>
                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">You and {matchedUser.name} are ready to swap</p>
              </div>

              <div className="flex items-center justify-center gap-4 py-4">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-md">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div className="w-12 h-1 bg-surface-container-high rounded-full" />
                <div className="relative">
                  <img src={matchedUser.image} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-2 -right-2 bg-[#FDD828] text-primary p-2 rounded-full shadow-md">
                    <Repeat size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/chat')}
                  className="w-full py-5 bg-[#002A24] text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3"
                >
                  <MessageSquare size={20} />
                  Start Swapping
                </button>
                <button 
                  onClick={() => setShowMatchModal(false)}
                  className="w-full py-5 bg-surface-container-low text-primary rounded-full font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
                >
                  Keep Browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar - Discovery */}
      <aside className="w-full lg:w-80 shrink-0 space-y-10">
        <div className="bg-surface-container-low p-8 rounded-[2rem] space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-primary tracking-tight">Discovery</h2>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Our matching engine analyzes your profile to find the most compatible skill partners. 
              Adjust your discovery settings below to refine your results.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Location Radius</p>
            </div>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-primary h-1 bg-surface-container-high rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
              <span>5km</span>
              <span>50km</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Skill Level</p>
            <div className="space-y-3">
              {['Intermediate', 'Expert', 'Master'].map((level) => (
                <label key={level} className="flex items-center gap-3 p-4 bg-white rounded-2xl cursor-pointer hover:bg-surface-bright transition-colors">
                  <input type="checkbox" defaultChecked={level === 'Intermediate'} className="w-5 h-5 rounded border-surface-container-high text-primary focus:ring-primary" />
                  <span className="font-bold text-sm text-primary">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Interests</p>
            <div className="flex flex-wrap gap-2">
              {['Design', 'Crafts', 'Music'].map((interest) => (
                <button 
                  key={interest}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-bold transition-all",
                    interest === 'Design' ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary"
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
          <h4 className="text-xs font-black text-primary uppercase tracking-widest">How Matching Works</h4>
          <div className="space-y-3 text-[10px] text-on-surface-variant font-medium leading-relaxed">
            <p>
              <span className="font-bold text-primary">1. Skill Alignment:</span> We prioritize users who have exactly what you want and vice versa.
            </p>
            <p>
              <span className="font-bold text-primary">2. Verification:</span> Verified practitioners receive a boost in the matching algorithm.
            </p>
            <p>
              <span className="font-bold text-primary">3. Interest Overlap:</span> Shared hobbies and professional interests increase the likelihood of a successful swap.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content - Swipe Cards */}
      <section className="flex-grow flex flex-col items-center justify-center relative py-12 lg:py-0">
        <div className="relative w-full max-w-[540px] aspect-[3/4.5] lg:aspect-[3/4]">
          {/* Background Card Stack Placeholder */}
          <div className="absolute inset-0 bg-surface-container-low rounded-[3rem] translate-y-4 scale-[0.95] -z-10 opacity-50" />
          <div className="absolute inset-0 bg-surface-container-low rounded-[3rem] translate-y-8 scale-[0.9] -z-20 opacity-30" />

          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentCard.id}
              style={{ x, rotate, opacity, scale: cardScale }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ 
                x: x.get() === 0 ? 0 : (x.get() > 0 ? 1000 : -1000), 
                opacity: 0, 
                scale: 0.5,
                transition: { duration: 0.4, ease: "easeIn" } 
              }}
              className="absolute inset-0 bg-white rounded-[3rem] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing z-30"
            >
              {/* Swipe Overlays */}
              <motion.div 
                style={{ opacity: likeOpacity }}
                className="absolute top-12 left-12 z-50 border-4 border-[#4ADE80] text-[#4ADE80] px-6 py-2 rounded-xl font-black text-4xl rotate-[-15deg] pointer-events-none"
              >
                SWAP
              </motion.div>
              <motion.div 
                style={{ opacity: nopeOpacity }}
                className="absolute top-12 right-12 z-50 border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl font-black text-4xl rotate-[15deg] pointer-events-none"
              >
                PASS
              </motion.div>

              {/* Card Image Header */}
              <div className="relative h-1/2 lg:h-3/5">
                <img 
                  src={currentCard.image} 
                  alt={currentCard.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 right-6">
                  <span className="bg-[#FDD828] text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {currentCard.matchPercentage}% MATCH
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-4xl font-black tracking-tight mb-1">{currentCard.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FDD828]">{currentCard.title}</p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-8 space-y-6">
                <p className="text-sm text-on-surface-variant italic leading-relaxed">
                  {currentCard.bio}
                </p>

                <div className="space-y-4">
                  {currentCard.insights.length > 0 && (
                    <div className="flex gap-2">
                      {currentCard.insights.map(insight => (
                        <span key={insight} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-wider border border-primary/20">
                          {insight}
                        </span>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Skills They Offer</p>
                    <div className="flex flex-wrap gap-2">
                      {currentCard.skillsOffer.map(skill => (
                        <div key={skill.name} className="flex flex-col gap-1">
                          <span className="px-4 py-1.5 bg-[#002A24] text-white rounded-full text-[10px] font-bold flex items-center gap-1.5">
                            {skill.name}
                            {skill.verified && <CheckCircle2 size={10} />}
                          </span>
                          <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-tighter ml-2">{skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Skills They Want</p>
                    <div className="flex flex-wrap gap-2">
                      {currentCard.skillsWant.map(skill => (
                        <div key={skill.name} className="flex flex-col gap-1">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5",
                            skill.verified ? "bg-[#5A5A40] text-white" : "bg-surface-container-high text-on-surface-variant"
                          )}>
                            {skill.name}
                            {skill.verified && <CheckCircle2 size={10} />}
                          </span>
                          <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-tighter ml-2">{skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button 
                    onClick={() => animateSwipe(-200)}
                    className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X size={32} />
                  </button>
                  <button 
                    onClick={() => animateSwipe(200)}
                    className="flex-grow mx-4 h-16 bg-[#002A24] text-white rounded-full flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                  >
                    <Repeat size={20} />
                    Swap Request
                  </button>
                  <button className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-colors">
                    <Bookmark size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Swipe Instructions */}
        <div className="mt-12 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant opacity-50">
          <div className="flex items-center gap-2">
            <ChevronLeft size={16} />
            Swipe Left to Pass
          </div>
          <div className="flex items-center gap-2">
            Swipe Right to Swap
            <ChevronRight size={16} />
          </div>
        </div>
      </section>
    </div>
  );
}
