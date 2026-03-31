import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Globe, Share2, Menu, X, Bell, MessageSquare, Repeat, CheckCircle2, Clock, Trash2, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  const navLinks = user 
    ? profile?.onboarding_completed
      ? [
          { name: 'Marketplace', path: '/marketplace' },
          { name: 'About Us', path: '/about' },
          { name: 'Match', path: '/match' },
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Profile', path: '/profile' },
        ]
      : [] // Hide all links during onboarding
    : [
        { name: 'Marketplace', path: '/marketplace' },
        { name: 'Match', path: '/match' },
        { name: 'About Us', path: '/about' },
      ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare size={14} className="text-blue-500" />;
      case 'swap_request': return <Repeat size={14} className="text-orange-500" />;
      case 'swap_accepted': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'session_upcoming': return <Clock size={14} className="text-purple-500" />;
      default: return <Bell size={14} />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-primary tracking-tighter">
          Maanth
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-bold transition-colors duration-300 pb-1 border-b-2",
                location.pathname === link.path
                  ? "text-primary border-primary"
                  : "text-on-surface-variant border-transparent hover:text-primary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center text-on-surface-variant hover:text-primary transition-colors">
            <Search size={20} />
          </button>

          {/* Notifications - Only show if onboarding complete */}
          {user && profile?.onboarding_completed && (
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-background">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-surface-container-high overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <Bell size={32} className="mx-auto text-on-surface-variant opacity-20" />
                            <p className="text-xs font-bold text-on-surface-variant">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id}
                              className={cn(
                                "p-4 border-b border-surface-container-high last:border-0 transition-colors relative group",
                                !n.read ? "bg-primary/5" : "hover:bg-surface-container-low"
                              )}
                            >
                              <Link 
                                to={n.link || '#'} 
                                onClick={() => {
                                  markAsRead(n.id);
                                  setIsNotificationsOpen(false);
                                }}
                                className="flex gap-3"
                              >
                                <div className="mt-1 shrink-0">
                                  {getIcon(n.type)}
                                </div>
                                <div className="space-y-1">
                                  <p className={cn("text-xs font-bold", !n.read ? "text-primary" : "text-on-surface")}>
                                    {n.title}
                                  </p>
                                  <p className="text-[10px] text-on-surface-variant leading-tight line-clamp-2">
                                    {n.description}
                                  </p>
                                  <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-tighter">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </Link>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(n.id);
                                }}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-red-500 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <Link 
                          to="/dashboard" 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="block p-3 text-center text-[10px] font-black text-primary uppercase tracking-widest bg-surface-container-low hover:bg-surface-container transition-colors"
                        >
                          View All Activity
                        </Link>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              {profile?.onboarding_completed && (
                <Link
                  to="/marketplace"
                  className="bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95"
                >
                  Exchange Skill
                </Link>
              )}
              <button 
                onClick={() => logout()}
                className="p-2 text-on-surface-variant hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-primary text-white px-8 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
            >
              <UserIcon size={16} />
              Sign In
            </Link>
          )}
          <button 
            className="md:hidden text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-surface-container-high overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-lg font-bold text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-lg font-bold text-red-500 pt-4 border-t border-surface-container-high"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-surface-container-low mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold text-primary">Maanth</div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            © 2024 Maanth Digital Atelier. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          <a href="#" className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">System Status: Available</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Globe size={18} className="text-primary cursor-pointer" />
          <Share2 size={18} className="text-primary cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
