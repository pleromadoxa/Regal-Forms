import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark text-black dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-black/10 dark:border-white/10 px-4 sm:px-10 py-3 z-50 relative bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
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
          <Link to="/" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Features</Link>
          <Link to="/" className="text-black/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors">Contact</Link>
        </nav>
        <div className="flex gap-2">
          <button className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-colors">
            <span className="truncate">Login</span>
          </button>
          <Link to="/create" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-orange-600 text-white dark:text-black text-sm font-bold transition-colors">
            <span className="truncate">Get Started</span>
          </Link>
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
            <p className="mt-4 text-sm text-black/60 dark:text-white/60">© 2024 Regal Forms Inc. All rights reserved.</p>
          </div>
          <div>
            <h3 className="font-semibold">Product</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">Features</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">Careers</a></li>
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Resources</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">Blog</a></li>
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">Help Center</a></li>
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="text-black/60 dark:text-white/60 hover:text-primary transition-colors" href="#">Terms</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;