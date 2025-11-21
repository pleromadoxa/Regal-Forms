
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

// --- Helper: Simple Markdown Formatter ---
// Parses simple markdown bolding (**text**) and line breaks for the bot
const formatMessage = (text: string) => {
    // Escape HTML first to prevent XSS (basic)
    let safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // Bold
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Code blocks (inline)
    safeText = safeText.replace(/`(.*?)`/g, "<code class='bg-black/10 dark:bg-white/10 px-1 rounded font-mono text-xs'>$1</code>");
    
    // Line breaks
    safeText = safeText.replace(/\n/g, "<br />");

    return <span dangerouslySetInnerHTML={{ __html: safeText }} />;
};

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
        { role: 'model', text: "👋 Hi there! I'm Regal AI. Ask me anything about building forms, integrations, or your account." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        "How do I create a form?",
        "Connect to Google Sheets",
        "Reset my password",
        "Pricing plans"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (textOverride?: string) => {
        const userText = textOverride || input.trim();
        if (!userText) return;
        
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
             setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, but I cannot connect to the server right now (API Key missing). Please contact support manually." }]);
             setIsLoading(false);
             return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `
                You are "Regal AI", the advanced support assistant for Regal Forms.
                
                System Knowledge:
                - **Core Feature:** Drag-and-drop form builder, AI form generation from text prompts.
                - **Integrations:** Google Sheets, Slack, Mailchimp, Zapier (via Webhooks), Notion, HubSpot.
                - **Pricing:** Free, Pro (Unlimited forms/AI), Enterprise.
                - **Common Issues:** 
                  - "Service storage not available": Usually network issue or firebase config.
                  - "Permission denied": User needs to log in.
                
                Tone: Professional, friendly, emoji-friendly, concise.
                Formatting: Use bolding (**text**) for key terms. Use lists if explaining steps.
                
                If the user asks to talk to a human, tell them to visit the "Contact" page.
                
                User Query: ${userText}
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            const reply = response.text || "I'm having trouble thinking right now. Please try again.";
            setMessages(prev => [...prev, { role: 'model', text: reply }]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'model', text: "I encountered a connection error. Please check your internet or try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-display">
            {isOpen && (
                <div className="w-[90vw] sm:w-[400px] h-[550px] bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col overflow-hidden animate-slide-up relative">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-secondary to-purple-700 text-white flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <span className="material-symbols-outlined text-xl">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Regal AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs opacity-90">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#f8f9fa] dark:bg-[#121212]">
                        <div className="text-center text-xs text-black/40 dark:text-white/40 my-2">
                            Today
                        </div>
                        
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="size-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mr-2 border border-secondary/20 shrink-0 mt-1">
                                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    </div>
                                )}
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-secondary text-white rounded-tr-sm' 
                                    : 'bg-white dark:bg-[#2a2a2a] border border-black/5 dark:border-white/5 rounded-tl-sm text-black/80 dark:text-white/90'
                                }`}>
                                    {formatMessage(msg.text)}
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                 <div className="size-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mr-2 border border-secondary/20 shrink-0">
                                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                                </div>
                                <div className="bg-white dark:bg-[#2a2a2a] p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center border border-black/5 dark:border-white/5">
                                    <div className="size-2 bg-secondary/60 rounded-full animate-bounce"></div>
                                    <div className="size-2 bg-secondary/60 rounded-full animate-bounce delay-100"></div>
                                    <div className="size-2 bg-secondary/60 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions (Only show if few messages) */}
                    {messages.length < 3 && !isLoading && (
                        <div className="px-4 pb-2 bg-[#f8f9fa] dark:bg-[#121212] flex gap-2 overflow-x-auto no-scrollbar">
                            {suggestions.map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSend(s)}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold text-secondary hover:bg-secondary hover:text-white transition-colors shadow-sm"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-[#1e1e1e] border-t border-black/10 dark:border-white/10 flex gap-2 items-center">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 bg-black/5 dark:bg-white/5 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/50 border border-transparent focus:bg-white dark:focus:bg-black transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="size-10 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-105 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                    </form>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="group relative size-16 rounded-full bg-secondary text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all hover:rotate-90"
            >
                {isOpen ? (
                    <span className="material-symbols-outlined text-3xl">close</span>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                        <span className="absolute top-0 right-0 size-4 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                    </>
                )}
            </button>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-slide-up {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

// --- Knowledge Base Data ---
interface Article {
    id: string;
    title: string;
    content: React.ReactNode;
}

const HELP_ARTICLES: Record<string, Article[]> = {
    'Getting Started': [
        {
            id: 'gs1',
            title: 'Creating your first form',
            content: (
                <div className="space-y-4">
                    <p>Welcome to Regal Forms! Creating your first form is simple and intuitive. Follow these steps to get started:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li><strong>Navigate to the Builder:</strong> Click the "Builder" or "Create" button in the top navigation bar.</li>
                        <li><strong>Choose a Starting Point:</strong> You can start from scratch or use our AI generator by typing a description like "Event Registration Form".</li>
                        <li><strong>Drag and Drop Fields:</strong> Use the sidebar on the left to drag new fields onto your canvas.</li>
                        <li><strong>Customize:</strong> Click on any field in the canvas to edit its label, options, and settings.</li>
                        <li><strong>Save & Publish:</strong> Once you are happy, click "Publish Form" in the top right corner.</li>
                    </ol>
                    <p>That's it! You now have a live form ready to share.</p>
                </div>
            )
        },
        {
            id: 'gs2',
            title: 'Understanding the Dashboard',
            content: (
                <div className="space-y-4">
                    <p>Your dashboard is the command center for all your data collection needs. Here is a quick tour:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>My Forms:</strong> See a list of all your published and draft forms.</li>
                        <li><strong>Analytics:</strong> View high-level metrics like total views and submission rates.</li>
                        <li><strong>Submissions:</strong> Access the raw data collected from your forms.</li>
                        <li><strong>Integrations:</strong> Connect your forms to external tools like Slack and Google Sheets.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'gs3',
            title: 'Sharing your form',
            content: (
                <div className="space-y-4">
                    <p>Once your form is published, you have several ways to share it:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Direct Link:</strong> Copy the unique URL provided after publishing and share it via email, social media, or SMS.</li>
                        <li><strong>Custom Slug:</strong> Go to "Settings" -&gt; "General" to create a friendly URL like <code>regalforms.xyz/#/form/my-event</code>.</li>
                        <li><strong>Social Buttons:</strong> Use the built-in social share buttons on the confirmation screen to post directly to X (Twitter) or LinkedIn.</li>
                    </ul>
                </div>
            )
        }
    ],
    'Account & Billing': [
        {
            id: 'ab1',
            title: 'Upgrading your plan',
            content: (
                <div className="space-y-4">
                    <p>Regal Forms offers Free, Pro, and Enterprise tiers. To upgrade:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Go to your <strong>Profile Settings</strong>.</li>
                        <li>Click on the "Subscription" tab (if available).</li>
                        <li>Select the plan that fits your needs. Pro plans include unlimited forms and AI generations.</li>
                    </ol>
                </div>
            )
        },
        {
            id: 'ab2',
            title: 'Updating payment method',
            content: (
                <div className="space-y-4">
                    <p>To update your card on file:</p>
                    <p>Navigate to Profile Settings &gt; Billing. Click "Update Payment Method". We use Stripe for secure payment processing, so your card details are never stored on our servers directly.</p>
                </div>
            )
        }
    ],
    'Form Builder': [
        {
            id: 'fb1',
            title: 'Field types explained',
            content: (
                <div className="space-y-4">
                    <p>We offer a variety of field types:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Basic:</strong> Text, Email, Number, Phone.</li>
                        <li><strong>Choice:</strong> Select, Radio, Checkbox.</li>
                        <li><strong>Rich:</strong> Date/Time, File Upload, Rating, Slider.</li>
                        <li><strong>Special:</strong> Product (for sales), Payment (Stripe/PayPal), Signature, and HTML content blocks.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'fb2',
            title: 'Using conditional logic',
            content: (
                <div className="space-y-4">
                    <p>Conditional logic allows you to show or hide fields based on previous answers.</p>
                    <p>Click on a field in the builder to open its settings. Scroll down to "Conditional Logic". Click "Add Condition". For example: <em>Show this field IF "Satisfaction" Equals "Dissatisfied"</em>.</p>
                </div>
            )
        }
    ],
    'Integrations': [
        {
            id: 'in1',
            title: 'Connecting to Google Sheets',
            content: (
                <div className="space-y-4">
                    <p>Sync data to a spreadsheet instantly.</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Go to the <strong>Integrations</strong> page.</li>
                        <li>Find Google Sheets and click "Setup".</li>
                        <li>Enter the URL of a Google Sheet you have edit access to.</li>
                        <li>Specify the "Sheet Name" (e.g., Sheet1).</li>
                        <li>Click Connect. New rows will be added for every submission.</li>
                    </ol>
                </div>
            )
        },
        {
            id: 'in2',
            title: 'Zapier integration guide',
            content: (
                <div className="space-y-4">
                    <p>Connect to 5,000+ apps.</p>
                    <p>In Zapier, create a "Catch Hook" trigger. Copy the webhook URL Zapier provides. Paste this into the Zapier integration card on Regal Forms. When you test your form, Zapier will receive the data, allowing you to trigger actions in Gmail, Trello, Salesforce, and more.</p>
                </div>
            )
        }
    ]
};

// --- Help Center Page ---
export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Navigation State
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  // Add state for feedback interaction
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);

  const categories = Object.keys(HELP_ARTICLES);

  const handleCategoryClick = (cat: string) => {
      setCurrentCategory(cat);
      setCurrentArticle(null);
      setActiveFaq(null);
      window.scrollTo(0, 0);
  };

  const handleArticleClick = (article: Article) => {
      setCurrentArticle(article);
      setFeedbackGiven(null); // Reset feedback when opening new article
      window.scrollTo(0, 0);
  };

  const handleBack = () => {
      if (currentArticle) {
          setCurrentArticle(null);
      } else {
          setCurrentCategory(null);
      }
  };

  const topFaqs = [
    { q: "How do I export my data?", a: "You can export your personal data and form configurations from the Profile Settings page under the 'Data & Privacy' section." },
    { q: "Can I remove branding?", a: "Yes, removing branding is available on our Pro and Enterprise plans. Visit Profile Settings to upgrade." },
    { q: "Is my data GDPR compliant?", a: "Yes. We allow you to export and delete your account at any time from Profile Settings." },
    { q: "How do I connect Google Sheets?", a: "Go to the 'Integrations' page, click Setup on Google Sheets, and enter your spreadsheet URL." }
  ];

  const CATEGORY_ICONS: Record<string, string> = {
      'Getting Started': 'rocket_launch',
      'Account & Billing': 'credit_card',
      'Form Builder': 'build_circle',
      'Integrations': 'hub',
      'Analytics': 'monitoring',
      'Security': 'security'
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Header */}
      <div className="relative bg-[#0f172a] text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-4 border border-secondary/30">Help Center</span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">How can we help?</h1>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative group">
                  <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for answers (e.g. 'API Key', 'Pricing')" 
                      className="w-full p-5 pl-14 rounded-xl border-0 bg-white/10 backdrop-blur-md text-white placeholder:text-white/50 focus:bg-white focus:text-black focus:ring-4 focus:ring-secondary/50 shadow-xl transition-all outline-none text-lg"
                  />
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-black/50 text-2xl transition-colors">search</span>
              </div>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 -mt-10 relative z-20">
          
          {/* Navigation Breadcrumb */}
          {(currentCategory || currentArticle) && (
              <div className="flex items-center gap-2 text-sm mb-8 bg-white dark:bg-[#1e1e1e] p-3 rounded-lg shadow-sm w-fit border border-black/10 dark:border-white/10">
                  <button onClick={() => { setCurrentCategory(null); setCurrentArticle(null); }} className="hover:text-secondary flex items-center gap-1 font-bold text-black/60 dark:text-white/60"><span className="material-symbols-outlined text-lg">home</span> Home</button>
                  <span className="opacity-30">/</span>
                  {currentArticle ? (
                      <>
                        <button onClick={() => setCurrentArticle(null)} className="hover:text-secondary font-bold text-black/60 dark:text-white/60">{currentCategory}</button>
                        <span className="opacity-30">/</span>
                        <span className="font-bold text-secondary">{currentArticle.title.substring(0, 20)}...</span>
                      </>
                  ) : (
                      <span className="font-bold text-secondary">{currentCategory}</span>
                  )}
              </div>
          )}

          {/* --- VIEW 1: Home Categories --- */}
          {!currentCategory && !currentArticle && (
            <div className="animate-fade-in space-y-16">
                {/* Categories Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, i) => (
                        <div 
                            key={i} 
                            onClick={() => handleCategoryClick(cat)}
                            className="p-8 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-black/5 dark:border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            <div className="size-14 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">{CATEGORY_ICONS[cat] || 'article'}</span>
                            </div>
                            <h3 className="font-bold text-xl group-hover:text-secondary transition-colors mb-2">{cat}</h3>
                            <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                                {HELP_ARTICLES[cat]?.length || 0} articles available
                            </p>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary">quiz</span> 
                        Common Questions
                    </h2>
                    <div className="grid gap-4">
                        {topFaqs.map((faq, i) => (
                            <div 
                                key={i} 
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${activeFaq === i ? 'bg-secondary/5 border-secondary/30' : 'bg-white dark:bg-[#1e1e1e] border-black/5 dark:border-white/5 hover:border-secondary/30'}`}
                            >
                                <div className="p-5 flex justify-between items-center">
                                    <span className="font-bold">{faq.q}</span>
                                    <span className={`material-symbols-outlined transition-transform text-black/40 dark:text-white/40 ${activeFaq === i ? 'rotate-180 text-secondary' : ''}`}>expand_more</span>
                                </div>
                                {activeFaq === i && (
                                    <div className="px-5 pb-5 text-sm text-black/70 dark:text-white/70 leading-relaxed animate-fade-in">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">Still stuck?</h3>
                        <p className="text-white/80">Our support team is usually available 9am-5pm EST.</p>
                    </div>
                    <Link to="/contact" className="px-8 py-3 bg-white text-blue-700 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">mail</span> Contact Support
                    </Link>
                </div>
            </div>
          )}

          {/* --- VIEW 2: Article List --- */}
          {currentCategory && !currentArticle && (
              <div className="animate-fade-in">
                  <h2 className="text-3xl font-black mb-8">{currentCategory}</h2>
                  <div className="grid gap-4">
                      {HELP_ARTICLES[currentCategory]
                        ?.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((article) => (
                          <div 
                              key={article.id} 
                              onClick={() => handleArticleClick(article)}
                              className="p-6 rounded-xl bg-white dark:bg-[#1e1e1e] border border-black/5 dark:border-white/5 hover:border-secondary cursor-pointer flex justify-between items-center group transition-all shadow-sm"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="size-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/40 dark:text-white/40 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                                      <span className="material-symbols-outlined">description</span>
                                  </div>
                                  <span className="font-bold text-lg group-hover:text-secondary transition-colors">{article.title}</span>
                              </div>
                              <span className="material-symbols-outlined text-black/20 dark:text-white/20 group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                          </div>
                      ))}
                      {(HELP_ARTICLES[currentCategory]?.length || 0) === 0 && (
                          <p className="text-center opacity-50 py-10">No articles found matching your search.</p>
                      )}
                  </div>
              </div>
          )}

          {/* --- VIEW 3: Article Content --- */}
          {currentArticle && (
              <div className="animate-fade-in max-w-3xl mx-auto">
                  <div className="p-8 md:p-12 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-black/5 dark:border-white/5 shadow-xl">
                      <h2 className="text-3xl md:text-4xl font-black mb-8 text-secondary">{currentArticle.title}</h2>
                      <div className="prose dark:prose-invert max-w-none text-black/80 dark:text-white/80 leading-relaxed">
                          {currentArticle.content}
                      </div>
                      
                      <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <p className="text-sm opacity-60 font-medium">Was this article helpful?</p>
                          
                          {feedbackGiven ? (
                              <div className="text-sm font-bold text-green-500 animate-fade-in flex items-center gap-2">
                                  <span className="material-symbols-outlined">check_circle</span>
                                  {feedbackGiven === 'yes' ? 'Thanks for your feedback!' : 'Thanks! We will improve this.'}
                              </div>
                          ) : (
                              <div className="flex gap-3">
                                  <button 
                                    onClick={() => setFeedbackGiven('yes')} 
                                    className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 hover:border-green-200 text-sm font-bold transition-colors flex items-center gap-2"
                                  >
                                      <span className="material-symbols-outlined text-lg">thumb_up</span> Yes
                                  </button>
                                  <button 
                                    onClick={() => setFeedbackGiven('no')} 
                                    className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 text-sm font-bold transition-colors flex items-center gap-2"
                                  >
                                      <span className="material-symbols-outlined text-lg">thumb_down</span> No
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}
      </div>
      
      {/* Floating Support Bot */}
      <SupportBot />
    </div>
  );
};

// --- ApiDocsPage remains same ---
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
