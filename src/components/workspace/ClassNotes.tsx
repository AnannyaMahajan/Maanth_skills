import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Save, Plus, Trash2, Clock, CheckCircle2, MoreVertical, AlertCircle, X, Eye, Edit3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface ClassNotesProps {
  socket: WebSocket | null;
  roomId: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  user_id: string;
}

export default function ClassNotes({ socket, roomId }: ClassNotesProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId);
  const isPro = profile?.role === 'pro';

  useEffect(() => {
    if (!user) return;

    const loadNotes = async () => {
      setLoading(true);
      try {
        const data = await db.notes.list(user.id);
        setNotes(data || []);
        if (data && data.length > 0) {
          setActiveNoteId(data[0].id);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();

    // Subscribe to changes
    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadNotes();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notes_update' && data.roomId === roomId) {
          // For real-time collaboration, we might still want to sync local state
          // but the database is the source of truth
        }
      } catch (e) {
        console.error('Error parsing notes message:', e);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, roomId]);

  const updateNote = async (content: string) => {
    if (!activeNoteId || !user) return;
    
    setIsSaving(true);
    try {
      const updated = await db.notes.update(activeNoteId, { content });
      setNotes(prev => prev.map(n => n.id === activeNoteId ? updated : n));
      
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'notes_update',
          roomId,
          noteId: activeNoteId,
          content
        }));
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to save changes');
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const updateTitle = async (title: string) => {
    if (!activeNoteId || !user) return;
    
    try {
      const updated = await db.notes.update(activeNoteId, { title });
      setNotes(prev => prev.map(n => n.id === activeNoteId ? updated : n));
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  };

  const addNewNote = async () => {
    if (!user) return;

    // SaaS Plan Logic: Check limit for non-pro users
    try {
      if (!isPro) {
        const count = await db.notes.count(user.id);
        if (count >= 3) {
          setShowLimitModal(true);
          return;
        }
      }

      const newNote = await db.notes.create({
        user_id: user.id,
        title: 'Untitled Note',
        content: ''
      });

      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setIsPreview(false);
      toast.success('New note created');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      await db.profiles.update(user.id, { role: 'pro' });
      await refreshProfile();
      setShowLimitModal(false);
      toast.success('Welcome to Pro! Unlimited notes unlocked.');
    } catch (error) {
      console.error('Error upgrading profile:', error);
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await db.notes.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (activeNoteId === id) {
        setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
      }
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-64 border-r border-surface-container-high bg-[#F9F7F4] flex flex-col">
        <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Class Notes</h3>
          <button 
            onClick={addNewNote}
            className="p-2 bg-primary text-white rounded-xl hover:scale-105 transition-all shadow-sm"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="p-4 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">
              No notes yet
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all group relative cursor-pointer",
                  activeNoteId === note.id ? "bg-white shadow-sm border border-surface-container-high" : "hover:bg-white/50"
                )}
              >
                <div className="flex items-center gap-3 mb-1">
                  <FileText size={14} className={activeNoteId === note.id ? "text-primary" : "text-on-surface-variant"} />
                  <h4 className={cn(
                    "text-xs font-bold truncate",
                    activeNoteId === note.id ? "text-primary" : "text-on-surface-variant"
                  )}>
                    {note.title}
                  </h4>
                </div>
                <p className="text-[10px] text-on-surface-variant truncate opacity-60">
                  {note.content || 'Empty note...'}
                </p>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Editor Area */}
      <main className="flex-1 flex flex-col bg-white">
        {activeNote ? (
          <>
            <header className="px-8 py-6 border-b border-surface-container-high flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <FileText size={20} />
                </div>
                <div>
                  <input 
                    type="text" 
                    value={activeNote.title}
                    onChange={(e) => updateTitle(e.target.value)}
                    className="text-lg font-black text-primary bg-transparent border-none focus:ring-0 p-0"
                  />
                  <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                    <Clock size={10} />
                    Last edited {new Date(activeNote.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPreview(!isPreview)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    isPreview ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"
                  )}
                >
                  {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                  {isPreview ? 'Edit' : 'Preview'}
                </button>

                <AnimatePresence>
                  {isSaving && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest"
                    >
                      <CheckCircle2 size={12} />
                      Synced
                    </motion.div>
                  )}
                </AnimatePresence>
                <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>
            
            <div className="flex-1 p-10 overflow-y-auto">
              {isPreview ? (
                <div className="prose prose-sm max-w-none text-on-surface-variant">
                  <ReactMarkdown>{activeNote.content || '*No content yet...*'}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => updateNote(e.target.value)}
                  placeholder="Start typing your notes here... (Markdown supported)"
                  className="w-full h-full resize-none border-none focus:ring-0 text-sm leading-relaxed text-on-surface-variant font-medium placeholder:opacity-30"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-center justify-center items-center text-center p-10">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto">
                <FileText size={32} className="text-on-surface-variant opacity-40" />
              </div>
              <h3 className="text-lg font-black text-primary">No Note Selected</h3>
              <p className="text-sm text-on-surface-variant opacity-60 max-w-xs mx-auto">
                Select a note from the sidebar or create a new one to start collaborating.
              </p>
              <button 
                onClick={addNewNote}
                className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-lg"
              >
                Create New Note
              </button>
            </div>
          </div>
        )}
      </main>

      {/* SaaS Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button 
                  onClick={() => setShowLimitModal(false)}
                  className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="w-20 h-20 bg-secondary-container rounded-3xl flex items-center justify-center text-on-secondary-container mx-auto">
                  <AlertCircle size={40} />
                </div>

                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-black text-primary tracking-tight italic">Plan Limit Reached</h3>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                    Free plan limit reached. Upgrade to Pro to create unlimited notes and unlock advanced collaboration features.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full py-4 bg-[#002A24] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50"
                  >
                    {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
                  </button>
                  <button 
                    onClick={() => setShowLimitModal(false)}
                    className="w-full py-4 bg-surface-container-low text-primary rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-surface-container transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>

              {/* Decorative background element */}
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary-container rounded-full blur-3xl opacity-30" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
