import { supabase } from './supabase';

export interface Profile {
  id: string;
  avatar_url?: string;
  full_name?: string;
  role?: string;
  bio?: string;
  updated_at?: string;
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
  created_at?: string;
}

export interface SkillHistory {
  id: string;
  user_id: string;
  skill_name: string;
  participant_name: string;
  status: 'Completed' | 'Cancelled' | 'In Progress';
  date: string;
  created_at?: string;
}

export const db = {
  profiles: {
    async get(id: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as Profile | null;
    },
    async update(id: string, profile: Partial<Profile>) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id, ...profile, updated_at: new Date().toISOString() })
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    }
  },
  swap_requests: {
    async list(userId: string) {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SwapRequest[];
    }
  },
  skill_history: {
    async list(userId: string) {
      const { data, error } = await supabase
        .from('skill_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SkillHistory[];
    }
  },
  resources: {
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
      const { count, error } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) throw error;
      return count || 0;
    },
    async list(userId: string) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    async create(note: { user_id: string; title: string; content: string }) {
      const { data, error } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async update(id: string, note: { title?: string; content?: string }) {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...note, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  }
};
