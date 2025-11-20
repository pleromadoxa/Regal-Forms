
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
            const q = query(collection(db, 'forms'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const formList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FormData));
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
  
  // Use stats from DB or default to 0
  const stats = selectedForm?.stats || { views: 0, responses: 0, completionRate: 0 };
  // Mock chart data for visual effect since we don't have historical aggregated data yet
  const chartData = [0,0,0,0,0,0,0,0,0,0,0, stats.responses > 0 ? 100 : 0]; 

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (forms.length === 0) {
      return (
        <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-20 text-center items-center">
            <h1 className="text-3xl font-black tracking-tight mb-4">Analytics Dashboard</h1>
            <p className="text-lg text-black/70 dark:text-white/70 mb-8">You haven't created any forms yet.</p>
            <div className="p-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <span className="material-symbols-outlined text-5xl text-black/20 dark:text-white/20 mb-4">analytics</span>
                <p>Create a form to start seeing data here.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-10 gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight">Analytics Dashboard</h1>
          <p className="text-black/70 dark:text-white/70">Overview of your form performance and response metrics.</p>
        </div>
        
        <div className="flex flex-col gap-1 min-w-[250px]">
            <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50 tracking-wider">Select Form</label>
            <div className="relative">
                <select 
                    value={selectedFormId}
                    onChange={(e) => setSelectedFormId(e.target.value)}
                    className="w-full p-3 pr-10 rounded-lg bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold appearance-none outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer shadow-sm"
                >
                    {forms.map(f => (
                        <option key={f.id} value={f.id}>{f.title}</option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black/50 dark:text-white/50">expand_more</span>
            </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Views", value: stats.views, change: "0%", positive: true },
          { label: "Responses", value: stats.responses, change: "0%", positive: true },
          { label: "Completion Rate", value: `${stats.completionRate}%`, change: "0%", positive: true },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-xl bg-white dark:bg-background-dark border border-black/10 dark:border-white/10 shadow-sm animate-fade-in">
            <p className="text-sm font-medium text-black/60 dark:text-white/60">{stat.label}</p>
            <div className="flex items-baseline gap-3 mt-2">
              <h3 className="text-3xl font-bold text-black dark:text-white">{stat.value}</h3>
              <span className={`text-sm font-bold ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-background-dark border border-black/10 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Responses (Last 12 Days)</h3>
          {/* CSS Bar Chart Mockup using real-ish data structure */}
          <div className="flex items-end justify-between h-64 gap-2 w-full px-2">
            {chartData.map((height: number, i: number) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                 <div className="relative w-full bg-primary/10 dark:bg-primary/20 rounded-t-md overflow-hidden group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors" style={{ height: `${Math.max(height, 5)}%` }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-500" style={{ height: '0%', animation: `grow 1s ease-out forwards ${i * 0.05}s` }}>
                       <style>{`@keyframes grow { to { height: 100%; } }`}</style>
                    </div>
                 </div>
                 <span className="text-xs text-black/40 dark:text-white/40">D-{12-i}</span>
              </div>
            ))}
          </div>
          {stats.responses === 0 && (
              <div className="text-center text-sm text-black/40 mt-4 italic">No response data available yet.</div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-background-dark border border-black/10 dark:border-white/10 shadow-sm">
           <h3 className="text-lg font-bold mb-6">Traffic Source</h3>
           {stats.views > 0 ? (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Direct Link</span>
                            <span className="text-black/60 dark:text-white/60">100%</span>
                        </div>
                        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `100%` }}></div>
                        </div>
                    </div>
                </div>
           ) : (
               <div className="flex flex-col items-center justify-center h-40 text-black/40 dark:text-white/40">
                   <span className="material-symbols-outlined text-3xl mb-2">traffic</span>
                   <span className="text-sm">No traffic recorded</span>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
