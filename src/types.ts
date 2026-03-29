export interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Apprentice' | 'Artisan' | 'Master';
  practitioner: {
    name: string;
    role: string;
    avatar: string;
    rating: number;
    swaps: number;
  };
  image: string;
  available: boolean;
  sessionsLeft?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isProposal?: boolean;
  proposalData?: {
    title: string;
    time: string;
  };
}

export interface Conversation {
  id: string;
  participant: {
    name: string;
    avatar: string;
    role: string;
    lastSeen: string;
  };
  lastMessage: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'message' | 'swap_request' | 'swap_accepted' | 'session_upcoming';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}
