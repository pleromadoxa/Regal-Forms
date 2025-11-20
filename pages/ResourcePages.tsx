
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

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

// --- Support Bot Component ---
const SupportBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
        { role: 'model', text: "Hi there! I'm Regal AI. How can I help you with Regal Forms today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;
        
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            const prompt = `
                You are Regal AI, a helpful and friendly customer support bot for "Regal Forms", a SaaS form builder.
                Regal Forms features include: Drag-and-drop builder, AI form generation, Analytics, Templates, Integrations (Google Sheets, Slack, Zapier), and User Management.
                
                Answer the user's question concisely and professionally. If you don't know the answer, suggest they contact human support at support@regalforms.xyz.
                
                User Question: ${userMsg}
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            const reply = response.text || "I'm having trouble connecting right now. Please try again later.";
            setMessages(prev => [...prev, { role: 'model', text: reply }]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please contact human support." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-80 sm:w-96 h-[500px] bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="p-4 bg-primary text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">smart_toy</span>
                            <span className="font-bold">Regal AI Support</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background-light dark:bg-black/20">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-tl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-white/10 p-3 rounded-xl rounded-tl-none flex gap-1 items-center">
                                    <div className="size-2 bg-black/40 dark:bg-white/40 rounded-full animate-bounce"></div>
                                    <div className="size-2 bg-black/40 dark:bg-white/40 rounded-full animate-bounce delay-100"></div>
                                    <div className="size-2 bg-black/40 dark:bg-white/40 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#1e1e1e] flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-background-light dark:bg-black/20 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="size-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                    </form>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="size-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
            >
                {isOpen ? (
                    <span className="material-symbols-outlined text-2xl">close</span>
                ) : (
                    <span className="material-symbols-outlined text-2xl">chat</span>
                )}
            </button>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slideUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

// --- Help Center Page ---
export const HelpCenterPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-12 relative">
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
      
      {/* Floating Support Bot */}
      <SupportBot />
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
