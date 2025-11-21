
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateFormSchema, generateOptionsForField, optimizeFieldLabel } from '../services/geminiService';
import { FormField, GeneratedForm, GenerationStatus, FormTheme } from '../types';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: 'short_text' },
  { type: 'textarea', label: 'Long Text', icon: 'notes' },
  { type: 'email', label: 'Email', icon: 'mail' },
  { type: 'url', label: 'Website / URL', icon: 'link' },
  { type: 'phone', label: 'Phone', icon: 'call' },
  { type: 'number', label: 'Number', icon: '123' },
  { type: 'date', label: 'Date', icon: 'calendar_today' },
  { type: 'time', label: 'Time', icon: 'schedule' },
  { type: 'select', label: 'Dropdown', icon: 'arrow_drop_down_circle' },
  { type: 'radio', label: 'Single Choice', icon: 'radio_button_checked' },
  { type: 'checkbox', label: 'Checkboxes', icon: 'check_box' },
  { type: 'file', label: 'File Upload', icon: 'upload_file' },
  { type: 'image', label: 'Image Upload', icon: 'image' },
  { type: 'rating', label: 'Star Rating', icon: 'star' },
  { type: 'slider', label: 'Range Slider', icon: 'linear_scale' },
  { type: 'signature', label: 'Signature', icon: 'ink_pen' },
  { type: 'product', label: 'Product', icon: 'shopping_bag' },
  { type: 'stripe', label: 'Stripe Pay', icon: 'credit_card' },
  { type: 'paypal', label: 'PayPal', icon: 'account_balance_wallet' },
  { type: 'youtube', label: 'YouTube', icon: 'play_circle' },
  { type: 'quote', label: 'Quote', icon: 'format_quote' },
  { type: 'html', label: 'HTML / Text', icon: 'code' },
  { type: 'countdown', label: 'Countdown', icon: 'timer' },
];

const THEME_PRESETS: { name: string; theme: FormTheme }[] = [
    { 
        name: "Dark Night", 
        theme: { primaryColor: '#8b5cf6', backgroundColor: '#18181b', textColor: '#ffffff', fontFamily: 'sans', borderRadius: 'lg' } 
    },
    { 
        name: "Regal Default", 
        theme: { primaryColor: '#f27f0d', backgroundColor: '#ffffff', textColor: '#18181b', fontFamily: 'sans', borderRadius: 'lg' } 
    },
    { 
        name: "Ocean Blue", 
        theme: { primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'md' } 
    },
    { 
        name: "Elegant Serif", 
        theme: { primaryColor: '#be185d', backgroundColor: '#fff1f2', textColor: '#4c0519', fontFamily: 'serif', borderRadius: 'sm' } 
    },
    { 
        name: "Forest Green", 
        theme: { primaryColor: '#15803d', backgroundColor: '#f0fdf4', textColor: '#14532d', fontFamily: 'mono', borderRadius: 'none' } 
    },
    {
        name: "Cyberpunk",
        theme: { primaryColor: '#00ff9d', backgroundColor: '#0a0a0a', textColor: '#e0e0e0', fontFamily: 'mono', borderRadius: 'none' }
    },
    {
        name: "Sunset Vibes",
        theme: { primaryColor: '#f43f5e', backgroundColor: '#fff7ed', textColor: '#431407', fontFamily: 'sans', borderRadius: 'xl' }
    },
    {
        name: "Lavender Dream",
        theme: { primaryColor: '#a855f7', backgroundColor: '#faf5ff', textColor: '#3b0764', fontFamily: 'sans', borderRadius: 'full' }
    },
    {
        name: "Slate Corporate",
        theme: { primaryColor: '#334155', backgroundColor: '#f8fafc', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'sm' }
    },
    {
        name: "Midnight Ruby",
        theme: { primaryColor: '#ef4444', backgroundColor: '#280505', textColor: '#fee2e2', fontFamily: 'serif', borderRadius: 'md' }
    },
    {
        name: "Mint Fresh",
        theme: { primaryColor: '#059669', backgroundColor: '#ecfdf5', textColor: '#064e3b', fontFamily: 'sans', borderRadius: 'lg' }
    },
    {
        name: "Golden Hour",
        theme: { primaryColor: '#d97706', backgroundColor: '#fffbeb', textColor: '#451a03', fontFamily: 'serif', borderRadius: 'md' }
    },
    {
        name: "Retro Pop",
        theme: { primaryColor: '#db2777', backgroundColor: '#fffde7', textColor: '#000000', fontFamily: 'mono', borderRadius: 'none' }
    },
    {
        name: "Deep Space",
        theme: { primaryColor: '#38bdf8', backgroundColor: '#020617', textColor: '#f8fafc', fontFamily: 'sans', borderRadius: 'xl' }
    },
    {
        name: "Coffee House",
        theme: { primaryColor: '#78350f', backgroundColor: '#fff8f0', textColor: '#451a03', fontFamily: 'serif', borderRadius: 'sm' }
    },
    {
        name: "Neon Nights",
        theme: { primaryColor: '#f472b6', backgroundColor: '#1a1a2e', textColor: '#e94560', fontFamily: 'sans', borderRadius: 'xl' }
    },
    {
        name: "Arctic Frost",
        theme: { primaryColor: '#00b4d8', backgroundColor: '#caf0f8', textColor: '#03045e', fontFamily: 'sans', borderRadius: 'lg' }
    },
    {
        name: "Volcanic Ash",
        theme: { primaryColor: '#ef233c', backgroundColor: '#2b2d42', textColor: '#edf2f4', fontFamily: 'sans', borderRadius: 'none' }
    },
    {
        name: "Pastel Party",
        theme: { primaryColor: '#845ec2', backgroundColor: '#fbeaff', textColor: '#4b4453', fontFamily: 'sans', borderRadius: 'full' }
    },
    {
        name: "Monochrome",
        theme: { primaryColor: '#000000', backgroundColor: '#ffffff', textColor: '#000000', fontFamily: 'mono', borderRadius: 'none' }
    },
    {
        name: "Nature Walk",
        theme: { primaryColor: '#606c38', backgroundColor: '#fefae0', textColor: '#283618', fontFamily: 'serif', borderRadius: 'md' }
    },
    {
        name: "Royal Gold",
        theme: { primaryColor: '#ffd700', backgroundColor: '#240046', textColor: '#e0aaff', fontFamily: 'serif', borderRadius: 'xl' }
    },
    {
        name: "Vintage Paper",
        theme: { primaryColor: '#8d6e63', backgroundColor: '#f5f5dc', textColor: '#3e2723', fontFamily: 'serif', borderRadius: 'sm' }
    },
    {
        name: "Tech Terminal",
        theme: { primaryColor: '#00ff00', backgroundColor: '#000000', textColor: '#00ff00', fontFamily: 'mono', borderRadius: 'none' }
    },
    {
        name: "Cherry Blossom",
        theme: { primaryColor: '#ff69b4', backgroundColor: '#fff0f5', textColor: '#8b008b', fontFamily: 'sans', borderRadius: 'full' }
    }
];

const BuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'ai' | 'tools' | 'design'>('ai');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  
  const [form, setForm] = useState<GeneratedForm | null>(null);
  const [formId, setFormId] = useState<string | null>(null); 
  
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | 'form-settings' | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  
  const [customSlug, setCustomSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [aiToolLoading, setAiToolLoading] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<'logo' | 'cover' | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Derived URL for sharing with the live domain
  const shareUrl = `https://www.regalforms.xyz/#/form/${customSlug || formId}`;

  // Init from location state or localStorage
  useEffect(() => {
      if (location.state) {
          if (location.state.formData) {
              setForm(location.state.formData);
              if (location.state.formId) {
                setFormId(location.state.formId);
                setCustomSlug(location.state.formData.slug || location.state.formId);
              }
              if(location.state.formData.fields.length > 0) {
                  setActiveTab('tools');
              }
          } else if (location.state.template) {
              const template = location.state.template as GeneratedForm;
              const freshFields = template.fields.map(f => ({
                  ...f,
                  id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              }));
              setForm({ 
                ...template,
                fields: freshFields,
                theme: template.theme || THEME_PRESETS[0].theme,
                collectEmails: template.collectEmails || false,
                limitOneResponse: template.limitOneResponse || false,
                restrictToOrg: template.restrictToOrg || false,
                allowResponseEditing: template.allowResponseEditing || false,
                showProgressBar: template.showProgressBar || false,
                shuffleQuestions: template.shuffleQuestions || false,
                collaborators: template.collaborators || [],
                slug: '' 
              });
              setActiveTab('tools');
          } else if (location.state.title) { 
               setForm(location.state as GeneratedForm);
               setActiveTab('tools');
          }
      } else {
          // Fallback: Check localStorage for draft
          const savedDraft = localStorage.getItem('builder_draft');
          if (savedDraft) {
              try {
                  const { form: savedForm, formId: savedId } = JSON.parse(savedDraft);
                  if (savedForm) {
                      setForm(savedForm);
                      setFormId(savedId);
                      if (savedForm.fields.length > 0) setActiveTab('tools');
                  }
              } catch (e) {
                  console.error("Failed to load draft", e);
              }
          }
          
          if (!form && !savedDraft) {
             // If no draft and no state, create blank
             // This might happen on direct refresh of /create
             // We wait for user to click something or init via useEffect dependency
          }
      }
  }, [location.state]);

  // Auto-save draft to localStorage
  useEffect(() => {
      if (form) {
          localStorage.setItem('builder_draft', JSON.stringify({ form, formId }));
      }
  }, [form, formId]);

  const selectedField = form?.fields.find(f => f.id === selectedId) || null;
  const isFormSettingsSelected = selectedId === 'form-settings';
  const currentTheme = form?.theme || THEME_PRESETS[0].theme;

  const updateTheme = (updates: Partial<FormTheme>) => {
      if (!form) return;
      setForm({
          ...form,
          theme: { ...currentTheme, ...updates }
      });
  };

  const applyPreset = (presetTheme: FormTheme) => {
      if (!form) return;
      // Preserve user uploaded assets when switching presets
      setForm({ 
          ...form, 
          theme: { 
              ...presetTheme, 
              logo: form.theme?.logo, 
              coverImage: form.theme?.coverImage 
          } 
      });
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
      if (!e.target.files || !e.target.files[0] || !currentUser || !form) return;
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { alert("File size must be less than 2MB"); return; }
      
      setUploadingAsset(type);
      try {
          const storageRef = ref(storage, `form_assets/${currentUser.uid}/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytesResumable(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          
          if (type === 'logo') updateTheme({ logo: url });
          else updateTheme({ coverImage: url });
      } catch (error) {
          console.error(error);
          alert("Upload failed");
      } finally {
          setUploadingAsset(null);
      }
  };

  const getBorderRadiusPx = (size: string) => {
      const map: any = { 'none': '0px', 'sm': '4px', 'md': '8px', 'lg': '12px', 'xl': '16px', 'full': '24px' };
      return map[size] || '8px';
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus(GenerationStatus.LOADING);
    setForm(null);
    setFormId(null); 
    setTitleError(false);
    setSelectedId(null);
    try {
      const generatedForm = await generateFormSchema(topic);
      setForm({
        ...generatedForm,
        theme: THEME_PRESETS[0].theme,
        collectEmails: generatedForm.collectEmails || false,
        limitOneResponse: generatedForm.limitOneResponse || false,
        restrictToOrg: generatedForm.restrictToOrg || false,
        allowResponseEditing: generatedForm.allowResponseEditing || false,
        showProgressBar: generatedForm.showProgressBar || false,
        shuffleQuestions: generatedForm.shuffleQuestions || false,
        collaborators: generatedForm.collaborators || [],
        slug: ''
      });
      setStatus(GenerationStatus.SUCCESS);
      setActiveTab('tools');
    } catch (error) {
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleAiGenerateOptions = async (fieldId: string, label: string) => {
      setAiToolLoading(true);
      try {
          const newOptions = await generateOptionsForField(label);
          updateField(fieldId, { options: newOptions });
      } catch (e) { console.error(e); } finally { setAiToolLoading(false); }
  };

  const handleAiOptimizeLabel = async (fieldId: string, label: string) => {
      setAiToolLoading(true);
      try {
          const optimized = await optimizeFieldLabel(label);
          updateField(fieldId, { label: optimized });
      } catch (e) { console.error(e); } finally { setAiToolLoading(false); }
  };

  const initFormIfNeeded = () => {
    if (!form) {
      const newForm: GeneratedForm = {
        title: "Untitled Form",
        description: "Add a description to your form.",
        fields: [],
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
        theme: THEME_PRESETS[0].theme, // Use Dark Night by default
        collectEmails: false,
        limitOneResponse: false,
        restrictToOrg: false,
        allowResponseEditing: false,
        showProgressBar: false,
        shuffleQuestions: false,
        collaborators: [],
        slug: ''
      };
      setForm(newForm);
      return newForm;
    }
    return form;
  };

  const addField = (type: string) => {
    const currentForm = initFormIfNeeded();
    const newId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let newField: FormField = { id: newId, label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`, type: type as any, required: false };

    if (['select', 'radio', 'checkbox'].includes(type)) newField.options = ['Option 1', 'Option 2', 'Option 3'];
    if (type === 'product') { newField.price = 10; newField.currency = 'USD'; newField.productDescription='Sample product description'; }
    if (type === 'rating') newField.max = 5;
    if (type === 'slider') { newField.min = 0; newField.max = 100; newField.step = 1; }
    if (type === 'html') newField.content = '<p>Enter your text here...</p>';
    if (type === 'quote') { newField.content = 'Enter quote text'; newField.author = 'Author Name'; }

    setForm({ ...currentForm, fields: [...currentForm.fields, newField] });
    setSelectedId(newId);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    if (!form) return;
    setForm({ ...form, fields: form.fields.map(f => f.id === id ? { ...f, ...updates } : f) });
  };

  const removeField = (id: string) => {
    if (!form) return;
    setForm({ ...form, fields: form.fields.filter(f => f.id !== id) });
    if (selectedId === id) setSelectedId(null);
  };

  const clearAllFields = () => {
      if (!form) return;
      if (window.confirm("Are you sure you want to clear all fields? This cannot be undone.")) {
          setForm({ ...form, fields: [] });
          setSelectedId('form-settings');
      }
  };

  const duplicateField = (id: string) => {
      if (!form) return;
      const field = form.fields.find(f => f.id === id);
      if (!field) return;
      const newId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newField = { ...field, id: newId, label: field.label + ' (Copy)' };
      const idx = form.fields.findIndex(f => f.id === id);
      const newFields = [...form.fields];
      newFields.splice(idx + 1, 0, newField);
      setForm({ ...form, fields: newFields });
      setSelectedId(newId);
  };

  const updateFormMeta = (key: string, value: any) => {
      if (!form) return;
      if (key === 'title') setTitleError(false);
      setForm({ ...form, [key]: value });
  };

  const handleDragStart = (e: any, type: string) => e.dataTransfer.setData('type', type);
  const handleDrop = (e: any) => {
      e.preventDefault(); setIsDraggingOver(false);
      const type = e.dataTransfer.getData('type');
      if (type) addField(type);
  };

  const saveToFirestore = async (targetStatus: 'draft' | 'published') => {
      if (!form) return;
      if (!form.title.trim()) { setTitleError(true); return; }
      if (!currentUser) { alert("Login required"); return; }
      
      setIsSaving(true);
      try {
          const timestamp = serverTimestamp();
          let targetId = formId || doc(collection(db, "forms")).id;
          const docRef = doc(db, "forms", targetId);
          let finalSlug = customSlug || (targetStatus === 'published' && slugStatus === 'taken' ? targetId : customSlug);
          // If slug is empty, default to ID
          if (!finalSlug) finalSlug = targetId;

          const payload: any = {
              ...form,
              slug: finalSlug,
              status: targetStatus,
              updatedAt: timestamp,
              userId: currentUser.uid
          };
          
          if (!formId) {
              payload['createdAt'] = timestamp;
              setFormId(targetId);
              setCustomSlug(finalSlug);
          }
          
          await setDoc(docRef, payload, { merge: true });
          
          if (targetStatus === 'draft') {
              setDraftSaved(true);
              setTimeout(() => setDraftSaved(false), 2000);
          } else {
              setShowShareModal(true);
              localStorage.removeItem('builder_draft'); // Clear draft on publish
          }
      } catch (e: any) {
          console.error(e);
          alert("Save failed: " + e.message);
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark text-black dark:text-white overflow-hidden font-display">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-black/40 border-b border-black/10 dark:border-white/10 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm font-bold hover:opacity-70">
               <span className="material-symbols-outlined">arrow_back</span> Back
            </button>
            <div className="h-6 w-px bg-black/10 dark:bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
                {form?.title && <span className="font-bold text-sm truncate max-w-[200px]">{form.title}</span>}
                {draftSaved && <span className="text-xs text-green-500 animate-fade-in">Saved</span>}
            </div>
        </div>
        <div className="flex items-center gap-3">
             <div className="hidden sm:flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                 <button 
                    onClick={() => setActiveTab('ai')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${activeTab === 'ai' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}
                 >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span> AI
                 </button>
                 <button 
                    onClick={() => setActiveTab('tools')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${activeTab === 'tools' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}
                 >
                    <span className="material-symbols-outlined text-sm">build</span> Fields
                 </button>
                 <button 
                    onClick={() => setActiveTab('design')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${activeTab === 'design' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}
                 >
                    <span className="material-symbols-outlined text-sm">palette</span> Design
                 </button>
             </div>
             
             {form?.status === 'published' && (
                 <button onClick={() => setShowShareModal(true)} className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors">
                     <span className="material-symbols-outlined text-base">share</span>
                     Share
                 </button>
             )}

             <button onClick={() => navigate('/preview', { state: { formData: form, formId } })} className="px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" title="Preview Form">
                 <span className="material-symbols-outlined">visibility</span>
             </button>
             <button onClick={() => saveToFirestore('draft')} className="px-4 py-2 text-sm font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors">
                 Save Draft
             </button>
             <button onClick={() => saveToFirestore('published')} className="px-4 py-2 text-sm font-bold bg-primary text-white hover:bg-orange-600 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                 {isSaving ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : (form?.status === 'published' ? 'Update' : 'Publish')}
             </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          <aside className="w-[320px] bg-white dark:bg-[#1e1e1e] border-r border-black/10 dark:border-white/10 flex flex-col overflow-hidden shrink-0 z-10">
              {/* AI Tab */}
              {activeTab === 'ai' && (
                  <div className="flex flex-col h-full p-4 animate-fade-in">
                      <div className="flex items-center gap-2 mb-4 text-secondary">
                          <span className="material-symbols-outlined">auto_awesome</span>
                          <h3 className="font-bold">Regal AI Engine</h3>
                      </div>
                      <div className="bg-secondary/10 p-4 rounded-xl mb-6 border border-secondary/20">
                          <p className="text-sm mb-3 opacity-80">Describe your form (e.g., "Event Registration for a Music Festival") and let AI build it.</p>
                          <textarea 
                             className="w-full p-3 rounded-lg bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
                             rows={4}
                             placeholder="Enter a topic..."
                             value={topic}
                             onChange={(e) => setTopic(e.target.value)}
                          />
                          <button 
                            onClick={handleGenerate}
                            disabled={status === GenerationStatus.LOADING || !topic.trim()}
                            className="w-full mt-3 py-2 bg-secondary text-white rounded-lg font-bold text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                             {status === GenerationStatus.LOADING ? 'Generating...' : 'Generate Form'}
                          </button>
                      </div>
                  </div>
              )}

              {/* Tools Tab */}
              {activeTab === 'tools' && (
                  <div className="flex flex-col h-full p-4 animate-fade-in overflow-y-auto">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">drag_indicator</span>
                          Form Fields
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                          {FIELD_TYPES.map((field) => (
                              <div 
                                  key={field.type}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, field.type)}
                                  onClick={() => addField(field.type)}
                                  className="p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-primary hover:bg-primary/5 cursor-move flex flex-col items-center gap-2 text-center transition-all group"
                              >
                                  <span className="material-symbols-outlined text-2xl opacity-50 group-hover:text-primary group-hover:opacity-100 transition-all">{field.icon}</span>
                                  <span className="text-xs font-bold">{field.label}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Design Tab */}
              {activeTab === 'design' && (
                  <div className="flex flex-col h-full p-4 animate-fade-in overflow-y-auto gap-6">
                      <div>
                          <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-black/50 dark:text-white/50">Presets</h3>
                          <div className="grid grid-cols-2 gap-2">
                              {THEME_PRESETS.map((preset) => (
                                  <button
                                      key={preset.name}
                                      onClick={() => applyPreset(preset.theme)}
                                      className="p-2 rounded-lg border border-black/10 dark:border-white/10 text-xs font-bold hover:border-primary transition-colors flex items-center gap-2 overflow-hidden"
                                      style={{ background: preset.theme.backgroundColor, color: preset.theme.textColor }}
                                  >
                                      <div className="size-4 rounded-full shrink-0" style={{ background: preset.theme.primaryColor }}></div>
                                      <span className="truncate">{preset.name}</span>
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-black/50 dark:text-white/50">Colors</h3>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5">
                              <span className="text-sm font-bold">Primary</span>
                              <input type="color" value={currentTheme.primaryColor} onChange={(e) => updateTheme({ primaryColor: e.target.value })} className="bg-transparent border-none outline-none size-8 cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5">
                              <span className="text-sm font-bold">Background</span>
                              <input type="color" value={currentTheme.backgroundColor} onChange={(e) => updateTheme({ backgroundColor: e.target.value })} className="bg-transparent border-none outline-none size-8 cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5">
                              <span className="text-sm font-bold">Text</span>
                              <input type="color" value={currentTheme.textColor} onChange={(e) => updateTheme({ textColor: e.target.value })} className="bg-transparent border-none outline-none size-8 cursor-pointer" />
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-black/50 dark:text-white/50">Typography</h3>
                          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                              {['sans', 'serif', 'mono'].map((font) => (
                                  <button
                                      key={font}
                                      onClick={() => updateTheme({ fontFamily: font as any })}
                                      className={`flex-1 py-1.5 text-xs font-bold rounded capitalize ${currentTheme.fontFamily === font ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'opacity-60'}`}
                                  >
                                      {font}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-black/50 dark:text-white/50">Radius</h3>
                          <div className="flex flex-wrap gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                              {['none', 'sm', 'md', 'lg', 'xl', 'full'].map((r) => (
                                  <button
                                      key={r}
                                      onClick={() => updateTheme({ borderRadius: r as any })}
                                      className={`flex-1 min-w-[40px] py-1.5 text-xs font-bold rounded capitalize ${currentTheme.borderRadius === r ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'opacity-60'}`}
                                  >
                                      {r}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-black/50 dark:text-white/50">Branding</h3>
                          
                          <div className="p-3 rounded-lg border border-dashed border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center relative group">
                              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleAssetUpload(e, 'logo')} />
                              {currentTheme.logo ? (
                                  <div className="relative">
                                      <img src={currentTheme.logo} alt="Logo" className="h-10 mx-auto object-contain" />
                                      <button onClick={() => updateTheme({ logo: undefined })} className="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:scale-110 transition-transform"><span className="material-symbols-outlined text-xs">close</span></button>
                                  </div>
                              ) : (
                                  <div onClick={() => logoInputRef.current?.click()} className="cursor-pointer flex flex-col items-center gap-1 py-2">
                                      <span className="material-symbols-outlined text-primary">add_photo_alternate</span>
                                      <span className="text-xs font-bold opacity-70">Upload Logo</span>
                                  </div>
                              )}
                              {uploadingAsset === 'logo' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary">refresh</span></div>}
                          </div>

                          <div className="p-3 rounded-lg border border-dashed border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center relative group">
                              <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleAssetUpload(e, 'cover')} />
                              {currentTheme.coverImage ? (
                                  <div className="relative">
                                      <img src={currentTheme.coverImage} alt="Cover" className="h-20 w-full object-cover rounded" />
                                      <button onClick={() => updateTheme({ coverImage: undefined })} className="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:scale-110 transition-transform"><span className="material-symbols-outlined text-xs">close</span></button>
                                  </div>
                              ) : (
                                  <div onClick={() => coverInputRef.current?.click()} className="cursor-pointer flex flex-col items-center gap-1 py-2">
                                      <span className="material-symbols-outlined text-primary">image</span>
                                      <span className="text-xs font-bold opacity-70">Upload Cover Image</span>
                                  </div>
                              )}
                              {uploadingAsset === 'cover' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary">refresh</span></div>}
                          </div>
                      </div>
                  </div>
              )}
          </aside>

          {/* Main Canvas */}
          <main 
            className="flex-1 bg-[#f3f4f6] dark:bg-[#121212] overflow-y-auto p-8 flex justify-center transition-all duration-300"
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
              <div 
                  className={`w-full max-w-2xl transition-all duration-300 ${isDraggingOver ? 'scale-[1.02] ring-4 ring-primary/20' : ''}`}
                  style={{
                      backgroundColor: currentTheme.backgroundColor,
                      color: currentTheme.textColor,
                      borderRadius: getBorderRadiusPx(currentTheme.borderRadius),
                      fontFamily: currentTheme.fontFamily === 'mono' ? '"Fira Code", monospace' : currentTheme.fontFamily === 'serif' ? '"Playfair Display", serif' : '"Manrope", sans-serif'
                  }}
              >
                  {currentTheme.coverImage && (
                      <div className="w-full h-48 bg-cover bg-center rounded-t-[inherit]" style={{ backgroundImage: `url(${currentTheme.coverImage})` }}></div>
                  )}

                  <div className="p-8 md:p-12 min-h-[600px] flex flex-col gap-6 shadow-xl relative">
                      {currentTheme.logo && <img src={currentTheme.logo} alt="Logo" className="h-16 mb-4 object-contain mx-auto" />}

                      {/* Title Block */}
                      <div 
                          className={`border-b pb-6 text-center cursor-pointer transition-colors border-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-4 ${titleError ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}
                          onClick={() => setSelectedId('form-settings')}
                      >
                          {form?.title ? (
                              <h1 className="text-3xl font-black mb-2 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => updateFormMeta('title', e.target.innerText)}>{form.title}</h1>
                          ) : (
                             <h1 className="text-3xl font-black mb-2 text-black/30 dark:text-white/30 italic">Untitled Form</h1>
                          )}
                          <p className="opacity-70 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => updateFormMeta('description', e.target.innerText)}>{form?.description || 'Add description...'}</p>
                      </div>

                      {form?.fields.map((field) => (
                          <div 
                              key={field.id}
                              onClick={() => setSelectedId(field.id)}
                              className={`group relative p-4 rounded-lg transition-all border-2 cursor-pointer ${selectedId === field.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-black/10 dark:hover:border-white/10'}`}
                          >
                              <div className="flex items-center justify-between mb-2">
                                  <label className="font-bold text-sm opacity-90 pointer-events-none">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                                  {selectedId === field.id && (
                                      <div className="flex items-center gap-1 bg-white dark:bg-black shadow-sm rounded-lg p-1">
                                          <button onClick={(e) => {e.stopPropagation(); handleAiOptimizeLabel(field.id, field.label)}} className="p-1 hover:bg-black/5 rounded text-primary" title="AI Optimize Label"><span className="material-symbols-outlined text-sm">auto_awesome</span></button>
                                          <button onClick={(e) => {e.stopPropagation(); duplicateField(field.id)}} className="p-1 hover:bg-black/5 rounded" title="Duplicate"><span className="material-symbols-outlined text-sm">content_copy</span></button>
                                          <button onClick={(e) => {e.stopPropagation(); removeField(field.id)}} className="p-1 hover:bg-red-50 text-red-500 rounded" title="Delete"><span className="material-symbols-outlined text-sm">delete</span></button>
                                      </div>
                                  )}
                              </div>
                              
                              {/* Field Previews */}
                              <div className="pointer-events-none opacity-60">
                                  {['text', 'email', 'number', 'url'].includes(field.type) && <div className="h-10 w-full border border-current rounded opacity-30 bg-black/5"></div>}
                                  {field.type === 'phone' && (
                                      <div className="h-10 w-full border border-current rounded opacity-30 bg-black/5 flex items-center px-3 gap-2">
                                          {field.showCountryCode && <span className="text-xs border-r border-current pr-2 opacity-50">+1</span>}
                                          <span>{field.placeholder || ''}</span>
                                      </div>
                                  )}
                                  {field.type === 'textarea' && <div className="h-24 w-full border border-current rounded opacity-30 bg-black/5"></div>}
                                  {field.type === 'select' && <div className="h-10 w-full border border-current rounded opacity-30 bg-black/5 flex items-center justify-between px-3"><span className="text-xs">Dropdown</span><span className="material-symbols-outlined text-sm">arrow_drop_down</span></div>}
                                  {['radio', 'checkbox'].includes(field.type) && (
                                      <div className="flex flex-col gap-2">
                                          {field.options?.slice(0, 3).map((o, i) => (
                                              <div key={i} className="flex items-center gap-2"><div className={`size-4 border border-current ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`}></div><span className="text-sm">{o}</span></div>
                                          ))}
                                      </div>
                                  )}
                                  {field.helperText && <p className="text-[10px] mt-1 opacity-70">{field.helperText}</p>}
                              </div>
                          </div>
                      ))}

                      {(!form?.fields || form.fields.length === 0) && (
                          <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl p-10 text-center flex flex-col items-center justify-center text-black/40 dark:text-white/40">
                              <span className="material-symbols-outlined text-4xl mb-2">drag_indicator</span>
                              <p className="font-bold">Drag & Drop fields here</p>
                          </div>
                      )}

                      <div className="mt-6 pt-6 border-t" style={{ borderColor: `${currentTheme.textColor}20` }}>
                          <button className="w-full py-4 font-bold text-lg rounded shadow-lg opacity-50 cursor-not-allowed" style={{ backgroundColor: currentTheme.primaryColor, color: '#fff', borderRadius: getBorderRadiusPx(currentTheme.borderRadius) }}>
                              {form?.submitButtonText || 'Submit'}
                          </button>
                      </div>
                  </div>
              </div>
          </main>

          {/* Right Properties Panel */}
          {selectedId && (
              <aside className="w-[300px] bg-white dark:bg-[#1e1e1e] border-l border-black/10 dark:border-white/10 flex flex-col overflow-y-auto shrink-0 z-10 animate-slide-in">
                  <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                      <h3 className="font-bold text-sm uppercase tracking-wider">Properties</h3>
                      <button onClick={() => setSelectedId(null)}><span className="material-symbols-outlined text-lg">close</span></button>
                  </div>
                  
                  {isFormSettingsSelected ? (
                      <div className="p-4 flex flex-col gap-6">
                           <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold uppercase opacity-50">Form Title</label>
                               <input className="p-2 border border-black/10 dark:border-white/10 rounded bg-transparent" value={form?.title || ''} onChange={(e) => updateFormMeta('title', e.target.value)} />
                           </div>
                           <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold uppercase opacity-50">Description</label>
                               <textarea rows={3} className="p-2 border border-black/10 dark:border-white/10 rounded bg-transparent" value={form?.description || ''} onChange={(e) => updateFormMeta('description', e.target.value)} />
                           </div>
                           <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold uppercase opacity-50">Submit Button Text</label>
                               <input className="p-2 border border-black/10 dark:border-white/10 rounded bg-transparent" value={form?.submitButtonText || ''} onChange={(e) => updateFormMeta('submitButtonText', e.target.value)} />
                           </div>
                           <div className="pt-4 border-t border-black/10 dark:border-white/10">
                               <button onClick={clearAllFields} className="w-full py-2 text-red-500 border border-red-500 rounded hover:bg-red-50 font-bold text-xs">Clear All Fields</button>
                           </div>
                      </div>
                  ) : selectedField ? (
                      <div className="p-4 flex flex-col gap-6">
                           <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold uppercase opacity-50">Label</label>
                               <div className="flex gap-2">
                                   <input className="p-2 border border-black/10 dark:border-white/10 rounded bg-transparent flex-1" value={selectedField.label} onChange={(e) => updateField(selectedField.id, { label: e.target.value })} />
                                   <button onClick={() => handleAiOptimizeLabel(selectedField.id, selectedField.label)} disabled={aiToolLoading} className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20" title="Optimize with AI"><span className="material-symbols-outlined text-sm">auto_awesome</span></button>
                               </div>
                           </div>
                           
                           <div className="flex items-center justify-between">
                               <label className="text-xs font-bold uppercase opacity-50">Required</label>
                               <input type="checkbox" checked={selectedField.required} onChange={(e) => updateField(selectedField.id, { required: e.target.checked })} className="accent-primary size-4" />
                           </div>

                           {['text', 'textarea', 'email', 'number', 'phone', 'url'].includes(selectedField.type) && (
                               <div className="flex flex-col gap-4">
                                   <div className="flex flex-col gap-2">
                                       <label className="text-xs font-bold uppercase opacity-50">Placeholder</label>
                                       <input className="p-2 border border-black/10 dark:border-white/10 rounded bg-transparent" value={selectedField.placeholder || ''} onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })} />
                                   </div>
                                   <div className="flex flex-col gap-2">
                                       <label className="text-xs font-bold uppercase opacity-50">Helper Text</label>
                                       <input className="p-2 border border-black/10 dark:border-white/10 rounded bg-transparent" value={selectedField.helperText || ''} onChange={(e) => updateField(selectedField.id, { helperText: e.target.value })} placeholder="Instructional text below input" />
                                   </div>
                               </div>
                           )}
                           
                           {selectedField.type === 'phone' && (
                               <div className="flex items-center justify-between">
                                   <label className="text-xs font-bold uppercase opacity-50">Show Country Code</label>
                                   <input type="checkbox" checked={selectedField.showCountryCode || false} onChange={(e) => updateField(selectedField.id, { showCountryCode: e.target.checked })} className="accent-primary size-4" />
                               </div>
                           )}

                           {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                               <div className="flex flex-col gap-3">
                                   <div className="flex justify-between items-center">
                                       <label className="text-xs font-bold uppercase opacity-50">Options</label>
                                       <button onClick={() => handleAiGenerateOptions(selectedField.id, selectedField.label)} disabled={aiToolLoading} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">auto_awesome</span> Generate</button>
                                   </div>
                                   <div className="flex flex-col gap-2">
                                       {selectedField.options?.map((opt, idx) => (
                                           <div key={idx} className="flex gap-2">
                                               <input className="p-1.5 text-sm border border-black/10 dark:border-white/10 rounded bg-transparent flex-1" value={opt} onChange={(e) => {
                                                   const newOpts = [...(selectedField.options || [])];
                                                   newOpts[idx] = e.target.value;
                                                   updateField(selectedField.id, { options: newOpts });
                                               }} />
                                               <button onClick={() => {
                                                   const newOpts = selectedField.options?.filter((_, i) => i !== idx);
                                                   updateField(selectedField.id, { options: newOpts });
                                               }} className="text-red-500 hover:bg-red-50 p-1 rounded"><span className="material-symbols-outlined text-sm">close</span></button>
                                           </div>
                                       ))}
                                       <button onClick={() => updateField(selectedField.id, { options: [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`] })} className="text-xs font-bold text-primary flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-sm">add</span> Add Option</button>
                                   </div>
                               </div>
                           )}
                      </div>
                  ) : null}
              </aside>
          )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-md border border-black/10 dark:border-white/10 overflow-hidden">
                  <div className="p-6 text-center">
                      <div className="size-16 bg-green-100 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                          <span className="material-symbols-outlined text-3xl">check</span>
                      </div>
                      <h2 className="text-2xl font-black mb-2">Form Published!</h2>
                      <p className="text-black/60 dark:text-white/60 text-sm mb-6">Your form is live and ready to collect responses.</p>
                      
                      <div className="bg-black/5 dark:bg-black/30 p-3 rounded-lg flex items-center gap-2 mb-4 border border-black/5 dark:border-white/5">
                          <span className="material-symbols-outlined text-black/40 dark:text-white/40">link</span>
                          <input readOnly value={shareUrl} className="bg-transparent border-none outline-none text-sm font-mono text-black/80 dark:text-white/80 flex-1 truncate" />
                          <button 
                              onClick={() => {
                                  navigator.clipboard.writeText(shareUrl);
                                  setCopySuccess(true);
                                  setTimeout(() => setCopySuccess(false), 2000);
                              }}
                              className="text-primary hover:bg-white dark:hover:bg-white/10 p-1.5 rounded transition-colors font-bold text-xs"
                          >
                              {copySuccess ? 'Copied!' : 'Copy'}
                          </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => {
                              window.open(`https://twitter.com/intent/tweet?text=Check out my form!&url=${encodeURIComponent(shareUrl)}`, '_blank');
                          }} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] font-bold text-sm hover:bg-[#1DA1F2]/20 transition-colors">
                              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                              Twitter
                          </button>
                          <button onClick={() => {
                               window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                          }} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] font-bold text-sm hover:bg-[#0A66C2]/20 transition-colors">
                              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                              LinkedIn
                          </button>
                      </div>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-4 border-t border-black/10 dark:border-white/10 flex justify-between gap-3">
                      <button onClick={() => setShowShareModal(false)} className="flex-1 py-3 text-sm font-bold rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Close</button>
                      <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 text-sm font-bold rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity">Go to Dashboard</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BuilderPage;
