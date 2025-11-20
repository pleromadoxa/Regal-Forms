
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  status?: 'published' | 'draft' | 'completed';
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
  const [viewMode, setViewMode] = useState<'published' | 'drafts' | 'completed'>('published');

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch User Forms
  const fetchForms = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
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

  useEffect(() => {
    fetchForms();
  }, [currentUser]);

  // Filter logic needs to handle the 'completed' status explicitly
  const filteredForms = forms.filter(f => {
      if (viewMode === 'drafts') return f.status === 'draft';
      if (viewMode === 'completed') return f.status === 'completed';
      // Published view shows published forms
      return f.status === 'published';
  });

  // Auto-select first form when switching views
  useEffect(() => {
      if (filteredForms.length > 0 && (viewMode === 'published' || viewMode === 'completed')) {
          if (!selectedFormId || !filteredForms.find(f => f.id === selectedFormId)) {
              setSelectedFormId(filteredForms[0].id);
          }
      } else {
          setSelectedFormId(null);
      }
  }, [viewMode, forms]);

  // Fetch Submissions for Selected Form
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedFormId || viewMode === 'drafts') {
          setSubmissions([]);
          return;
      }
      setIsLoadingSubs(true);
      try {
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
      navigate('/create', { 
          state: { 
              formId: form.id,
              formData: {
                  title: form.title,
                  description: form.description,
                  fields: form.fields || [],
                  collectEmails: form.collectEmails,
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

  const handleShare = () => {
      if (!selectedForm) return;
      const url = `${window.location.origin}/#/form/${selectedForm.slug || selectedForm.id}`;
      navigator.clipboard.writeText(url).then(() => {
          alert("Link copied to clipboard!");
      }).catch(err => {
          console.error("Failed to copy:", err);
          alert("Failed to copy link. Please manually copy: " + url);
      });
  };

  const handleDeleteForm = async () => {
      if (!selectedFormId) return;
      setActionLoading(true);
      try {
          await deleteDoc(doc(db, 'forms', selectedFormId));
          await fetchForms(); // Refresh list
          setShowDeleteModal(false);
          setSelectedFormId(null);
      } catch (error) {
          console.error("Error deleting form:", error);
          alert("Failed to delete form.");
      } finally {
          setActionLoading(false);
      }
  };

  const handleMarkCompleted = async () => {
      if (!selectedFormId) return;
      setActionLoading(true);
      try {
          await updateDoc(doc(db, 'forms', selectedFormId), {
              status: 'completed',
              updatedAt: new Date()
          });
          await fetchForms();
          setShowCompleteModal(false);
          // Optionally switch to completed view or just let it disappear from Published
      } catch (error) {
          console.error("Error updating form:", error);
          alert("Failed to mark as completed.");
      } finally {
          setActionLoading(false);
      }
  };

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-screen w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="flex w-full max-w-[1600px] mx-auto h-[calc(100vh-65px)] overflow-hidden">
      
      {/* Sidebar Form List */}
      <div className="w-80 shrink-0 border-r border-black/10 dark:border-white/10 bg-background-light dark:bg-background-dark flex flex-col">
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex flex-col gap-3">
          <h2 className="text-lg font-bold">My Forms</h2>
          {/* Tabs */}
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg">
             <button 
                onClick={() => setViewMode('published')}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${viewMode === 'published' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
             >
                Published
             </button>
             <button 
                onClick={() => setViewMode('drafts')}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${viewMode === 'drafts' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
             >
                Drafts
             </button>
             <button 
                onClick={() => setViewMode('completed')}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${viewMode === 'completed' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
             >
                Completed
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
                  onClick={() => viewMode === 'drafts' ? handleDraftClick(form) : setSelectedFormId(form.id)}
                  className={`text-left p-3 rounded-lg transition-colors flex flex-col gap-1 group ${selectedFormId === form.id && viewMode !== 'drafts' ? 'bg-primary text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white'}`}
                >
                  <div className="flex justify-between items-start">
                      <span className="font-bold text-sm truncate flex-1">{form.title}</span>
                      {viewMode === 'drafts' && (
                          <span className="material-symbols-outlined text-sm opacity-50 group-hover:text-primary">edit</span>
                      )}
                  </div>
                  <div className={`flex justify-between text-xs ${selectedFormId === form.id && viewMode !== 'drafts' ? 'text-white/80' : 'text-black/50 dark:text-white/50'}`}>
                    <span>{form.updatedAt ? new Date(form.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                    {viewMode !== 'drafts' && <span>{form.stats?.responses || 0} responses</span>}
                  </div>
                </button>
              ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1a2f4a]/50 relative">
        
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
                            <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                                {selectedForm.status === 'completed' && (
                                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold uppercase">Closed</span>
                                )}
                                <span>{selectedForm.status === 'published' ? 'Overview and Submissions' : 'Archived Data'}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {selectedForm.status === 'published' && (
                                <>
                                    <button 
                                        onClick={() => setShowDeleteModal(true)}
                                        className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 text-sm font-bold transition-colors flex items-center gap-2"
                                        title="Delete Form"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowCompleteModal(true)}
                                        className="px-3 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:hover:bg-green-900/20 dark:text-green-400 text-sm font-bold transition-colors flex items-center gap-2"
                                        title="Mark as Completed"
                                    >
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                    </button>
                                    <button 
                                        onClick={handleShare}
                                        className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-bold transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-base">share</span>
                                        Share
                                    </button>
                                </>
                            )}
                            
                            {/* For completed forms, also allow deletion */}
                            {selectedForm.status === 'completed' && (
                                <button 
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    Delete Forever
                                </button>
                            )}

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
                                                <th key={key} className="p-4 font-semibold border-b border-black/5 dark:border-white/5 capitalize">{key}</th>
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
                                                        <button 
                                                            onClick={() => setSelectedSubmission(sub)}
                                                            className="text-primary hover:underline font-bold text-xs flex items-center gap-1"
                                                        >
                                                            View
                                                        </button>
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
                        Select a form from the sidebar to see its analytics and submissions.
                    </p>
                    <Link to="/create" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
                        Create New Form
                    </Link>
                </div>
            )
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-sm w-full p-6 border border-black/10 dark:border-white/10">
                  <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-2xl">warning</span>
                  </div>
                  <h3 className="text-xl font-black mb-2">Delete Form?</h3>
                  <p className="text-black/60 dark:text-white/60 mb-6">
                      Are you sure you want to delete "{selectedForm?.title}"? This action cannot be undone and all submissions will be lost.
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteModal(false)} 
                        className="flex-1 py-3 rounded-lg font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleDeleteForm}
                        disabled={actionLoading}
                        className="flex-1 py-3 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                          {actionLoading && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-sm w-full p-6 border border-black/10 dark:border-white/10">
                  <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-2xl">check</span>
                  </div>
                  <h3 className="text-xl font-black mb-2">Mark as Completed?</h3>
                  <p className="text-black/60 dark:text-white/60 mb-6">
                      This will close the form. The public link will show a "Form Closed" message and no new responses will be accepted. You can still view existing data.
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowCompleteModal(false)} 
                        className="flex-1 py-3 rounded-lg font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleMarkCompleted}
                        disabled={actionLoading}
                        className="flex-1 py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                           {actionLoading && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                          Confirm
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Response Detail Modal */}
      {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] border border-black/10 dark:border-white/10">
                   <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold">Submission Details</h3>
                            <p className="text-xs text-black/50 dark:text-white/50">{selectedSubmission.date}</p>
                        </div>
                        <button onClick={() => setSelectedSubmission(null)} className="hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex flex-col gap-4">
                             {Object.entries(selectedSubmission.data).map(([key, value]) => (
                                 <div key={key} className="flex flex-col gap-1 pb-4 border-b border-black/5 dark:border-white/5 last:border-0">
                                     <span className="text-xs font-bold uppercase text-black/50 dark:text-white/50 tracking-wider">{selectedForm?.fields?.find(f => f.id === key)?.label || key}</span>
                                     <span className="text-base font-medium">
                                         {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                     </span>
                                 </div>
                             ))}
                             {Object.keys(selectedSubmission.data).length === 0 && (
                                 <p className="text-center text-black/50 italic">No data in this response.</p>
                             )}
                        </div>
                   </div>
                   <div className="p-4 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-right">
                        <button onClick={() => setSelectedSubmission(null)} className="px-4 py-2 bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg font-bold text-sm hover:bg-black/5 transition-colors">
                            Close
                        </button>
                   </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default SubmissionsPage;
