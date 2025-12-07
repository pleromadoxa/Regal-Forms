
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { generateFormSchema, generateOptionsForField, optimizeFieldLabel } from '../services/geminiService';
import { FormField, GeneratedForm, GenerationStatus, FormTheme, LogicRule } from '../types';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRIES, PHONE_CODES } from '../data/formResources';
import { sendEmail, generateEmailTemplate } from '../services/emailService';

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: 'short_text' },
  { type: 'textarea', label: 'Long Text', icon: 'notes' },
  { type: 'email', label: 'Email', icon: 'mail' },
  { type: 'url', label: 'Website / URL', icon: 'link' },
  { type: 'phone', label: 'Phone', icon: 'call' },
  { type: 'country', label: 'Country', icon: 'public' },
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
        name: "Solar Flare",
        theme: { primaryColor: '#f59e0b', backgroundColor: '#1c1917', textColor: '#fef3c7', fontFamily: 'sans', borderRadius: 'lg' }
    },
    {
        name: "Minty Fresh",
        theme: { primaryColor: '#10b981', backgroundColor: '#ecfdf5', textColor: '#064e3b', fontFamily: 'sans', borderRadius: 'xl' }
    },
    {
        name: "Royal Velvet",
        theme: { primaryColor: '#fbbf24', backgroundColor: '#4c1d95', textColor: '#fffbeb', fontFamily: 'serif', borderRadius: 'md' }
    },
    {
        name: "Steel Gray",
        theme: { primaryColor: '#475569', backgroundColor: '#e2e8f0', textColor: '#1e293b', fontFamily: 'mono', borderRadius: 'sm' }
    },
    {
        name: "Cherry Blossom",
        theme: { primaryColor: '#ec4899', backgroundColor: '#fdf2f8', textColor: '#831843', fontFamily: 'serif', borderRadius: 'full' }
    },
    {
        name: "Deep Ocean",
        theme: { primaryColor: '#22d3ee', backgroundColor: '#0c4a6e', textColor: '#f0f9ff', fontFamily: 'sans', borderRadius: 'lg' }
    },
    {
        name: "Desert Sand",
        theme: { primaryColor: '#d97706', backgroundColor: '#fffbeb', textColor: '#78350f', fontFamily: 'sans', borderRadius: 'md' }
    },
    {
        name: "Neon Lights",
        theme: { primaryColor: '#d946ef', backgroundColor: '#000000', textColor: '#e879f9', fontFamily: 'mono', borderRadius: 'none' }
    },
    {
        name: "Minimalist White",
        theme: { primaryColor: '#171717', backgroundColor: '#ffffff', textColor: '#171717', fontFamily: 'sans', borderRadius: 'none' }
    },
    {
        name: "Retro Pop",
        theme: { primaryColor: '#3b82f6', backgroundColor: '#fef08a', textColor: '#1e3a8a', fontFamily: 'sans', borderRadius: 'xl' }
    },
    {
        name: "Autumn Leaves",
        theme: { primaryColor: '#ea580c', backgroundColor: '#fff7ed', textColor: '#431407', fontFamily: 'serif', borderRadius: 'lg' }
    },
    {
        name: "Arctic Ice",
        theme: { primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', textColor: '#0c4a6e', fontFamily: 'sans', borderRadius: 'md' }
    },
    {
        name: "Charcoal & Gold",
        theme: { primaryColor: '#eab308', backgroundColor: '#1f2937', textColor: '#f3f4f6', fontFamily: 'serif', borderRadius: 'sm' }
    },
    {
        name: "Berry Blast",
        theme: { primaryColor: '#db2777', backgroundColor: '#fce7f3', textColor: '#831843', fontFamily: 'sans', borderRadius: 'xl' }
    },
    {
        name: "Coffee House",
        theme: { primaryColor: '#78350f', backgroundColor: '#fff8f0', textColor: '#451a03', fontFamily: 'serif', borderRadius: 'md' }
    },
    {
        name: "Vibrant Teal",
        theme: { primaryColor: '#14b8a6', backgroundColor: '#ccfbf1', textColor: '#134e4a', fontFamily: 'sans', borderRadius: 'full' }
    },
    {
        name: "Classic Mono",
        theme: { primaryColor: '#000000', backgroundColor: '#ffffff', textColor: '#000000', fontFamily: 'mono', borderRadius: 'none' }
    },
    {
        name: "Soft Pastel",
        theme: { primaryColor: '#8b5cf6', backgroundColor: '#f5f3ff', textColor: '#4c1d95', fontFamily: 'sans', borderRadius: 'lg' }
    },
    {
        name: "High Contrast",
        theme: { primaryColor: '#facc15', backgroundColor: '#000000', textColor: '#ffffff', fontFamily: 'sans', borderRadius: 'md' }
    },
    {
        name: "Nature Walk",
        theme: { primaryColor: '#65a30d', backgroundColor: '#f7fee7', textColor: '#365314', fontFamily: 'sans', borderRadius: 'xl' }
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
  const [showClearModal, setShowClearModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [aiToolLoading, setAiToolLoading] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<'logo' | 'cover' | null>(null);

  // Initialization ref to prevent overwriting state on re-renders
  const initRef = useRef(false);

  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Derived URL for sharing with the live domain
  const shareUrl = `https://www.regalforms.xyz/#/form/${customSlug || formId}`;

  // Init from location state or localStorage
  useEffect(() => {
      // If already initialized, don't run again to prevent overwriting current changes
      if (initRef.current) return;

      if (location.state?.formData) {
          setForm(location.state.formData);
          if (location.state.formId) {
            setFormId(location.state.formId);
            setCustomSlug(location.state.formData.slug || location.state.formId);
          }
          if(location.state.formData.fields.length > 0) {
              setActiveTab('tools');
          }
          initRef.current = true;
      } else if (location.state?.template) {
          // Init from Template - Deep clone to avoid reference issues
          const templateData = JSON.parse(JSON.stringify(location.state.template));
          setForm(templateData);
          setFormId(null); // Reset ID so it saves as a new form
          if (templateData.fields && templateData.fields.length > 0) {
              setActiveTab('tools');
          }
          initRef.current = true;
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
          } else {
              // Initialize blank form if absolutely no state found
              initFormIfNeeded();
          }
          initRef.current = true;
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
        theme: THEME_PRESETS[0].theme,
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

  const addLogicRule = (fieldId: string) => {
      if (!form) return;
      const field = form.fields.find(f => f.id === fieldId);
      if (!field) return;

      const newRule: LogicRule = {
          fieldId: form.fields.find(f => f.id !== fieldId)?.id || '', // Default to first other field
          condition: 'equals',
          value: '',
          action: 'show'
      };
      
      updateField(fieldId, { logic: [...(field.logic || []), newRule] });
  };

  const updateLogicRule = (fieldId: string, index: number, updates: Partial<LogicRule>) => {
      if (!form) return;
      const field = form.fields.find(f => f.id === fieldId);
      if (!field || !field.logic) return;

      const newLogic = [...field.logic];
      newLogic[index] = { ...newLogic[index], ...updates };
      updateField(fieldId, { logic: newLogic });
  };

  const removeLogicRule = (fieldId: string, index: number) => {
      if (!form) return;
      const field = form.fields.find(f => f.id === fieldId);
      if (!field || !field.logic) return;

      const newLogic = field.logic.filter((_, i) => i !== index);
      updateField(fieldId, { logic: newLogic });
  };

  // Open the confirmation modal instead of immediate clear
  const handleClearRequest = () => {
      setShowClearModal(true);
  };

  const confirmClearFields = () => {
      if (!form) return;
      setForm({ ...form, fields: [] });
      setSelectedId('form-settings');
      setShowClearModal(false);
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
          if (!finalSlug) finalSlug = targetId;

          const payload: any = {
              ...form,
              slug: finalSlug,
              status: targetStatus,
              updatedAt: timestamp,
              userId: currentUser.uid,
              ownerEmail: currentUser.email // IMPORTANT: Save email for notifications
          };
          
          if (!formId) {
              payload['createdAt'] = timestamp;
              setFormId(targetId);
              setCustomSlug(finalSlug);
          }
          
          await setDoc(docRef, payload, { merge: true });
          
          // Update local state to reflect saved status
          setForm(prev => prev ? ({ ...prev, status: targetStatus, slug: finalSlug }) : null);
          
          if (targetStatus === 'draft') {
              setDraftSaved(true);
              setTimeout(() => setDraftSaved(false), 2000);
          } else {
              setShowShareModal(true);
              localStorage.removeItem('builder_draft'); 
              
              // Send Confirmation Email for Published Forms
              if (currentUser.email) {
                  const emailHtml = generateEmailTemplate(
                      "Form Published Successfully! 🎉",
                      `<p>Your form <strong>${form.title}</strong> is live and ready to collect responses.</p>
                       <p>You can share it using the link below:</p>
                       <p><a href="https://www.regalforms.xyz/#/form/${finalSlug}">https://www.regalforms.xyz/#/form/${finalSlug}</a></p>`,
                      `https://www.regalforms.xyz/#/form/${finalSlug}`,
                      "View Form"
                  );
                  await sendEmail(currentUser.email, `Form Published: ${form.title}`, emailHtml);
              }
          }
      } catch (e: any) {
          console.error(e);
          alert("Save failed: " + e.message);
      } finally {
          setIsSaving(false);
      }
  };

  // Define custom styles based on theme to mirror FormPublicPage logic
  const customStyles = {
      '--primary': currentTheme.primaryColor,
      '--bg': currentTheme.backgroundColor,
      '--text': currentTheme.textColor,
      '--radius': getBorderRadiusPx(currentTheme.borderRadius),
  } as React.CSSProperties;

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark text-black dark:text-white overflow-hidden font-display">
      <style>{`
        .custom-focus:focus { ring: 2px solid var(--primary); border-color: var(--primary); outline: none; }
        .custom-btn { background-color: var(--primary); color: white; border-radius: var(--radius); }
        .custom-input { border-radius: var(--radius); border: 1px solid color-mix(in srgb, var(--text), transparent 80%); background-color: color-mix(in srgb, var(--bg), var(--text) 5%); color: var(--text); }
        .custom-card { background-color: color-mix(in srgb, var(--bg), var(--text) 2%); border: 1px solid color-mix(in srgb, var(--text), transparent 90%); border-radius: var(--radius); }
      `}</style>

      {/* Header */}
      <header className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-black/40 border-b border-black/10 dark:border-white/10 shrink-0 z-30">
        {/* Left Side */}
        <div className="flex items-center gap-4 z-10">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm font-bold hover:opacity-70">
               <span className="material-symbols-outlined">arrow_back</span> Back
            </button>
            <div className="h-6 w-px bg-black/10 dark:bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
                {form?.title && <span className="font-bold text-sm truncate max-w-[200px]">{form.title}</span>}
                {draftSaved && <span className="text-xs text-green-500 animate-fade-in">Saved</span>}
            </div>
        </div>

        {/* Center Tabs - Absolute positioning */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
             <div className="hidden sm:flex bg-black/5 dark:bg-white/5 p-1 rounded-lg shadow-sm border border-black/5 dark:border-white/5">
                 <button 
                    onClick={() => setActiveTab('ai')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'ai' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60'}`}
                 >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span> AI
                 </button>
                 <button 
                    onClick={() => setActiveTab('tools')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'tools' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60'}`}
                 >
                    <span className="material-symbols-outlined text-sm">build</span> Fields
                 </button>
                 <button 
                    onClick={() => setActiveTab('design')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'design' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60'}`}
                 >
                    <span className="material-symbols-outlined text-sm">palette</span> Design
                 </button>
             </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 z-10">
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
                      <button onClick={handleClearRequest} className="mt-6 w-full py-2 text-xs font-bold text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
                          Clear All Fields
                      </button>
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
                  className={`w-full max-w-2xl transition-all duration-300 h-fit min-h-[calc(100vh-100px)] custom-card shadow-xl relative ${isDraggingOver ? 'scale-[1.02] ring-4 ring-primary/20' : ''}`}
                  style={{
                      backgroundColor: currentTheme.backgroundColor,
                      color: currentTheme.textColor,
                      borderRadius: getBorderRadiusPx(currentTheme.borderRadius),
                      fontFamily: currentTheme.fontFamily === 'mono' ? '"Fira Code", monospace' : currentTheme.fontFamily === 'serif' ? '"Playfair Display", serif' : '"Manrope", sans-serif',
                      ...customStyles
                  }}
              >
                  {currentTheme.coverImage && (
                      <div className="w-full h-48 bg-cover bg-center rounded-t-[inherit]" style={{ backgroundImage: `url(${currentTheme.coverImage})` }}></div>
                  )}

                  <div className="p-8 md:p-12 flex flex-col gap-6">
                      {currentTheme.logo && <img src={currentTheme.logo} alt="Logo" className="h-16 mb-4 object-contain mx-auto" />}

                      {/* Title Block */}
                      <div 
                          className={`border-b pb-6 text-center cursor-pointer transition-colors border-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-4 ${titleError ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}
                          style={{ borderColor: `${currentTheme.textColor}20` }}
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
                                      <div className="flex items-center gap-1 bg-white dark:bg-black shadow-sm rounded-lg p-1 absolute right-2 top-2 z-10">
                                          <button onClick={(e) => {e.stopPropagation(); handleAiOptimizeLabel(field.id, field.label)}} className="p-1 hover:bg-black/5 rounded text-primary" title="AI Rewrite"><span className="material-symbols-outlined text-sm">auto_awesome</span></button>
                                          <button onClick={(e) => {e.stopPropagation(); duplicateField(field.id)}} className="p-1 hover:bg-black/5 rounded" title="Duplicate"><span className="material-symbols-outlined text-sm">content_copy</span></button>
                                          <button onClick={(e) => {e.stopPropagation(); removeField(field.id)}} className="p-1 hover:bg-red-50 text-red-500 rounded" title="Delete"><span className="material-symbols-outlined text-sm">delete</span></button>
                                      </div>
                                  )}
                              </div>
                              
                              {/* Field Previews using custom-input classes */}
                              <div className="pointer-events-none">
                                  {['text', 'email', 'number', 'url'].includes(field.type) && <div className="custom-input h-12 w-full px-3 flex items-center text-sm">{field.placeholder}</div>}
                                  
                                  {field.type === 'phone' && (
                                      <div className="flex gap-2">
                                          {field.showCountryCode !== false && (
                                              <div className="custom-input h-12 w-28 flex items-center justify-between px-3">
                                                  <span className="text-xs">US +1</span>
                                                  <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                                              </div>
                                          )}
                                          <div className="custom-input h-12 flex-1 flex items-center px-3">
                                              <span>{field.placeholder || '123-456-7890'}</span>
                                          </div>
                                      </div>
                                  )}
                                  
                                  {field.type === 'country' && (
                                      <div className="custom-input h-12 w-full flex items-center justify-between px-3">
                                          <span className="text-sm">Select Country...</span>
                                          <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
                                      </div>
                                  )}

                                  {field.type === 'textarea' && <div className="custom-input h-32 w-full"></div>}
                                  
                                  {field.type === 'select' && <div className="custom-input h-12 w-full flex items-center justify-between px-3"><span className="text-xs">Select...</span><span className="material-symbols-outlined text-sm">arrow_drop_down</span></div>}
                                  
                                  {(field.type === 'radio' || field.type === 'checkbox') && (
                                    <div className="flex flex-col gap-2">
                                        {field.options?.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`size-4 border opacity-50 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`} style={{ borderColor: currentTheme.textColor }}></div>
                                                <span className="text-sm opacity-80">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                  )}

                                  {['date', 'time'].includes(field.type) && (
                                      <div className="custom-input h-12 w-full flex items-center justify-between px-3">
                                          <span className="text-sm">{field.placeholder || (field.type === 'date' ? 'mm/dd/yyyy' : '--:--')}</span>
                                          <span className="material-symbols-outlined text-sm">{field.type === 'date' ? 'calendar_today' : 'schedule'}</span>
                                      </div>
                                  )}
                                  
                                  {['file', 'image'].includes(field.type) && (
                                      <div className="h-24 w-full border-2 border-dashed rounded-lg opacity-50 flex flex-col items-center justify-center" style={{ borderColor: currentTheme.textColor, backgroundColor: 'color-mix(in srgb, var(--bg), var(--text) 5%)' }}>
                                          <span className="material-symbols-outlined">cloud_upload</span>
                                          <span className="text-xs">Upload {field.type === 'image' ? 'Image' : 'File'}</span>
                                      </div>
                                  )}

                                  {field.type === 'rating' && (
                                      <div className="flex gap-1">
                                          {[...Array(5)].map((_, i) => (
                                              <span key={i} className="material-symbols-outlined opacity-30">star</span>
                                          ))}
                                      </div>
                                  )}

                                  {field.type === 'slider' && (
                                      <div className="flex items-center gap-3">
                                          <span className="text-xs opacity-50">{field.min || 0}</span>
                                          <div className="h-1 flex-1 opacity-30 rounded-full relative" style={{ backgroundColor: currentTheme.textColor }}>
                                              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 size-3 rounded-full" style={{ backgroundColor: currentTheme.textColor }}></div>
                                          </div>
                                          <span className="text-xs opacity-50">{field.max || 100}</span>
                                      </div>
                                  )}
                                  
                                  {field.type === 'product' && (
                                      <div className="p-3 border rounded-lg flex items-center gap-4 opacity-60" style={{ borderColor: currentTheme.textColor }}>
                                          <div className="size-12 rounded flex items-center justify-center bg-black/5"><span className="material-symbols-outlined">shopping_bag</span></div>
                                          <div className="flex-1">
                                              <div className="h-3 w-20 bg-black/20 rounded mb-1"></div>
                                              <div className="h-2 w-32 bg-black/10 rounded"></div>
                                          </div>
                                          <div className="font-bold">{field.price} {field.currency}</div>
                                      </div>
                                  )}
                                  
                                  {field.type === 'html' && (
                                    <div className="w-full opacity-80" dangerouslySetInnerHTML={{ __html: field.content || '<p>HTML Content</p>' }} />
                                  )}
                                  
                                  {field.type === 'quote' && (
                                    <div className="border-l-4 pl-4 italic opacity-80" style={{ borderColor: currentTheme.textColor }}>
                                        "{field.content}"
                                        <div className="text-xs font-bold mt-1 opacity-60">- {field.author}</div>
                                    </div>
                                  )}
                                  
                                  {field.type === 'countdown' && (
                                      <div className="flex gap-4 justify-center p-4 rounded-lg opacity-80" style={{ backgroundColor: 'color-mix(in srgb, var(--bg), var(--text) 5%)' }}>
                                          <div className="text-center"><span className="text-xl font-bold">00</span><div className="text-[10px] uppercase">Days</div></div>
                                          <div className="text-center"><span className="text-xl font-bold">00</span><div className="text-[10px] uppercase">Hours</div></div>
                                          <div className="text-center"><span className="text-xl font-bold">00</span><div className="text-[10px] uppercase">Mins</div></div>
                                      </div>
                                  )}

                                  {field.type === 'youtube' && (
                                      <div className="aspect-video w-full bg-black rounded flex items-center justify-center opacity-60 text-white">
                                          <span className="material-symbols-outlined text-4xl">play_circle</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}

                      {(!form || form.fields.length === 0) && (
                          <div className="flex flex-col items-center justify-center h-64 opacity-30 border-2 border-dashed rounded-xl" style={{ borderColor: currentTheme.textColor }}>
                              <span className="material-symbols-outlined text-4xl mb-2">drag_indicator</span>
                              <p className="font-bold">Drag and drop fields here</p>
                          </div>
                      )}
                      
                      {/* Submit Button Area */}
                      <div 
                        className={`mt-8 pt-6 border-t transition-all duration-200 cursor-pointer rounded-lg p-4 ${selectedId === 'form-settings' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                        style={{ borderColor: `${currentTheme.textColor}20` }}
                        onClick={(e) => { e.stopPropagation(); setSelectedId('form-settings'); }}
                      >
                          <button 
                              className="custom-btn w-full py-4 font-bold text-lg shadow-lg pointer-events-none opacity-90"
                          >
                              {form?.submitButtonText || 'Submit'}
                          </button>
                          <p className="text-xs opacity-50 mt-2 font-medium text-center">Click to edit submit button text</p>
                      </div>
                  </div>
              </div>
          </main>

          {/* Right Sidebar - Properties / Settings */}
          {(selectedId || isFormSettingsSelected) && (
               <aside className="w-80 bg-white dark:bg-[#1e1e1e] border-l border-black/10 dark:border-white/10 flex flex-col overflow-y-auto z-20 animate-fade-in shadow-xl shrink-0">
                  {isFormSettingsSelected ? (
                      // Form Settings Content
                       <div className="p-4">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="font-bold">Form Settings</h3>
                              <button onClick={() => setSelectedId(null)}><span className="material-symbols-outlined">close</span></button>
                          </div>
                          <div className="flex flex-col gap-6">
                              <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold opacity-70">Logo</label>
                                  <div className="flex items-center gap-3">
                                      {form?.theme?.logo ? (
                                          <img src={form.theme.logo} alt="Logo" className="h-12 w-12 object-contain bg-black/5 rounded" />
                                      ) : (
                                          <div className="h-12 w-12 bg-black/5 rounded flex items-center justify-center text-xs text-center p-1">No Logo</div>
                                      )}
                                      <label className="flex-1 cursor-pointer bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 py-2 px-4 rounded text-xs font-bold text-center transition-colors">
                                          Upload Logo
                                          <input type="file" className="hidden" accept="image/*" ref={logoInputRef} onChange={(e) => handleAssetUpload(e, 'logo')} />
                                      </label>
                                  </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold opacity-70">Cover Image</label>
                                  {form?.theme?.coverImage ? (
                                      <div className="h-24 w-full bg-cover bg-center rounded relative group">
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <button onClick={() => updateTheme({ coverImage: '' })} className="text-white text-xs font-bold hover:underline">Remove</button>
                                          </div>
                                          <div className="h-full w-full bg-cover bg-center rounded" style={{ backgroundImage: `url(${form.theme.coverImage})` }}></div>
                                      </div>
                                  ) : (
                                      <div className="h-24 w-full bg-black/5 rounded flex items-center justify-center text-xs opacity-50">No Cover Image</div>
                                  )}
                                  <label className="cursor-pointer bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 py-2 px-4 rounded text-xs font-bold text-center transition-colors">
                                      Upload Cover
                                      <input type="file" className="hidden" accept="image/*" ref={coverInputRef} onChange={(e) => handleAssetUpload(e, 'cover')} />
                                  </label>
                                  {uploadingAsset && <p className="text-xs text-primary animate-pulse">Uploading...</p>}
                              </div>

                              <div className="h-px bg-black/10 dark:bg-white/10"></div>
                              
                              <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold opacity-70">Custom URL Slug</label>
                                  <div className="flex items-center gap-1">
                                      <span className="text-xs opacity-50">regalforms.xyz/</span>
                                      <input 
                                          type="text" 
                                          value={customSlug} 
                                          onChange={(e) => { setCustomSlug(e.target.value); setSlugStatus('idle'); }}
                                          placeholder="my-custom-form"
                                          className="flex-1 p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm"
                                      />
                                  </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold opacity-70">Submit Button Text</label>
                                  <input 
                                      type="text" 
                                      value={form?.submitButtonText || 'Submit'} 
                                      onChange={(e) => updateFormMeta('submitButtonText', e.target.value)}
                                      className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm"
                                  />
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold opacity-70">Border Radius</label>
                                  <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                                      {['none', 'sm', 'md', 'lg', 'full'].map((r) => (
                                          <button 
                                              key={r} 
                                              onClick={() => updateTheme({ borderRadius: r as any })}
                                              className={`flex-1 py-1 rounded text-[10px] uppercase font-bold ${form?.theme?.borderRadius === r ? 'bg-white shadow-sm text-black' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                                          >
                                              {r}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                              
                               <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold opacity-70">Font Family</label>
                                  <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                                      {['sans', 'serif', 'mono'].map((f) => (
                                          <button 
                                              key={f} 
                                              onClick={() => updateTheme({ fontFamily: f as any })}
                                              className={`flex-1 py-1 rounded text-[10px] uppercase font-bold ${form?.theme?.fontFamily === f ? 'bg-white shadow-sm text-black' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                                          >
                                              {f}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          </div>
                       </div>
                  ) : selectedField ? (
                      // Field Properties Content
                      <div className="p-4">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="font-bold">Field Properties</h3>
                              <button onClick={() => setSelectedId(null)}><span className="material-symbols-outlined">close</span></button>
                          </div>
                          <div className="flex flex-col gap-4">
                              <div>
                                  <label className="text-xs font-bold opacity-70">Label</label>
                                  <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={selectedField.label} 
                                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                        className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm"
                                    />
                                    <button 
                                        onClick={() => handleAiOptimizeLabel(selectedField.id, selectedField.label)}
                                        disabled={aiToolLoading}
                                        className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20" 
                                        title="AI Rewrite"
                                    >
                                        <span className={`material-symbols-outlined text-lg ${aiToolLoading ? 'animate-spin' : ''}`}>auto_fix_high</span>
                                    </button>
                                  </div>
                              </div>
                              
                              {['text','email','url','number','phone','textarea'].includes(selectedField.type) && (
                                  <div>
                                      <label className="text-xs font-bold opacity-70">Placeholder</label>
                                      <input 
                                          type="text" 
                                          value={selectedField.placeholder || ''} 
                                          onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                          className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm"
                                      />
                                  </div>
                              )}
                              
                              <div>
                                  <label className="text-xs font-bold opacity-70">Helper Text</label>
                                  <input 
                                      type="text" 
                                      value={selectedField.helperText || ''} 
                                      onChange={(e) => updateField(selectedField.id, { helperText: e.target.value })}
                                      className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm"
                                  />
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                  <label className="text-sm font-bold">Required</label>
                                  <input 
                                      type="checkbox" 
                                      checked={selectedField.required} 
                                      onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                      className="size-4 accent-primary"
                                  />
                              </div>
                              
                              {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                                  <div className="pt-4 border-t border-black/10 dark:border-white/10">
                                      <div className="flex justify-between items-center mb-3">
                                          <label className="text-xs font-bold opacity-70">Options List</label>
                                          <button 
                                            onClick={() => handleAiGenerateOptions(selectedField.id, selectedField.label)}
                                            className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                          >
                                              <span className="material-symbols-outlined text-xs">auto_awesome</span> AI Generate
                                          </button>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                          {selectedField.options?.map((opt, i) => (
                                              <div key={i} className="flex items-center gap-2 group">
                                                  <span className="text-[10px] font-mono text-black/30 dark:text-white/30 w-4 text-right select-none">{i + 1}.</span>
                                                  <div className="flex-1 relative">
                                                      <input 
                                                          type="text" 
                                                          value={opt} 
                                                          onChange={(e) => {
                                                              const newOpts = [...(selectedField.options || [])];
                                                              newOpts[i] = e.target.value;
                                                              updateField(selectedField.id, { options: newOpts });
                                                          }}
                                                          className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                          placeholder={`Option ${i + 1}`}
                                                      />
                                                  </div>
                                                  <button 
                                                      onClick={() => {
                                                          const newOpts = selectedField.options?.filter((_, idx) => idx !== i);
                                                          updateField(selectedField.id, { options: newOpts });
                                                      }}
                                                      className="size-7 flex items-center justify-center text-black/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                      title="Remove Option"
                                                  >
                                                      <span className="material-symbols-outlined text-sm">close</span>
                                                  </button>
                                              </div>
                                          ))}
                                          <button 
                                              onClick={() => updateField(selectedField.id, { options: [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`] })}
                                              className="mt-2 flex items-center justify-center gap-1 w-full py-2 rounded-lg border border-dashed border-black/10 dark:border-white/10 hover:border-primary hover:text-primary hover:bg-primary/5 text-xs font-bold text-black/50 dark:text-white/50 transition-all"
                                          >
                                              <span className="material-symbols-outlined text-sm">add</span> Add Option
                                          </button>
                                      </div>
                                  </div>
                              )}

                              {selectedField.type === 'html' && (
                                  <div>
                                      <label className="text-xs font-bold opacity-70">HTML Content</label>
                                      <textarea 
                                          rows={6}
                                          value={selectedField.content || ''} 
                                          onChange={(e) => updateField(selectedField.id, { content: e.target.value })}
                                          className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm font-mono"
                                      />
                                  </div>
                              )}
                              
                              {selectedField.type === 'product' && (
                                  <div className="flex flex-col gap-3 pt-2 border-t border-black/10 dark:border-white/10">
                                      <div>
                                          <label className="text-xs font-bold opacity-70">Price</label>
                                          <input type="number" value={selectedField.price} onChange={(e) => updateField(selectedField.id, { price: Number(e.target.value) })} className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm" />
                                      </div>
                                      <div>
                                          <label className="text-xs font-bold opacity-70">Currency</label>
                                          <input type="text" value={selectedField.currency} onChange={(e) => updateField(selectedField.id, { currency: e.target.value })} className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-transparent text-sm" />
                                      </div>
                                  </div>
                              )}

                              {/* Logic Rules Section */}
                              <div className="pt-4 border-t border-black/10 dark:border-white/10 mt-2">
                                  <div className="flex justify-between items-center mb-2">
                                      <label className="text-xs font-bold opacity-70 flex items-center gap-1">
                                          <span className="material-symbols-outlined text-sm">call_split</span> Logic
                                      </label>
                                      <button onClick={() => addLogicRule(selectedField.id)} className="text-xs text-primary font-bold hover:underline">+ Add Rule</button>
                                  </div>
                                  {selectedField.logic && selectedField.logic.length > 0 ? (
                                      <div className="flex flex-col gap-2">
                                          {selectedField.logic.map((rule, i) => (
                                              <div key={i} className="p-2 bg-black/5 dark:bg-white/5 rounded text-xs flex flex-col gap-2 relative group">
                                                  <button onClick={() => removeLogicRule(selectedField.id, i)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
                                                  <div className="flex items-center gap-1">
                                                      <select 
                                                          value={rule.action}
                                                          onChange={(e) => updateLogicRule(selectedField.id, i, { action: e.target.value as any })}
                                                          className="bg-transparent font-bold border-b border-black/20 outline-none"
                                                      >
                                                          <option value="show">Show</option>
                                                          <option value="hide">Hide</option>
                                                      </select>
                                                      <span>this field if</span>
                                                  </div>
                                                  <select 
                                                      value={rule.fieldId}
                                                      onChange={(e) => updateLogicRule(selectedField.id, i, { fieldId: e.target.value })}
                                                      className="w-full p-1 bg-white dark:bg-black rounded border border-black/10"
                                                  >
                                                      <option value="">Select Field</option>
                                                      {form?.fields.filter(f => f.id !== selectedField.id).map(f => (
                                                          <option key={f.id} value={f.id}>{f.label}</option>
                                                      ))}
                                                  </select>
                                                  <div className="flex gap-1">
                                                      <select 
                                                          value={rule.condition}
                                                          onChange={(e) => updateLogicRule(selectedField.id, i, { condition: e.target.value as any })}
                                                          className="flex-1 p-1 bg-white dark:bg-black rounded border border-black/10"
                                                      >
                                                          <option value="equals">Equals</option>
                                                          <option value="not_equals">Not Equals</option>
                                                          <option value="contains">Contains</option>
                                                      </select>
                                                      <input 
                                                          type="text"
                                                          value={rule.value}
                                                          onChange={(e) => updateLogicRule(selectedField.id, i, { value: e.target.value })}
                                                          placeholder="Value"
                                                          className="flex-1 p-1 bg-white dark:bg-black rounded border border-black/10"
                                                      />
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  ) : (
                                      <p className="text-xs opacity-50 italic">No logic rules defined.</p>
                                  )}
                              </div>
                          </div>
                      </div>
                  ) : null}
               </aside>
          )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-md w-full p-6 border border-black/10 dark:border-white/10">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black">Share Form</h3>
                      <button onClick={() => setShowShareModal(false)}><span className="material-symbols-outlined">close</span></button>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                          <div>
                              <p className="font-bold text-sm text-green-800 dark:text-green-300">Form Published Successfully!</p>
                              <p className="text-xs text-green-700 dark:text-green-400">Your form is now live and ready to collect responses.</p>
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold opacity-70 mb-1 block">Public Link</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  readOnly 
                                  value={shareUrl} 
                                  className="flex-1 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-mono"
                              />
                              <button 
                                  onClick={() => {
                                      navigator.clipboard.writeText(shareUrl);
                                      setCopySuccess(true);
                                      setTimeout(() => setCopySuccess(false), 2000);
                                  }}
                                  className="px-4 bg-primary text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                              >
                                  {copySuccess ? <span className="material-symbols-outlined text-lg">check</span> : <span className="material-symbols-outlined text-lg">content_copy</span>}
                              </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-2">
                          <a 
                              href={`https://twitter.com/intent/tweet?text=Check out this form I built with Regal Forms!&url=${encodeURIComponent(shareUrl)}`}
                              target="_blank"
                              rel="noreferrer" 
                              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black text-white hover:opacity-80 transition-opacity text-sm font-bold"
                          >
                              <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                              Post to X
                          </a>
                          <a 
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                              target="_blank"
                              rel="noreferrer" 
                              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0077b5] text-white hover:opacity-80 transition-opacity text-sm font-bold"
                          >
                              <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              LinkedIn
                          </a>
                      </div>
                      
                      <div className="pt-4 border-t border-black/10 dark:border-white/10 text-center">
                           <Link to="/admin" className="text-primary text-sm font-bold hover:underline">Return to Dashboard</Link>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-sm w-full p-6 border border-black/10 dark:border-white/10">
                  <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-2xl">warning</span>
                  </div>
                  <h3 className="text-xl font-black mb-2">Clear All Fields?</h3>
                  <p className="text-black/60 dark:text-white/60 mb-6 text-sm">
                      This will remove all form fields. This action cannot be undone. Are you sure you want to start over?
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowClearModal(false)} 
                        className="flex-1 py-3 rounded-lg font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmClearFields}
                        className="flex-1 py-3 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                          Yes, Clear
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BuilderPage;