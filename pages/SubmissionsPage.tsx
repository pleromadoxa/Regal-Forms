
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface FormStats {
  views: number;
  responses: number;
  completionRate: number;
  avgTime: string;
}

interface FormOverview {
  id: string;
  title: string;
  status?: 'published' | 'draft';
  createdAt: any;
  updatedAt: any;
  stats: FormStats;
  // Store other form data for drafts to pass to builder
  description?: string;
  fields?: any[];
  
  // Settings & Config
  collectEmails?: boolean;
  limitOneResponse?: boolean;
  restrictToOrg?: boolean;
  allowResponseEditing?: boolean;
  showProgressBar?: boolean;
  shuffleQuestions?: boolean;
  collaborators?: string[];
  slug?: string;
  submitButtonText?: string;
  successMessage?: string;
}

interface Submission {
  id: string;
  date: string;
  timestamp: number; // Added for sorting
  data: Record<string, any>;
}

const SubmissionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [forms, setForms] = useState<FormOverview[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [viewMode, setViewMode] = useState<'published' | 'drafts'>('published');

  // Fetch User Forms
  useEffect(() => {
    const fetchForms = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        // Removed orderBy to prevent index/permission errors
        const q = query(collection(db, 'forms'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const formsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: doc.data().status || 'published' // default to published for old data
        } as FormOverview));
        
        // Client-side sort by updatedAt desc
        formsList.sort((a, b) => {
            const dateA = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
            const dateB = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        setForms(formsList);
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, [currentUser]);

  const filteredForms = forms.filter(f => f.status === (viewMode === 'drafts' ? 'draft' : 'published'));

  // Auto-select first form when switching views
  useEffect(() => {
      if (filteredForms.length > 0 && viewMode === 'published') {
          // Only auto-select for published to show stats. 
          // For drafts, we just list them.
          if (!selectedFormId || !filteredForms.find(f => f.id === selectedFormId)) {
              setSelectedFormId(filteredForms[0].id);
          }
      } else {
          setSelectedFormId(null);
      }
  }, [viewMode, forms]);

  // Fetch Submissions for Selected Form (Only for Published)
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedFormId || viewMode === 'drafts') {
          setSubmissions([]);
          return;
      }
      setIsLoadingSubs(true);
      try {
        // Removed orderBy to prevent index/permission errors
        const q = query(collection(db, 'forms', selectedFormId, 'submissions'), limit(50));
        const querySnapshot = await getDocs(q);
        const subsList = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                date: data.submittedAt ? new Date(data.submittedAt.seconds * 1000).toLocaleString() : 'Unknown Date',
                timestamp: data.submittedAt ? data.submittedAt.seconds : 0,
                data: data.responses || {}
            } as Submission;
        });
        
        // Client-side sort
        subsList.sort((a, b) => b.timestamp - a.timestamp);

        setSubmissions(subsList);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setIsLoadingSubs(false);
      }
    };

    fetchSubmissions();
  }, [selectedFormId, viewMode]);

  const selectedForm = forms.find(f => f.id === selectedFormId);

  const handleDraftClick = (form: FormOverview) => {
      // Navigate to builder with form data
      navigate('/create', { 
          state: { 
              formId: form.id,
              formData: {
                  title: form.title,
                  description: form.description,
                  fields: form.fields || [],
                  collectEmails: form.collectEmails, // Ensure settings carry over
                  limitOneResponse: form.limitOneResponse,
                  restrictToOrg: form.restrictToOrg,
                  allowResponseEditing: form.allowResponseEditing,
                  showProgressBar: form.showProgressBar,
                  shuffleQuestions: form.shuffleQuestions,
                  collaborators: form.collaborators,
                  slug: form.slug,
                  submitButtonText: form.submitButtonText,
                  successMessage: form.successMessage,
                  stats: form.stats
              }
          } 
      });
  };

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-screen w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="flex w-full max-w-[1400px] mx-auto h-[calc(100vh-65px)] overflow-hidden">
      
      {/* Sidebar Form List */}
      <div className="w-80 shrink-0 border-r border-black/10 dark:border-white/10 bg-background-light dark:bg-background-dark flex flex-col">
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex flex-col gap-3">
          <h2 className="text-lg font-bold">My Forms</h2>
          {/* Tabs */}
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg">
             <button 
                onClick={() => setViewMode('published')}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${viewMode === 'published' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-black/50 dark:text-white/50 hover:text-black'}`}
             >
                Published
             </button>
             <button 
                onClick={() => setViewMode('drafts')}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${viewMode === 'drafts' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-black/50 dark:text-white/50 hover:text-black'}`}
             >
                Drafts
             </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 gap-2 flex flex-col">
          {filteredForms.length === 0 ? (
              <div className="text-center p-8 opacity-50 text-sm">
                  No {viewMode} forms found.
              </div>
          ) : (
              filteredForms.map(form => (
                <button
                  key={form.id}
                  onClick={() => viewMode === 'published' ? setSelectedFormId(form.id) : handleDraftClick(form)}
                  className={`text-left p-3 rounded-lg transition-colors flex flex-col gap-1 group ${selectedFormId === form.id && viewMode === 'published' ? 'bg-primary text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white'}`}
                >
                  <div className="flex justify-between items-start">
                      <span className="font-bold text-sm truncate flex-1">{form.title}</span>
                      {viewMode === 'drafts' && (
                          <span className="material-symbols-outlined text-sm opacity-50 group-hover:text-primary">edit</span>
                      )}
                  </div>
                  <div className={`flex justify-between text-xs ${selectedFormId === form.id && viewMode === 'published' ? 'text-white/80' : 'text-black/50 dark:text-white/50'}`}>
                    <span>{form.updatedAt ? new Date(form.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                    {viewMode === 'published' && <span>{form.stats?.responses || 0} responses</span>}
                  </div>
                </button>
              ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1a2f4a]/50">
        
        {viewMode === 'drafts' ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                 <div className="size-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl opacity-50 text-primary">edit_note</span>
                 </div>
                 <h2 className="text-2xl font-bold mb-2">Select a draft to continue editing</h2>
                 <p className="text-black/60 dark:text-white/60 mb-8 max-w-md">
                     Drafts are saved automatically when you click "Save Draft" in the builder. Click on any draft in the sidebar to resume where you left off.
                 </p>
                 <Link to="/create" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
                     Create New Form
                 </Link>
            </div>
        ) : (
            selectedForm ? (
                <>
                    {/* Header */}
                    <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-white dark:bg-background-dark">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">{selectedForm.title}</h1>
                        <p className="text-sm text-black/60 dark:text-white/60">Overview and Submissions</p>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => {
                                const url = `${window.location.origin}/#/form/${selectedForm.slug || selectedForm.id}`;
                                navigator.clipboard.writeText(url);
                                alert("Link copied to clipboard!");
                            }}
                            className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">share</span>
                            Share
                        </button>
                        <Link to="/analytics" className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-bold transition-colors">
                        Full Analytics
                        </Link>
                        <button disabled={submissions.length === 0} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        Export CSV
                        </button>
                    </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Mini Analytics Cards */}
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <div className="p-4 rounded-xl bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10">
                                <div className="text-xs text-black/50 dark:text-white/50 uppercase font-bold tracking-wider">Total Responses</div>
                                <div className="text-2xl font-black mt-1">{selectedForm.stats?.responses || 0}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10">
                                <div className="text-xs text-black/50 dark:text-white/50 uppercase font-bold tracking-wider">Completion Rate</div>
                                <div className="text-2xl font-black mt-1">{selectedForm.stats?.completionRate || 0}%</div>
                            </div>
                            <div className="p-4 rounded-xl bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10">
                                <div className="text-xs text-black/50 dark:text-white/50 uppercase font-bold tracking-wider">Views</div>
                                <div className="text-2xl font-black mt-1">{selectedForm.stats?.views || 0}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10">
                                <div className="text-xs text-black/50 dark:text-white/50 uppercase font-bold tracking-wider">Avg Time</div>
                                <div className="text-2xl font-black mt-1">{selectedForm.stats?.avgTime || '0m'}</div>
                            </div>
                        </div>

                        {/* Responses Table */}
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-background-dark overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-between items-center">
                                <h3 className="font-bold">Recent Submissions</h3>
                                <span className="text-xs text-black/50 dark:text-white/50">
                                    {isLoadingSubs ? "Loading..." : `Showing ${submissions.length}`}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-background-light dark:bg-white/5 text-black/70 dark:text-white/70">
                                        <tr>
                                            <th className="p-4 font-semibold border-b border-black/5 dark:border-white/5 w-48">Date</th>
                                            {submissions.length > 0 ? Object.keys(submissions[0].data).slice(0, 4).map(key => (
                                                <th key={key} className="p-4 font-semibold border-b border-black/5 dark:border-white/5">{key}</th>
                                            )) : <th className="p-4 font-semibold border-b border-black/5 dark:border-white/5">Data</th>}
                                            <th className="p-4 font-semibold border-b border-black/5 dark:border-white/5 w-20">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        {isLoadingSubs ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center">
                                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                </td>
                                            </tr>
                                        ) : submissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-black/50 dark:text-white/50 italic">
                                                    No submissions received yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-black/60 dark:text-white/60">{sub.date}</td>
                                                    {Object.values(sub.data).slice(0, 4).map((val: any, idx) => (
                                                        <td key={idx} className="p-4 font-medium truncate max-w-[200px]">
                                                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                        </td>
                                                    ))}
                                                    {Object.keys(sub.data).length === 0 && <td className="p-4 text-black/40 italic">No data</td>}
                                                    <td className="p-4">
                                                        <button className="text-primary hover:underline font-bold text-xs">View</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="size-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl opacity-50">assignment</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Select a form to view details</h2>
                    <p className="text-black/60 dark:text-white/60 mb-8 max-w-md">
                        Select a published form from the sidebar to see its analytics and submissions.
                    </p>
                    <Link to="/create" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
                        Create New Form
                    </Link>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;
