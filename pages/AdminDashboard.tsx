
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { GoogleGenAI } from '@google/genai';

const AdminDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'forms' | 'messages' | 'logs' | 'ai'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [countryStats, setCountryStats] = useState<Record<string, number>>({});
  
  // AI State
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Derived Stats
  const [stats, setStats] = useState({
      totalUsers: 0,
      totalForms: 0,
      totalSubmissions: 0,
      activeCountries: 0
  });

  const fetchData = useCallback(async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      setError(null);
      try {
          // 1. Fetch Users
          const usersSnap = await getDocs(collection(db, 'users'));
          const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsers(usersList);

          // 2. Fetch Forms
          const formsSnap = await getDocs(collection(db, 'forms'));
          const formsList = formsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setForms(formsList);

          // 3. Fetch Activity Logs (limit 100 for display)
          // Note: We sort client-side to avoid index requirements errors
          const logsQ = query(collection(db, 'activity_logs'), limit(100)); 
          const logsSnap = await getDocs(logsQ);
          let logsList = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort logs client-side (newest first)
          logsList.sort((a: any, b: any) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
          setLogs(logsList);

          // 4. Fetch Contact Messages
          const msgsQ = query(collection(db, 'contact_messages'), limit(50));
          const msgsSnap = await getDocs(msgsQ);
          let msgsList = msgsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          msgsList.sort((a: any, b: any) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
          setMessages(msgsList);

          // Calculate Stats (Safely cast to numbers)
          const totalSubmissions = formsList.reduce((acc, f: any) => acc + Number(f.stats?.responses || 0), 0);
          
          // Extract Country Data from Logs
          const cStats: Record<string, number> = {};
          logsList.forEach((log: any) => {
              if (log.locale) {
                  // Attempt to extract country code from locale (e.g., "en-US" -> "US")
                  const parts = log.locale.split('-');
                  const country = parts.length > 1 ? parts[1] : log.locale;
                  cStats[country] = (cStats[country] || 0) + 1;
              }
          });
          setCountryStats(cStats);
          
          setStats({
              totalUsers: usersList.length,
              totalForms: formsList.length,
              totalSubmissions: totalSubmissions,
              activeCountries: Object.keys(cStats).length
          });

      } catch (e: any) {
          console.error("Admin Data Fetch Error", e);
          setError(e.message || "Failed to fetch data. Please check permissions.");
      } finally {
          setIsLoading(false);
      }
  }, [isAdmin]);

  useEffect(() => {
      if (!isAdmin) {
          navigate('/');
          return;
      }
      fetchData();
  }, [isAdmin, navigate, fetchData]);

  const generateAIReport = async () => {
      setIsGeneratingReport(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
          const prompt = `
            Act as a Senior Data Analyst for "Regal Forms" (a SaaS form builder).
            Analyze the following platform data and provide a strategic summary, identifying trends, potential issues, and growth opportunities.
            
            Data:
            - Total Users: ${stats.totalUsers}
            - Total Forms Created: ${stats.totalForms}
            - Total Submissions: ${stats.totalSubmissions}
            - Active Countries: ${stats.activeCountries}
            - Top Countries: ${JSON.stringify(Object.entries(countryStats).slice(0, 5))}
            - Recent Activity Log Sample: ${JSON.stringify(logs.slice(0, 5).map(l => l.type))}

            Format the response in Markdown with emojis. Keep it professional but engaging.
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt
          });
          
          setAiReport(response.text || "Could not generate report.");
      } catch (e) {
          console.error(e);
          setAiReport("Error generating AI report. Please check API configuration.");
      } finally {
          setIsGeneratingReport(false);
      }
  };

  if (isLoading && users.length === 0) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-background-dark text-white">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-primary font-bold animate-pulse">Loading Admin Console...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden font-display">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-surface-dark flex flex-col">
            <div className="p-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
                <div>
                    <h1 className="font-black text-lg leading-none">Regal Admin</h1>
                    <p className="text-xs text-white/40 mt-1">Platform Control</p>
                </div>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
                <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                    <span className="material-symbols-outlined">dashboard</span> Overview
                </button>
                <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                    <span className="material-symbols-outlined">group</span> Users
                </button>
                <button onClick={() => setActiveTab('forms')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'forms' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                    <span className="material-symbols-outlined">description</span> Forms
                </button>
                 <button onClick={() => setActiveTab('messages')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                    <span className="material-symbols-outlined">mail</span> Messages
                </button>
                <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                    <span className="material-symbols-outlined">list_alt</span> Activity Logs
                </button>
                <button onClick={() => setActiveTab('ai')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'ai' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                    <span className="material-symbols-outlined">auto_awesome</span> Regal AI Analyst
                </button>
            </nav>

            <div className="p-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                        {currentUser?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{currentUser?.email}</p>
                        <p className="text-xs text-green-400">Super Admin</p>
                    </div>
                </div>
                <Link to="/" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold text-white transition-colors">
                    <span className="material-symbols-outlined">home</span>
                    Main App
                </Link>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background-dark p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black capitalize">{activeTab}</h2>
                <button 
                    onClick={fetchData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-bold disabled:opacity-50"
                >
                    <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                    Refresh Data
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {activeTab === 'overview' && (
                <div className="flex flex-col gap-8 animate-fade-in">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm font-bold uppercase tracking-wider">Total Users</p>
                                    <h3 className="text-4xl font-black mt-2">{stats.totalUsers}</h3>
                                </div>
                                <span className="material-symbols-outlined text-4xl text-blue-500 opacity-50">group</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm font-bold uppercase tracking-wider">Forms Created</p>
                                    <h3 className="text-4xl font-black mt-2">{stats.totalForms}</h3>
                                </div>
                                <span className="material-symbols-outlined text-4xl text-primary opacity-50">description</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm font-bold uppercase tracking-wider">Submissions</p>
                                    <h3 className="text-4xl font-black mt-2">{stats.totalSubmissions}</h3>
                                </div>
                                <span className="material-symbols-outlined text-4xl text-green-500 opacity-50">send</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm font-bold uppercase tracking-wider">Countries</p>
                                    <h3 className="text-4xl font-black mt-2">{stats.activeCountries}</h3>
                                </div>
                                <span className="material-symbols-outlined text-4xl text-purple-500 opacity-50">public</span>
                            </div>
                        </div>
                    </div>

                    {/* Map / Country List */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 h-[400px] flex flex-col">
                            <h3 className="text-xl font-bold mb-4">Geographic Distribution</h3>
                            <div className="flex-1 bg-black/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                
                                {Object.keys(countryStats).length > 0 ? (
                                    <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-2 p-8 overflow-y-auto">
                                        {Object.entries(countryStats).map(([code, count]) => (
                                            <div key={code} className="px-4 py-2 bg-primary/20 border border-primary/40 rounded-lg flex flex-col items-center justify-center min-w-[80px] shadow-lg backdrop-blur-sm">
                                                <span className="text-xs font-bold text-primary/80 uppercase">Region</span>
                                                <span className="text-lg font-black text-white">{code}</span>
                                                <span className="text-xs font-bold text-primary">{count} users</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                     <div className="flex flex-col items-center text-white/30">
                                        <span className="material-symbols-outlined text-4xl mb-2">public_off</span>
                                        <p className="font-bold">No geographic data available yet</p>
                                     </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-[400px] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">Top Locations</h3>
                            <div className="flex flex-col gap-3">
                                {Object.entries(countryStats)
                                    .sort(([,a], [,b]) => b - a)
                                    .map(([code, count], i) => (
                                    <div key={code} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white/40 font-bold text-sm w-6">#{i + 1}</span>
                                            <span className="font-bold">{code}</span>
                                        </div>
                                        <span className="font-bold text-primary">{count} users</span>
                                    </div>
                                ))}
                                {Object.keys(countryStats).length === 0 && (
                                    <p className="text-white/40 italic text-center mt-10">No location data collected yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/60 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-bold">User</th>
                                    <th className="p-4 font-bold">Email</th>
                                    <th className="p-4 font-bold">Role</th>
                                    <th className="p-4 font-bold">Joined</th>
                                    <th className="p-4 font-bold">Last Login</th>
                                    <th className="p-4 font-bold text-right">UID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(user => (
                                    <tr key={user.id} className={`hover:bg-white/10 transition-colors ${user.email === currentUser?.email ? 'bg-primary/5' : ''}`}>
                                        <td className="p-4 font-bold flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white border border-white/10">
                                                {user.displayName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div>{user.displayName || 'Unknown'}</div>
                                                {user.email === currentUser?.email && <span className="text-[10px] text-primary font-bold uppercase">You</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-white/70">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                                                {user.role || 'User'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white/50">{user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '-'}</td>
                                        <td className="p-4 text-white/50">{user.lastLogin?.seconds ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : '-'}</td>
                                        <td className="p-4 text-right text-white/30 font-mono text-xs">{user.uid?.substring(0, 8)}...</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'forms' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/60 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-bold">Title</th>
                                    <th className="p-4 font-bold">Owner ID</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold text-right">Responses</th>
                                    <th className="p-4 font-bold text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {forms.map(form => (
                                    <tr key={form.id} className="hover:bg-white/10 transition-colors">
                                        <td className="p-4 font-bold">{form.title}</td>
                                        <td className="p-4 text-white/50 font-mono text-xs">{form.userId}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${form.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                                {form.status || 'draft'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-white">{form.stats?.responses || 0}</td>
                                        <td className="p-4 text-right text-white/60">{form.stats?.views || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                     <div className="grid gap-4">
                        {messages.map(msg => (
                            <div key={msg.id} className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                         <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                            {msg.name?.charAt(0).toUpperCase() || 'U'}
                                         </div>
                                         <div>
                                             <h3 className="font-bold text-lg">{msg.name}</h3>
                                             <p className="text-sm text-white/60">{msg.email}</p>
                                         </div>
                                    </div>
                                    <span className="text-xs text-white/40 font-mono">
                                        {msg.submittedAt?.seconds ? new Date(msg.submittedAt.seconds * 1000).toLocaleString() : 'Just now'}
                                    </span>
                                </div>
                                <div className="p-4 rounded-lg bg-black/20 text-white/90 text-sm leading-relaxed">
                                    {msg.message}
                                </div>
                                <div className="flex gap-2 justify-end">
                                     <button className="px-3 py-1.5 rounded text-xs font-bold bg-white/10 hover:bg-white/20 transition-colors">Archive</button>
                                     <a href={`mailto:${msg.email}`} className="px-3 py-1.5 rounded text-xs font-bold bg-primary text-white hover:bg-orange-600 transition-colors">Reply</a>
                                </div>
                            </div>
                        ))}
                        {messages.length === 0 && (
                             <p className="text-white/40 italic text-center mt-10">No messages found.</p>
                        )}
                     </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="space-y-2">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-full flex items-center justify-center ${log.type === 'submission' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        <span className="material-symbols-outlined">{log.type === 'submission' ? 'inbox' : 'info'}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{log.type === 'submission' ? `New Submission for "${log.formTitle || 'Form'}"` : 'System Event'}</p>
                                        <p className="text-xs text-white/50 mt-1">Locale: <span className="text-white/70">{log.locale || 'Unknown'}</span> • Timezone: <span className="text-white/70">{log.timeZone || 'Unknown'}</span></p>
                                    </div>
                                </div>
                                <span className="text-xs text-white/40 font-mono">
                                    {log.submittedAt?.seconds ? new Date(log.submittedAt.seconds * 1000).toLocaleString() : 'Unknown Time'}
                                </span>
                            </div>
                        ))}
                         {logs.length === 0 && (
                            <p className="text-white/40 italic text-center mt-10">No activity logs found.</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="flex flex-col gap-6 animate-fade-in h-full">
                     <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div>
                            <h2 className="text-2xl font-black text-secondary mb-1">Regal AI Analyst</h2>
                            <p className="text-white/60 text-sm">Get strategic insights based on your current platform data.</p>
                        </div>
                        <button 
                            onClick={generateAIReport}
                            disabled={isGeneratingReport}
                            className="px-6 py-3 bg-secondary hover:bg-purple-600 text-white font-bold rounded-lg shadow-lg shadow-secondary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingReport ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">auto_awesome</span>}
                            {isGeneratingReport ? 'Analyzing Data...' : 'Generate New Report'}
                        </button>
                     </div>

                     <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-8 overflow-y-auto">
                         {!aiReport && !isGeneratingReport && (
                             <div className="h-full flex flex-col items-center justify-center opacity-50">
                                 <span className="material-symbols-outlined text-6xl mb-4 text-secondary">analytics</span>
                                 <p className="text-xl font-bold">Ready to analyze your platform data.</p>
                                 <p className="text-sm">Click "Generate New Report" above to get insights on users, growth, and engagement.</p>
                             </div>
                         )}
                         
                         {aiReport && (
                             <div className="prose prose-invert max-w-none prose-headings:text-secondary prose-strong:text-white prose-li:text-white/80">
                                 <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                             </div>
                         )}
                     </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default AdminDashboard;
