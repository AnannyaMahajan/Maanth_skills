import { auth } from './firebase';
import { supabase } from './supabase';

export interface Profile {
  id: string;
  username?: string;
  full_name: string;
  avatar_url?: string;
  role: 'free' | 'pro' | 'admin';
  bio?: string;
  location?: string;
  college?: string;
  social_links?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  intent?: 'learn' | 'swap' | 'teach';
  onboarding_completed?: boolean;
  skills_to_learn?: string[];
  skills_to_offer?: {
    name: string;
    verified: boolean;
    verification_type: 'certificate' | 'assessment' | 'none';
    verification_date?: string;
  }[];
  created_at?: any;
  updated_at?: any;
}

export interface Resource {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: string;
  created_at?: string;
}

export interface SwapRequest {
  id: string;
  user_id: string;
  title: string;
  with_user_name: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';
  category: string;
  created_at?: any;
}

export interface SkillHistory {
  id: string;
  user_id: string;
  skill_name: string;
  participant_name: string;
  status: 'Completed' | 'Cancelled' | 'In Progress';
  date: string;
  created_at?: any;
}

export const db = {
  profiles: {
    async get(id: string) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') return null; // Not found
          throw error;
        }
        return data as Profile;
      } catch (error) {
        console.error('Supabase Error (profiles.get):', error);
        throw error;
      }
    },
    async update(id: string, profile: Partial<Profile>) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({ ...profile, id, updated_at: new Date().toISOString() })
          .select()
          .single();
        
        if (error) throw error;
        return data as Profile;
      } catch (error) {
        console.error('Supabase Error (profiles.update):', error);
        throw error;
      }
    }
  },
  swap_requests: {
    async list(userId: string) {
      try {
        const { data, error } = await supabase
          .from('swap_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as SwapRequest[];
      } catch (error) {
        console.error('Supabase Error (swap_requests.list):', error);
        throw error;
      }
    }
  },
  skill_history: {
    async list(userId: string) {
      try {
        const { data, error } = await supabase
          .from('skill_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as SkillHistory[];
      } catch (error) {
        console.error('Supabase Error (skill_history.list):', error);
        throw error;
      }
    }
  },
  resources: {
    // Keep resources in Supabase as requested for storage-related records
    async list(roomId: string) {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Resource[];
    },
    async create(resource: Omit<Resource, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('resources')
        .insert(resource)
        .select()
        .single();
      
      if (error) throw error;
      return data as Resource;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },
  notes: {
    async count(userId: string) {
      try {
        const { count, error } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Supabase Error (notes.count):', error);
        throw error;
      }
    },
    async list(userId: string) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data as any[];
      } catch (error) {
        console.error('Supabase Error (notes.list):', error);
        throw error;
      }
    },
    async create(note: { user_id: string; title: string; content: string }) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .insert({
            ...note,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data as any;
      } catch (error) {
        console.error('Supabase Error (notes.create):', error);
        throw error;
      }
    },
    async update(id: string, note: { title?: string; content?: string }) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .update({ ...note, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data as any;
      } catch (error) {
        console.error('Supabase Error (notes.update):', error);
        throw error;
      }
    },
    async delete(id: string) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Supabase Error (notes.delete):', error);
        throw error;
      }
    }
  }
};
