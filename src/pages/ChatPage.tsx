import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, MoreVertical, Video, Calendar, CheckCircle2, MessageSquare, Presentation, FileText, X, Link as LinkIcon, File, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile, getSignedUrl, deleteFile } from '../lib/storage';
import { db, Resource } from '../lib/db';
import Whiteboard from '../components/workspace/Whiteboard';
import VideoCall from '../components/workspace/VideoCall';
import ClassNotes from '../components/workspace/ClassNotes';

type WorkspaceTab = 'chat' | 'whiteboard' | 'video' | 'notes' | 'resources';

export default function ChatPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [message, setMessage] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [signedResourceUrls, setSignedResourceUrls] = useState<Record<string, string>>({});
  const [uploadingResource, setUploadingResource] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { 
      id: '1', 
      sender: 'Elena Rossi', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 
      text: "Hey Julian! I've been practicing the wireframe components we discussed. Do you have time to look at the mobile navigation flow this evening?", 
      time: '10:42 AM',
      isMe: false,
      type: 'text'
    },
    { 
      id: '2', 
      sender: 'Julian', 
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', 
      text: "That sounds great, Elena. I'm actually finishing up a prototype now. I'd love to swap some feedback—maybe we can spend the first 30 mins on UI and the rest on the kiln techniques?", 
      time: '10:45 AM',
      isMe: true,
      type: 'text'
    },
    {
      id: '3',
      sender: 'Elena Rossi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      text: "I've proposed a session for our review. Let me know if this works for you!",
      time: '10:50 AM',
      isMe: false,
      type: 'proposal',
      proposalDetails: {
        title: 'Studio Pottery & Figma Review',
        timeRange: 'Tonight, 6:00 PM – 8:00 PM',
        status: 'pending'
      }
    }
  ]);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const roomId = "julian-elena"; // Mock room ID

  useEffect(() => {
    async function loadResources() {
      try {
        const data = await db.resources.list(roomId);
        setResources(data);
        
        // Generate signed URLs for all resources
        const urls: Record<string, string> = {};
        for (const res of data) {
          urls[res.id] = await getSignedUrl(res.file_path);
        }
        setSignedResourceUrls(urls);
      } catch (error) {
        console.error('Error loading resources:', error);
      }
    }
    loadResources();
  }, [roomId]);

  const handleResourceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingResource(true);
    try {
      const { path } = await uploadFile(file, user.uid, 'resources', roomId);
      
      const newResource = await db.resources.create({
        room_id: roomId,
        user_id: user.uid,
        title: file.name,
        file_path: path,
        file_type: file.type,
        file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });

      setResources(prev => [newResource, ...prev]);
      const signedUrl = await getSignedUrl(path);
      setSignedResourceUrls(prev => ({ ...prev, [newResource.id]: signedUrl }));
    } catch (error) {
      console.error('Error uploading resource:', error);
    } finally {
      setUploadingResource(false);
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    try {
      await deleteFile(resource.file_path);
      await db.resources.delete(resource.id);
      setResources(prev => prev.filter(r => r.id !== resource.id));
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  useEffect(() => {
    // Determine WebSocket protocol (ws or wss)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket Connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          const isMe = data.sender === 'Julian'; // Mock current user as Julian
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: data.sender,
            avatar: data.avatar,
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe,
            type: data.msgType || 'text',
            proposalDetails: data.proposalDetails
          }]);

          if (!isMe) {
            addNotification({
              type: data.msgType === 'proposal' ? 'session_upcoming' : 'message',
              title: data.msgType === 'proposal' ? `New Proposal from ${data.sender}` : `New message from ${data.sender}`,
              description: data.text,
              link: '/chat'
            });
          }
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      socket.close();
    };
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || !socketRef.current) return;

    const payload = {
      type: 'chat_message',
      sender: 'Julian',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      text: message
    };

    socketRef.current.send(JSON.stringify(payload));
    setMessage('');
  };

  const conversations = [
    { 
      id: '1', 
      name: 'Elena Rossi', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 
      lastMsg: 'Looking forward to our ...', 
      time: '2M',
      online: true,
      active: true 
    },
    { 
      id: '2', 
      name: 'Marcus Chen', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 
      lastMsg: 'The Javascript module i...', 
      time: '1H' 
    },
    { 
      id: '3', 
      name: 'Sarah Miller', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', 
      lastMsg: 'Thanks for the feedback!', 
      time: 'Yesterday' 
    }
  ];

  const tabs = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'whiteboard', icon: Presentation, label: 'Whiteboard' },
    { id: 'notes', icon: FileText, label: 'Notes' },
    { id: 'resources', icon: LinkIcon, label: 'Resources' },
    { id: 'video', icon: Video, label: 'Video Call' },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#F5F2ED] overflow-hidden relative">
      {/* Sidebar Toggle Button (Floating when collapsed) */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-white shadow-lg rounded-full text-primary hover:scale-110 transition-all border border-surface-container-high"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col p-6 space-y-8 transition-all duration-300 overflow-hidden",
        isSidebarCollapsed ? "w-0 p-0 opacity-0" : "w-80"
      )}>
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] uppercase font-bold text-on-surface-variant tracking-[0.2em]">Conversations</h2>
          <button 
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-1.5 hover:bg-white rounded-lg text-on-surface-variant transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
          <div className="space-y-4">
            {conversations.map((chat) => (
              <div 
                key={chat.id} 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-3xl transition-all cursor-pointer",
                  chat.active ? "bg-white shadow-sm" : "hover:bg-white/50"
                )}
              >
                <div className="relative">
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#FDD828] border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-primary truncate">{chat.name}</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant">{chat.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">{chat.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>

        {/* Weekly Goal Card */}
        <div className="mt-auto bg-[#002A24] text-white p-6 rounded-[2rem] space-y-4">
          <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Weekly Goal</p>
          <h3 className="text-xl font-black leading-tight">Master Wheel Throwing</h3>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FDD828] w-[75%]" />
            </div>
            <p className="text-[10px] font-bold opacity-60">75% Complete • 2 sessions left</p>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          {/* Header */}
          <header className="px-8 py-6 border-b border-surface-container-high flex justify-between items-center bg-[#F9F7F4]">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full border-2 border-white object-cover" referrerPolicy="no-referrer" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full border-2 border-white object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="font-black text-primary">Julian & Elena</h3>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">UI Design for Pottery</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setActiveTab('video')}
                className="flex items-center gap-2 px-4 py-2 bg-[#002A24] text-white rounded-full hover:scale-105 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest"
              >
                <Video size={14} />
                Start Video Call
              </button>

              {/* Workspace Tabs */}
              <nav className="flex items-center bg-surface-container-low p-1 rounded-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-on-surface-variant hover:bg-white/50"
                  )}
                >
                  <tab.icon size={14} />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-6 text-primary">
              <button className="hover:scale-110 transition-transform"><MoreVertical size={20} /></button>
            </div>
          </div>
        </header>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-[#F9F7F4]/50">
                    <div className="flex justify-center">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-[0.2em] bg-surface-container-low px-4 py-1 rounded-full">Tuesday, Oct 24</span>
                    </div>

                    <AnimatePresence initial={false}>
                      {messages.map((msg) => (
                        <motion.div 
                          key={msg.id} 
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "flex items-start gap-4 max-w-2xl",
                            msg.isMe ? "ml-auto flex-row-reverse" : ""
                          )}
                        >
                          {!msg.isMe && (
                            <img src={msg.avatar} className="w-8 h-8 rounded-full object-cover mt-1" referrerPolicy="no-referrer" />
                          )}
                          <div className={cn(
                            "p-6 rounded-[2rem] shadow-sm space-y-2 relative",
                            msg.isMe 
                              ? "bg-[#002A24] text-white rounded-tr-none shadow-lg" 
                              : "bg-white rounded-tl-none",
                            msg.type === 'proposal' && !msg.isMe && "bg-secondary-container border-2 border-secondary/30",
                            msg.type === 'proposal' && msg.isMe && "bg-primary-container border-2 border-primary/30 text-primary"
                          )}>
                            {msg.type === 'proposal' && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-secondary/20 rounded-full text-secondary">
                                  <Calendar size={14} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Session Proposal</span>
                              </div>
                            )}
                            
                            <p className="text-sm leading-relaxed">
                              {msg.text}
                            </p>

                            {msg.type === 'proposal' && msg.proposalDetails && (
                              <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-surface-container-high space-y-3">
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-primary">{msg.proposalDetails.title}</h4>
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">{msg.proposalDetails.timeRange}</p>
                                </div>
                                {!msg.isMe && msg.proposalDetails.status === 'pending' && (
                                  <div className="flex gap-2 pt-2">
                                    <button className="flex-1 py-2 bg-[#FDD828] text-primary text-[10px] font-black rounded-full hover:scale-[0.98] transition-all">Accept</button>
                                    <button className="flex-1 py-2 bg-surface-container-low text-primary text-[10px] font-bold rounded-full hover:bg-surface-container transition-all">Decline</button>
                                  </div>
                                )}
                              </div>
                            )}

                            <span className={cn(
                              "text-[10px] font-bold uppercase block",
                              msg.isMe ? "text-white/60" : "text-on-surface-variant"
                            )}>
                              {msg.time}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <footer className="p-8 bg-white border-t border-surface-container-high">
                    <div className="max-w-4xl mx-auto flex flex-col gap-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const payload = {
                              type: 'chat_message',
                              sender: 'Julian',
                              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
                              text: "I'd like to propose a session for our next swap!",
                              msgType: 'proposal',
                              proposalDetails: {
                                title: 'Pottery Wheel Basics',
                                timeRange: 'Saturday, 10:00 AM – 12:00 PM',
                                status: 'pending'
                              }
                            };
                            socketRef.current?.send(JSON.stringify(payload));
                          }}
                          className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all"
                        >
                          <Calendar size={14} />
                          Propose Session
                        </button>
                        <button 
                          onClick={() => setActiveTab('video')}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-all"
                        >
                          <Video size={14} />
                          Start Video Call
                        </button>
                      </div>
                      <form 
                        onSubmit={handleSendMessage}
                        className="relative flex items-center gap-4"
                      >
                        <div className="flex-1 relative">
                          <button 
                            type="button"
                            onClick={() => attachmentInputRef.current?.click()}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform"
                          >
                            <Paperclip size={20} />
                          </button>
                          <input 
                            type="file"
                            ref={attachmentInputRef}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && user) {
                                try {
                                  const { path, url } = await uploadFile(file, user.uid, 'chat', roomId);
                                  // In a real app, we'd send the path/url via WebSocket
                                  setMessage(prev => prev + ` [Attachment: ${file.name}](${url})`);
                                } catch (error) {
                                  console.error('Error uploading attachment:', error);
                                }
                              }
                            }}
                          />
                          <input 
                            type="text" 
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-surface-bright border-2 border-surface-container-high rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-12 h-12 bg-[#002A24] text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                        >
                          <Send size={20} className="rotate-[-45deg] translate-x-0.5 -translate-y-0.5" />
                        </button>
                      </form>
                    </div>
                  </footer>
                </motion.div>
              )}

              {activeTab === 'whiteboard' && (
                <motion.div 
                  key="whiteboard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full"
                >
                  <Whiteboard socket={socketRef.current} roomId="julian-elena" />
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div 
                  key="notes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <ClassNotes socket={socketRef.current} roomId="julian-elena" />
                </motion.div>
              )}

              {activeTab === 'resources' && (
                <motion.div 
                  key="resources"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full bg-[#F9F7F4]/50 overflow-y-auto p-10"
                >
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-black text-primary tracking-tight">Shared Resources</h2>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Learning materials for this swap</p>
                      </div>
                      <button 
                        onClick={() => resourceInputRef.current?.click()}
                        disabled={uploadingResource}
                        className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                      >
                        <Plus size={14} />
                        {uploadingResource ? 'Uploading...' : 'Add Resource'}
                      </button>
                      <input 
                        type="file"
                        ref={resourceInputRef}
                        className="hidden"
                        onChange={handleResourceUpload}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {resources.map((resource, i) => (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white p-6 rounded-[2rem] shadow-sm border border-surface-container-high flex items-center gap-4 group hover:shadow-md transition-all cursor-pointer"
                        >
                          <a 
                            href={signedResourceUrls[resource.id]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center gap-4 min-w-0"
                          >
                            <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              <File size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-primary truncate">{resource.title}</h4>
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                                {resource.file_size} • {new Date(resource.created_at!).toLocaleDateString()}
                              </p>
                            </div>
                          </a>
                          <button 
                            onClick={() => handleDeleteResource(resource)}
                            className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Quick Links Section */}
                    <div className="bg-[#002A24] rounded-[2.5rem] p-10 text-white space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black italic">Recommended Reading</h3>
                        <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Curated by your partner</p>
                      </div>
                      <div className="space-y-4">
                        {[
                          "The Design of Everyday Things - Don Norman",
                          "A Potter's Book - Bernard Leach",
                          "Grid Systems in Graphic Design - Josef Müller-Brockmann"
                        ].map((book, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="w-8 h-8 rounded-full bg-[#FDD828] text-primary flex items-center justify-center text-xs font-black">
                              {i + 1}
                            </div>
                            <span className="text-sm font-medium group-hover:translate-x-1 transition-transform">{book}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'video' && (
                <motion.div 
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <VideoCall onEndCall={() => setActiveTab('chat')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
