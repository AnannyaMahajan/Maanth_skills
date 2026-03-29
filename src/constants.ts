import { Skill, Conversation } from './types';

export const SKILLS: Skill[] = [
  {
    id: '1',
    title: '3D Architecture',
    description: 'Mastering photorealistic visualization in Blender and Unreal Engine 5. Looking to learn Web3 mechanics.',
    category: 'Visual Design',
    level: 'Artisan',
    practitioner: {
      name: 'Sarah Chen',
      role: 'Architectural Visualizer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      rating: 4.9,
      swaps: 24
    },
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
    available: true,
    sessionsLeft: 3
  },
  {
    id: '2',
    title: 'Prompt Engineering',
    description: 'Strategic LLM orchestration for creative workflows and automation. Seeking expert 3D modeling skills.',
    category: 'Creative Coding',
    level: 'Artisan',
    practitioner: {
      name: 'Marcus V.',
      role: 'AI Strategist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      rating: 4.8,
      swaps: 18
    },
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    available: true
  },
  {
    id: '3',
    title: 'Web3 Protocol',
    description: 'Deep dive into smart contract security and tokenomics. Excited to trade for creative direction.',
    category: 'Creative Coding',
    level: 'Master',
    practitioner: {
      name: 'Elena K.',
      role: 'Blockchain Developer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      rating: 5.0,
      swaps: 42
    },
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    available: true
  },
  {
    id: '4',
    title: 'Generative Brand Identity',
    description: 'Creating dynamic, algorithmic brand systems that evolve with user interaction and environment data.',
    category: 'Visual Design',
    level: 'Artisan',
    practitioner: {
      name: 'Elena Vance',
      role: 'Principal Designer, Lumon',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      rating: 4.9,
      swaps: 42
    },
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
    available: true,
    sessionsLeft: 6
  },
  {
    id: '5',
    title: 'Spatial Audio Landscapes',
    description: 'Architecting immersive 3D sound environments for VR experiences and digital installations.',
    category: 'Sound Architecture',
    level: 'Master',
    practitioner: {
      name: 'Julian Thorne',
      role: 'Sound Designer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      rating: 5.0,
      swaps: 31
    },
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
    available: true
  },
  {
    id: '6',
    title: 'WebGL Shader Crafting',
    description: 'Introductory logic for writing high-performance visual shaders for browser-based creative coding.',
    category: 'Creative Coding',
    level: 'Apprentice',
    practitioner: {
      name: 'Sato Kenzo',
      role: 'Creative Developer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      rating: 4.7,
      swaps: 12
    },
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    available: true
  }
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participant: {
      name: 'Elena Rossi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      role: 'Pottery Artist',
      lastSeen: '2M'
    },
    lastMessage: 'Looking forward to our pottery session!',
    unreadCount: 0
  },
  {
    id: '2',
    participant: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      role: 'Creative Coder',
      lastSeen: '1H'
    },
    lastMessage: 'The Javascript module is ready.',
    unreadCount: 0
  },
  {
    id: '3',
    participant: {
      name: 'Sarah Miller',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      role: 'Architect',
      lastSeen: 'Yesterday'
    },
    lastMessage: 'Thanks for the feedback!',
    unreadCount: 0
  }
];
