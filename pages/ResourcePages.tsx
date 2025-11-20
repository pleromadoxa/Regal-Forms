import React from 'react';
import { Link } from 'react-router-dom';

// --- Blog Page ---
export const BlogPage: React.FC = () => {
  const posts = [
    { title: "10 Tips for High-Converting Forms", cat: "Best Practices", date: "Mar 15, 2025", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=60" },
    { title: "How AI is Changing Data Collection", cat: "Technology", date: "Mar 10, 2025", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=500&q=60" },
    { title: "New Feature: Zapier Integration", cat: "Product Update", date: "Mar 01, 2025", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=60" },
    { title: "Case Study: How TechCorp Saved 20h/Week", cat: "Case Study", date: "Feb 20, 2025", img: "https://images.unsplash.com/photo-1553877615-30c730db910a?auto=format&fit=crop&w=500&q=60" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-12">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight mb-4">Regal Forms Blog</h1>
        <p className="text-lg text-black/70 dark:text-white/70">Latest news, tips, and insights from the team.</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, i) => (
            <div key={i} className="flex flex-col rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:shadow-lg transition-all cursor-pointer group">
                <div className="h-48 overflow-hidden">
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                        <span>{post.cat}</span>
                        <span>{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{post.title}</h3>
                    <span className="text-primary font-bold text-sm mt-auto pt-4 flex items-center gap-1">Read Article <span className="material-symbols-outlined text-sm">arrow_forward</span></span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// --- Help Center Page ---
export const HelpCenterPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-12">
      <div className="text-center bg-primary/10 rounded-2xl p-10">
        <h1 className="text-3xl font-bold mb-6">How can we help you?</h1>
        <div className="relative max-w-xl mx-auto">
            <input 
                type="text" 
                placeholder="Search articles (e.g. 'billing', 'integrations')" 
                className="w-full p-4 pl-12 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50">search</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {['Getting Started', 'Account & Billing', 'Form Builder', 'Integrations', 'Analytics', 'Security'].map((cat, i) => (
            <div key={i} className="p-6 rounded-xl border border-black/10 dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-center">
                <h3 className="font-bold text-lg">{cat}</h3>
                <p className="text-sm text-black/60 dark:text-white/60 mt-2">5 articles</p>
            </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        {[
            "How do I export my data?",
            "Can I remove the Regal Forms branding?",
            "Is my data GDPR compliant?",
            "How do I connect to Google Sheets?"
        ].map((q, i) => (
            <div key={i} className="p-4 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 flex justify-between items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/10">
                <span className="font-medium">{q}</span>
                <span className="material-symbols-outlined">expand_more</span>
            </div>
        ))}
      </div>
    </div>
  );
};

// --- API Docs Page ---
export const ApiDocsPage: React.FC = () => {
  return (
    <div className="w-full flex h-[calc(100vh-80px)] overflow-hidden">
       {/* Sidebar */}
       <div className="w-64 border-r border-black/10 dark:border-white/10 hidden md:flex flex-col p-6 overflow-y-auto bg-background-light dark:bg-background-dark">
          <h2 className="font-bold text-lg mb-6">API Reference</h2>
          <div className="flex flex-col gap-6 text-sm">
             <div>
                <p className="font-bold text-black/50 dark:text-white/50 uppercase tracking-wider mb-2 text-xs">Authentication</p>
                <ul className="flex flex-col gap-2">
                    <li className="text-primary font-medium">Introduction</li>
                    <li className="text-black/70 dark:text-white/70 hover:text-primary cursor-pointer">API Keys</li>
                </ul>
             </div>
             <div>
                <p className="font-bold text-black/50 dark:text-white/50 uppercase tracking-wider mb-2 text-xs">Endpoints</p>
                <ul className="flex flex-col gap-2">
                    <li className="text-black/70 dark:text-white/70 hover:text-primary cursor-pointer">Get Forms</li>
                    <li className="text-black/70 dark:text-white/70 hover:text-primary cursor-pointer">Get Submissions</li>
                    <li className="text-black/70 dark:text-white/70 hover:text-primary cursor-pointer">Create Webhook</li>
                </ul>
             </div>
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold uppercase">v1.0</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-6">Introduction</h1>
            <p className="text-lg text-black/70 dark:text-white/70 mb-8">
                The Regal Forms API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
            </p>

            <h2 className="text-2xl font-bold mb-4">Authentication</h2>
            <p className="text-black/70 dark:text-white/70 mb-4">
                Authenticate your requests by including your secret API key in the <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-sm font-mono">Authorization</code> header.
            </p>

            <div className="bg-[#1e1e1e] text-white p-6 rounded-xl font-mono text-sm overflow-x-auto shadow-lg">
                <div className="flex gap-2 mb-4 text-white/50 border-b border-white/10 pb-2">
                    <span>bash</span>
                </div>
<pre>{`curl https://api.regalforms.com/v1/forms \\
  -H "Authorization: Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc"`}</pre>
            </div>
            
            <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-4">
                <span className="material-symbols-outlined text-blue-500">info</span>
                <div>
                    <h3 className="font-bold text-blue-500">Base URL</h3>
                    <p className="text-sm text-black/70 dark:text-white/70 mt-1">All API requests should be made to <code className="bg-black/5 dark:bg-white/10 px-1 rounded">https://api.regalforms.com/v1</code></p>
                </div>
            </div>
          </div>
       </div>
    </div>
  );
};
