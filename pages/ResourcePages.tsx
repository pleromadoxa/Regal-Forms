
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
        },
        {
            id: 'gs4',
            title: 'Viewing submissions',
            content: (
                <div className="space-y-4">
                    <p>To see who has responded to your forms:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Go to the <strong>Submissions</strong> page from the main menu.</li>
                        <li>Select the form you want to view from the sidebar.</li>
                        <li>You will see a table of the most recent responses. Click "View" on any row to see the full details in a modal.</li>
                        <li>You can also click "Export CSV" to download the data for analysis in Excel.</li>
                    </ol>
                </div>
            )
        },
        {
            id: 'gs5',
            title: 'Using Templates',
            content: (
                <div className="space-y-4">
                    <p>Don't want to start from scratch? Use a template:</p>
                    <p>Navigate to the <strong>Templates</strong> page. Browse categories like "Business", "Education", or "HR". Click "Use Template" on any card to load that structure directly into the builder. You can then modify it to suit your specific needs.</p>
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
        },
        {
            id: 'ab3',
            title: 'Resetting password',
            content: (
                <div className="space-y-4">
                    <p>If you've forgotten your password:</p>
                    <p>On the Login screen, click "Forgot Password?". Enter your email address, and we will send you a secure link to set a new password. If you are logged in, you can change your password from the <strong>Security</strong> tab in Profile Settings.</p>
                </div>
            )
        },
        {
            id: 'ab4',
            title: 'Managing team members',
            content: (
                <div className="space-y-4">
                    <p>Team collaboration is a Pro feature.</p>
                    <p>In the Form Settings &gt; Collaboration tab, you can invite other users by email to edit specific forms. They will receive an email notification and see the form in their dashboard.</p>
                </div>
            )
        },
        {
            id: 'ab5',
            title: 'Cancelling subscription',
            content: (
                <div className="space-y-4">
                    <p>We're sorry to see you go.</p>
                    <p>To cancel, go to Profile Settings &gt; Billing and click "Cancel Subscription". Your plan will remain active until the end of the current billing cycle, after which your account will revert to the Free tier.</p>
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
        },
        {
            id: 'fb3',
            title: 'Customizing the design',
            content: (
                <div className="space-y-4">
                    <p>Currently, Regal Forms uses a clean, standard layout optimized for conversion.</p>
                    <p>You can customize the "Presentation" settings (Progress Bar, Shuffle Questions) in the Form Settings menu. Future updates will include custom color themes and font selection.</p>
                </div>
            )
        },
        {
            id: 'fb4',
            title: 'Setting up email notifications',
            content: (
                <div className="space-y-4">
                    <p>To get notified when someone submits a form:</p>
                    <p>This feature is enabled by default for the form creator. To change this or add recipients, go to Form Settings &gt; Notifications (coming soon). Currently, check your dashboard for real-time updates.</p>
                </div>
            )
        },
        {
            id: 'fb5',
            title: 'Redirecting after submission',
            content: (
                <div className="space-y-4">
                    <p>By default, users see a "Thank You" message after submitting.</p>
                    <p>You can customize this message in Form Settings &gt; Responses &gt; Confirmation Message. Redirecting to a custom URL is a Pro feature available in the advanced settings.</p>
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
            title: 'Setting up Slack alerts',
            content: (
                <div className="space-y-4">
                    <p>Get notified in your team channel.</p>
                    <p>Create an Incoming Webhook in your Slack workspace settings. Copy the Webhook URL. In Regal Forms Integrations, paste this URL into the Slack configuration card. You will receive a message with submission details instantly.</p>
                </div>
            )
        },
        {
            id: 'in3',
            title: 'Using Webhooks',
            content: (
                <div className="space-y-4">
                    <p>For custom integrations, use our generic Webhook.</p>
                    <p>We send a POST request with a JSON body containing the form ID, submission timestamp, and all field data to any URL you specify. Useful for connecting to custom backends or automation tools like n8n.</p>
                </div>
            )
        },
        {
            id: 'in4',
            title: 'Zapier integration guide',
            content: (
                <div className="space-y-4">
                    <p>Connect to 5,000+ apps.</p>
                    <p>In Zapier, create a "Catch Hook" trigger. Copy the webhook URL Zapier provides. Paste this into the Zapier integration card on Regal Forms. When you test your form, Zapier will receive the data, allowing you to trigger actions in Gmail, Trello, Salesforce, and more.</p>
                </div>
            )
        },
        {
            id: 'in5',
            title: 'Troubleshooting integrations',
            content: (
                <div className="space-y-4">
                    <p>If your data isn't syncing:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Check that the destination URL/Sheet is valid and accessible.</li>
                        <li>Ensure the integration is toggled to "Active" (green indicator).</li>
                        <li>Check your spam folder for email notifications.</li>
                        <li>Contact support if the issue persists.</li>
                    </ul>
                </div>
            )
        }
    ],
    'Analytics': [
        {
            id: 'an1',
            title: 'Understanding submission rates',
            content: (
                <div className="space-y-4">
                    <p>Submission Rate (or Conversion Rate) is calculated as <code>(Total Submissions / Total Views) * 100</code>.</p>
                    <p>A low rate might indicate your form is too long or asking for sensitive info too early. A high rate means your form is performing well!</p>
                </div>
            )
        },
        {
            id: 'an2',
            title: 'Exporting data to CSV',
            content: (
                <div className="space-y-4">
                    <p>Need to analyze data in Excel or SPSS?</p>
                    <p>Go to the Submissions page, select your form, and click the "Export CSV" button in the top right. This generates a downloadable file containing all response data.</p>
                </div>
            )
        },
        {
            id: 'an3',
            title: 'Traffic source analysis',
            content: (
                <div className="space-y-4">
                    <p>Currently, we track "Direct" traffic vs "Referral".</p>
                    <p>In the Analytics Dashboard, you can see a breakdown. Future updates will allow for UTM parameter tracking to see exactly which marketing campaigns are driving responses.</p>
                </div>
            )
        },
        {
            id: 'an4',
            title: 'Device breakdown',
            content: (
                <div className="space-y-4">
                    <p>Knowing if your users are on mobile or desktop is crucial.</p>
                    <p>While we optimize all forms for mobile by default, our Analytics page (Pro feature) will show you the percentage of users on different device types.</p>
                </div>
            )
        },
        {
            id: 'an5',
            title: 'Reading the charts',
            content: (
                <div className="space-y-4">
                    <p>The Analytics page shows a timeline of responses.</p>
                    <p>Peaks usually correspond to when you shared the link. If you see a flat line despite traffic, check your form for broken logic or technical issues.</p>
                </div>
            )
        }
    ],
    'Security': [
        {
            id: 'se1',
            title: 'Data encryption details',
            content: (
                <div className="space-y-4">
                    <p>Your data security is paramount.</p>
                    <p>All data transmitted between your browser and Regal Forms is encrypted using TLS 1.2+. Data at rest in our databases is encrypted using AES-256 standards.</p>
                </div>
            )
        },
        {
            id: 'se2',
            title: 'GDPR compliance',
            content: (
                <div className="space-y-4">
                    <p>We are compliant with GDPR regulations.</p>
                    <p>As a user, you have the right to access, correct, and delete your data (right to be forgotten). You can perform these actions from the Profile Settings &gt; Data &amp; Privacy section.</p>
                </div>
            )
        },
        {
            id: 'se3',
            title: 'Two-factor authentication',
            content: (
                <div className="space-y-4">
                    <p>Enhance your account security.</p>
                    <p>2FA is coming soon. We currently support Google OAuth sign-in, which allows you to leverage Google's 2FA protections for your Regal Forms account.</p>
                </div>
            )
        },
        {
            id: 'se4',
            title: 'Spam protection',
            content: (
                <div className="space-y-4">
                    <p>Keep your data clean.</p>
                    <p>We use automated rate limiting and CAPTCHA-like behavior analysis to prevent bots from flooding your forms with fake submissions.</p>
                </div>
            )
        },
        {
            id: 'se5',
            title: 'Data retention policies',
            content: (
                <div className="space-y-4">
                    <p>How long do we keep your data?</p>
                    <p>We retain your form data as long as your account is active. If you delete a form, the data is permanently removed after 30 days (soft delete) or immediately if you perform a hard delete from settings.</p>
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

  const categories = Object.keys(HELP_ARTICLES);

  const handleCategoryClick = (cat: string) => {
      setCurrentCategory(cat);
      setCurrentArticle(null);
      setActiveFaq(null);
      window.scrollTo(0, 0);
  };

  const handleArticleClick = (article: Article) => {
      setCurrentArticle(article);
      window.scrollTo(0, 0);
  };

  const handleBack = () => {
      if (currentArticle) {
          setCurrentArticle(null);
      } else {
          setCurrentCategory(null);
      }
  };

  // Top 4 generic FAQs for the home view
  const topFaqs = [
    { q: "How do I export my data?", a: "You can export your personal data and form configurations from the Profile Settings page under the 'Data & Privacy' section." },
    { q: "Can I remove branding?", a: "Yes, removing branding is available on our Pro and Enterprise plans. Visit Profile Settings to upgrade." },
    { q: "Is my data GDPR compliant?", a: "Yes. We allow you to export and delete your account at any time from Profile Settings." },
    { q: "How do I connect Google Sheets?", a: "Go to the 'Integrations' page, click Setup on Google Sheets, and enter your spreadsheet URL." }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-8 relative min-h-screen">
      
      {/* Header & Search */}
      <div className="text-center bg-primary/10 rounded-2xl p-10">
        <h1 className="text-3xl font-bold mb-6">
            {currentArticle ? 'Article View' : (currentCategory ? currentCategory : 'How can we help you?')}
        </h1>
        
        {!currentArticle && (
            <div className="relative max-w-xl mx-auto">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles (e.g. 'billing', 'integrations')" 
                    className="w-full p-4 pl-12 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50">search</span>
            </div>
        )}
      </div>

      {/* Navigation Breadcrumb / Back Button */}
      {(currentCategory || currentArticle) && (
          <div className="flex items-center gap-2 text-sm">
              <button onClick={() => { setCurrentCategory(null); setCurrentArticle(null); }} className="hover:underline opacity-60">Help Center</button>
              <span className="opacity-40">/</span>
              {currentArticle ? (
                  <>
                    <button onClick={() => setCurrentArticle(null)} className="hover:underline opacity-60">{currentCategory}</button>
                    <span className="opacity-40">/</span>
                    <span className="font-bold text-primary">{currentArticle.title}</span>
                  </>
              ) : (
                  <span className="font-bold text-primary">{currentCategory}</span>
              )}
              
              <button onClick={handleBack} className="ml-auto flex items-center gap-1 text-primary font-bold hover:underline">
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Back
              </button>
          </div>
      )}

      {/* --- VIEW 1: Home (Categories Grid) --- */}
      {!currentCategory && !currentArticle && (
        <>
            <div className="grid sm:grid-cols-3 gap-6 animate-fade-in">
                {categories.map((cat, i) => (
                    <div 
                        key={i} 
                        onClick={() => handleCategoryClick(cat)}
                        className="p-6 rounded-xl border border-black/10 dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-center group"
                    >
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{cat}</h3>
                        <p className="text-sm text-black/60 dark:text-white/60 mt-2">{HELP_ARTICLES[cat].length} articles</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4 mt-8">
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                {topFaqs.map((faq, i) => (
                    <div 
                        key={i} 
                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                        className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 overflow-hidden transition-all"
                    >
                        <div className="p-4 flex justify-between items-center">
                            <span className="font-medium">{faq.q}</span>
                            <span className={`material-symbols-outlined transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                        </div>
                        {activeFaq === i && (
                            <div className="px-4 pb-4 text-sm text-black/70 dark:text-white/70 leading-relaxed animate-fade-in border-t border-black/5 dark:border-white/5 pt-4">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
      )}

      {/* --- VIEW 2: Category (Article List) --- */}
      {currentCategory && !currentArticle && (
          <div className="flex flex-col gap-4 animate-fade-in">
              {HELP_ARTICLES[currentCategory]
                .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((article) => (
                  <div 
                      key={article.id} 
                      onClick={() => handleArticleClick(article)}
                      className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary cursor-pointer flex justify-between items-center group"
                  >
                      <span className="font-bold text-lg group-hover:text-primary transition-colors">{article.title}</span>
                      <span className="material-symbols-outlined text-black/30 dark:text-white/30 group-hover:text-primary">arrow_forward_ios</span>
                  </div>
              ))}
              {HELP_ARTICLES[currentCategory].length === 0 && (
                  <p className="text-center opacity-50">No articles found.</p>
              )}
          </div>
      )}

      {/* --- VIEW 3: Article Content --- */}
      {currentArticle && (
          <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 animate-fade-in">
              <h2 className="text-3xl font-black mb-6">{currentArticle.title}</h2>
              <div className="prose dark:prose-invert max-w-none text-black/80 dark:text-white/80">
                  {currentArticle.content}
              </div>
              <div className="mt-10 pt-6 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
                  <p className="text-sm opacity-60">Was this article helpful?</p>
                  <div className="flex gap-2">
                      <button className="px-3 py-1 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm">Yes</button>
                      <button className="px-3 py-1 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm">No</button>
                  </div>
              </div>
          </div>
      )}
      
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
