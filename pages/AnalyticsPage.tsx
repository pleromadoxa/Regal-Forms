
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface FormStats {
  views: number;
  responses: number;
  completionRate: number;
}

interface FormData {
    id: string;
    title: string;
    createdAt: any;
    stats?: FormStats;
}

const AnalyticsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const q = query(collection(db, 'forms'), where('userId', '==', currentUser.uid));
            const snapshot = await getDocs(q);
            const formList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FormData));
            
            formList.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setForms(formList);
            if (formList.length > 0) {
                setSelectedFormId(formList[0].id);
            }
        } catch (e) {
            console.error("Error fetching forms for analytics", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchForms();
  }, [currentUser]);

  const selectedForm = forms.find(f => f.id === selectedFormId);
  
  const stats = selectedForm?.stats || { views: 0, responses: 0, completionRate: 0 };
  // Mock chart data
  const chartData = [0,0,0,0,0,0,0,0,0,0,0, stats.responses > 0 ? 100 : 0]; 

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-[#1e1b4b]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
    );
  }

  if (forms.length === 0) {
      return (
        <div className="flex flex-col w-full h-screen items-center justify-center bg-[#1e1b4b] text-purple-100 px-4">
            <div className="p-10 rounded-2xl bg-purple-900/20 border border-purple-500/20 text-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-6xl text-purple-400/50 mb-6">analytics</span>
                <h1 className="text-3xl font-black tracking-tight mb-4 text-white">Analytics Dashboard</h1>
                <p className="text-lg text-purple-200/70 mb-8">You haven't created any forms yet.</p>
                <p className="text-sm font-bold text-purple-300">Create a form to start seeing insights.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full min-h-screen bg-[#1e1b4b] text-purple-100 font-display">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-purple-500/20 pb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-purple-400">
                        <span className="material-symbols-outlined">monitoring</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Insights</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Analytics Dashboard</h1>
                    <p className="text-purple-200/60">Real-time performance metrics for your forms.</p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[280px]">
                    <label className="text-xs font-bold uppercase text-purple-400 tracking-wider">Selected Form</label>
                    <div className="relative group">
                        <select 
                            value={selectedFormId}
                            onChange={(e) => setSelectedFormId(e.target.value)}
                            className="w-full p-4 pr-12 rounded-xl bg-purple-900/40 border border-purple-500/30 font-bold appearance-none outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-lg transition-all text-white hover:bg-purple-900/60"
                        >
                            {forms.map(f => (
                                <option key={f.id} value={f.id} className="bg-[#1e1b4b] text-white py-2">{f.title}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400 group-hover:text-white transition-colors">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                { label: "Total Views", value: stats.views, icon: "visibility", color: "text-blue-400" },
                { label: "Responses", value: stats.responses, icon: "inbox", color: "text-green-400" },
                { label: "Completion Rate", value: `${stats.completionRate}%`, icon: "donut_large", color: "text-purple-400" },
                ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-purple-900/20 border border-purple-500/10 shadow-lg backdrop-blur-sm hover:bg-purple-900/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-bold text-purple-200/60 uppercase tracking-wider">{stat.label}</p>
                        <span className={`material-symbols-outlined text-2xl opacity-50 group-hover:opacity-100 transition-opacity ${stat.color}`}>{stat.icon}</span>
                    </div>
                    <h3 className="text-4xl font-black text-white">{stat.value}</h3>
                </div>
                ))}
            </div>

            {/* Chart & Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Chart Area */}
                <div className="lg:col-span-2 p-8 rounded-2xl bg-purple-900/20 border border-purple-500/10 shadow-lg backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-purple-400"></span>
                        Response Activity
                    </h3>
                    
                    {/* CSS Bar Chart Mockup */}
                    <div className="flex items-end justify-between h-64 gap-3 w-full px-2">
                        {chartData.map((height: number, i: number) => (
                        <div key={i} className="flex flex-col items-center gap-3 flex-1 group cursor-pointer">
                            <div className="relative w-full bg-purple-500/10 rounded-t-lg overflow-hidden group-hover:bg-purple-500/20 transition-colors h-full flex items-end">
                                <div 
                                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                                    style={{ height: `${Math.max(height, 2)}%`, transition: 'height 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-bold text-purple-200/40">D-{12-i}</span>
                        </div>
                        ))}
                    </div>
                    {stats.responses === 0 && (
                        <div className="text-center text-sm text-purple-200/40 mt-6 italic font-medium">No response activity in the last 12 days.</div>
                    )}
                </div>

                {/* Side Panel */}
                <div className="flex flex-col gap-6">
                    {/* Traffic Source */}
                    <div className="p-8 rounded-2xl bg-purple-900/20 border border-purple-500/10 shadow-lg backdrop-blur-sm flex-1">
                        <h3 className="text-xl font-bold text-white mb-6">Traffic Source</h3>
                        {stats.views > 0 ? (
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-purple-200">Direct Link</span>
                                        <span className="text-white">100%</span>
                                    </div>
                                    <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg" style={{ width: `100%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-purple-200/30">
                                <span className="material-symbols-outlined text-4xl mb-2">traffic</span>
                                <span className="text-sm font-bold">No traffic recorded</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Export */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Need this data?</h3>
                        <p className="text-purple-100/80 text-sm mb-4">Export your analytics report to share with your team.</p>
                        <button className="w-full py-3 rounded-xl bg-white text-purple-700 font-bold text-sm hover:bg-purple-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AnalyticsPage;
