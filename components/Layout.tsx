
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (!currentUser) return;

      // Note: We fetch all notifications for the user and sort/limit client-side
      // to avoid the need for a manual composite index in Firestore (orderBy + where).
      const q = query(
          collection(db, 'notifications'),
          where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
          const notes = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          }));
          
          // Client-side sort: Newest first
          notes.sort((a: any, b: any) => {
              const timeA = a.timestamp?.seconds || 0;
              const timeB = b.timestamp?.seconds || 0;
              return timeB - timeA;
          });

          // Client-side limit: Take top 20
          setNotifications(notes.slice(0, 20));
      }, (error) => {
          console.error("Notification listener error:", error);
      });

      return () => unsubscribe();
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
              setShowNotifications(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const markAsRead = async (notification: any) => {
      if (!notification.read) {
          try {
             await updateDoc(doc(db, 'notifications', notification.id), { read: true });
          } catch(e) { console.error(e); }
      }
      setShowNotifications(false);
      if (notification.link) {
          navigate(notification.link);
      }
  };

  const markAllAsRead = async () => {
      if (notifications.length === 0) return;
      const batch = writeBatch(db);
      let hasUnread = false;
      notifications.forEach(n => {
          if (!n.read) {
              const ref = doc(db, 'notifications', n.id);
              batch.update(ref, { read: true });
              hasUnread = true;
          }
      });
      if (hasUnread) {
          try {
              await batch.commit();
          } catch (e) {
              console.error("Error marking all read", e);
          }
      }
  };

  const formatTime = (timestamp: any) => {
      if (!timestamp) return '';
      const date = new Date(timestamp.seconds * 1000);
      const now = new Date();
      const diff = (now.getTime() - date.getTime()) / 1000; // seconds
      
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString();
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark text-black dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-white/20 dark:border-white/10 px-4 sm:px-10 py-3 z-50 relative bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="size-8 text-primary hover:opacity-80 transition-opacity">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </Link>
          <Link to="/" className="text-lg font-bold leading-tight tracking-[-0.015em] hover:text-primary transition-colors">
            Regal Forms
          </Link>
        </div>
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-6 xl:gap-9">
          {currentUser ? (
            <>
               {isAdmin && (
                   <Link to="/admin" className="text-primary font-bold hover:text-orange-600 text-sm leading-normal transition-colors flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg">
                       <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                       Admin
                   </Link>
               )}
               <Link to="/create" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Builder</Link>
               <Link to="/submissions" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Submissions</Link>
               <Link to="/analytics" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Analytics</Link>
               <Link to="/templates" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Templates</Link>
               <Link to="/integrations" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Integrations</Link>
            </>
          ) : (
            <>
              <Link to="/features" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Features</Link>
              <Link to="/contact" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Contact</Link>
              <Link to="/help" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Support</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                  <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black/70 dark:text-white/70"
                  >
                      <span className="material-symbols-outlined text-xl">notifications</span>
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full border border-white dark:border-black"></span>
                      )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden z-50 animate-fade-in">
                          <div className="flex items-center justify-between p-3 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                              <h3 className="text-sm font-bold">Notifications</h3>
                              {unreadCount > 0 && (
                                  <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-bold">
                                      Mark all read
                                  </button>
                              )}
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                              {notifications.length === 0 ? (
                                  <div className="p-8 text-center text-black/50 dark:text-white/50 text-sm">
                                      No notifications yet.
                                  </div>
                              ) : (
                                  notifications.map((notification) => (
                                      <div 
                                          key={notification.id} 
                                          onClick={() => markAsRead(notification)}
                                          className={`p-3 border-b border-black/5 dark:border-white/5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex gap-3 ${!notification.read ? 'bg-primary/5' : ''}`}
                                      >
                                          <div className={`mt-1 size-2 rounded-full shrink-0 ${!notification.read ? 'bg-primary' : 'bg-transparent'}`}></div>
                                          <div className="flex-1">
                                              <p className="text-sm font-bold text-black dark:text-white">{notification.title}</p>
                                              <p className="text-xs text-black/70 dark:text-white/70 line-clamp-2">{notification.message}</p>
                                              <p className="text-[10px] text-black/40 dark:text-white/40 mt-1">{formatTime(notification.timestamp)}</p>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  )}
              </div>

              <Link to="/profile" className="hidden sm:flex items-center gap-2 text-sm font-bold">
                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs shadow-sm">
                    {currentUser.email?.charAt(0).toUpperCase()}
                </div>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-black/5 dark:bg-white/10 text-black dark:text-white text-sm font-bold leading-normal hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              >
                <span className="truncate">Log out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-black dark:text-white text-sm font-bold leading-normal hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <span className="truncate">Log in</span>
                </Link>
                <Link to="/signup" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
                    <span className="truncate">Sign up</span>
                </Link>
            </div>
          )}
        </div>
      </header>
      
      {children}

      {/* Footer */}
      <footer className="mt-auto border-t border-black/10 dark:border-white/10 bg-white dark:bg-black/40 py-12 px-4 sm:px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg">
                      <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                      </svg>
                      Regal Forms
                  </div>
                  <p className="text-black/60 dark:text-white/60 text-sm">Building the future of data collection with AI-powered forms.</p>
                  <div className="flex gap-3 mt-2">
                      <a href="#" className="text-black/40 hover:text-primary transition-colors font-bold text-xs uppercase">X (Twitter)</a>
                      <a href="#" className="text-black/40 hover:text-primary transition-colors font-bold text-xs uppercase">LinkedIn</a>
                  </div>
              </div>
              
              <div className="flex flex-col gap-3">
                  <h4 className="font-bold">Product</h4>
                  <Link to="/features" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Features</Link>
                  <Link to="/templates" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Templates</Link>
                  <Link to="/integrations" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Integrations</Link>
                  <Link to="/api-docs" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">API Docs</Link>
              </div>

              <div className="flex flex-col gap-3">
                  <h4 className="font-bold">Our Platforms</h4>
                  <a href="https://regalnetwork.online" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 dark:text-white/60 hover:text-primary flex items-center gap-1">
                      Regal Network
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                  </a>
                  <a href="https://meet.regalnetwork.online/" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 dark:text-white/60 hover:text-primary flex items-center gap-1">
                      Regal Meeting
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                  </a>
                  <a href="https://www.regalwork.space" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 dark:text-white/60 hover:text-primary flex items-center gap-1">
                      Regal Workspace
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                  </a>
              </div>

              <div className="flex flex-col gap-3">
                  <h4 className="font-bold">Company</h4>
                  <Link to="/careers" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Careers</Link>
                  <Link to="/blog" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Blog</Link>
                  <Link to="/contact" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Contact</Link>
              </div>

              <div className="flex flex-col gap-3">
                  <h4 className="font-bold">Legal & Support</h4>
                  <Link to="/privacy" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Privacy Policy</Link>
                  <Link to="/terms" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Terms of Service</Link>
                  <Link to="/help" className="text-sm text-black/60 dark:text-white/60 hover:text-primary">Help Center</Link>
              </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-black/10 dark:border-white/10 text-center text-sm text-black/40 dark:text-white/40">
              © {new Date().getFullYear()} Regal Forms, Regal Network Technologies. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default Layout;
