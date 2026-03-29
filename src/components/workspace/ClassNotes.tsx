import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Save, Plus, Trash2, Clock, CheckCircle2, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ClassNotesProps {
  socket: WebSocket | null;
  roomId: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  author: string;
}

export default function ClassNotes({ socket, roomId }: ClassNotesProps) {
  const [notes, setNotes] = React.useState<Note[]>([
    {
      id: '1',
      title: 'UI Design Principles',
      content: 'Focus on visual hierarchy, accessibility, and user feedback. Mobile-first approach is key.',
      lastEdited: '10:45 AM',
      author: 'Julian'
    },
    {
      id: '2',
      title: 'Pottery Techniques',
      content: 'Wheel throwing basics: Centering, opening, and pulling. Kiln firing temperatures (Cone 6).',
      lastEdited: 'Yesterday',
      author: 'Elena Rossi'
    }
  ]);
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(notes[0].id);
  const [isSaving, setIsSaving] = React.useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId);

  React.useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notes_update' && data.roomId === roomId) {
          setNotes(data.notes);
        }
      } catch (e) {
        console.error('Error parsing notes message:', e);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, roomId]);

  const updateNote = (content: string) => {
    if (!activeNoteId) return;
    
    const updatedNotes = notes.map(n => 
      n.id === activeNoteId 
        ? { ...n, content, lastEdited: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : n
    );
    
    setNotes(updatedNotes);
    broadcastUpdate(updatedNotes);
  };

  const broadcastUpdate = (newNotes: Note[]) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsSaving(true);
      socket.send(JSON.stringify({
        type: 'notes_update',
        roomId,
        notes: newNotes
      }));
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const addNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      lastEdited: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Julian'
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    broadcastUpdate(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    if (activeNoteId === id) {
      setActiveNoteId(updatedNotes[0]?.id || null);
    }
    broadcastUpdate(updatedNotes);
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
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
          {notes.map((note) => (
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
          ))}
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
                    onChange={(e) => {
                      const updatedNotes = notes.map(n => n.id === activeNoteId ? { ...n, title: e.target.value } : n);
                      setNotes(updatedNotes);
                      broadcastUpdate(updatedNotes);
                    }}
                    className="text-lg font-black text-primary bg-transparent border-none focus:ring-0 p-0"
                  />
                  <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                    <Clock size={10} />
                    Last edited {activeNote.lastEdited} by {activeNote.author}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
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
            
            <div className="flex-1 p-10">
              <textarea
                value={activeNote.content}
                onChange={(e) => updateNote(e.target.value)}
                placeholder="Start typing your notes here..."
                className="w-full h-full resize-none border-none focus:ring-0 text-sm leading-relaxed text-on-surface-variant font-medium placeholder:opacity-30"
              />
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
    </div>
  );
}
