
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
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
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-9">
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
            </>
          ) : (
            <>
              <Link to="/features" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Features</Link>
              <Link to="/contact" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Contact</Link>
            </>
          )}
        </nav>
        <div className="flex gap-4 items-center">
          {currentUser ? (
             <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold leading-none">{currentUser.displayName || 'User'}</span>
                    <span className="text-xs text-black/50 dark:text-white/50 leading-none mt-1">{currentUser.email}</span>
                </div>
                <Link to="/profile" className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm hover:ring-2 hover:ring-primary/50 transition-all">
                    {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                        (currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()
                    )}
                </Link>
                <button 
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                    Logout
                </button>
             </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-colors">
                <span className="truncate">Login</span>
              </Link>
              <Link to="/signup" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-orange-600 text-white dark:text-black text-sm font-bold transition-colors">
                <span className="truncate">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 dark:border-white/10 mt-auto py-12 px-4 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="size-6 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold">Regal Forms</h2>
            </div>
            <p className="mt-4 text-sm text-black/60 dark:text-white/60">© 2025 Regal Forms, Regal Network Technologies. All rights reserved.</p>
          </div>
          <div>
            <h3 className="font-semibold">Product</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" to="/features">Features</Link></li>
              <li><Link className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" to="/templates">Templates</Link></li>
              <li><Link className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" to="/integrations">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" to="/careers">Careers</Link></li>
              <li><Link className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Our Platforms</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="http://regalnetwork.online" target="_blank" rel="noopener noreferrer">Regal Network</a></li>
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="http://meet.regalnetwork.online" target="_blank" rel="noopener noreferrer">Regal Meet</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link></li>
              <li><Link className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" to="/terms">Terms of Service</Link></li>
              <li><Link className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" to="/privacy">Cookies</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
