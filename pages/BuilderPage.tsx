
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateFormSchema, generateOptionsForField, optimizeFieldLabel } from '../services/geminiService';
import { FormField, GeneratedForm, GenerationStatus, LogicRule, FormTheme } from '../types';
import { collection, updateDoc, doc, serverTimestamp, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
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
        name: "Regal Default", 
        theme: { primaryColor: '#f27f0d', backgroundColor: '#ffffff', textColor: '#18181b', fontFamily: 'sans', borderRadius: 'lg' } 
    },
    { 
        name: "Ocean Blue", 
        theme: { primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'md' } 
    },
    { 
        name: "Dark Night", 
        theme: { primaryColor: '#8b5cf6', backgroundColor: '#18181b', textColor: '#ffffff', fontFamily: 'sans', borderRadius: 'lg' } 
    },
    { 
        name: "Elegant Serif", 
        theme: { primaryColor: '#be185d', backgroundColor: '#fff1f2', textColor: '#4c0519', fontFamily: 'serif', borderRadius: 'sm' } 
    },
    { 
        name: "Forest Green", 
        theme: { primaryColor: '#15803d', backgroundColor: '#f0fdf4', textColor: '#14532d', fontFamily: 'mono', borderRadius: 'none' } 
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
      }
  }, [location.state]);

  const selectedField = form?.fields.find(f => f.id === selectedId) || null;
  const isFormSettingsSelected = selectedId === 'form-settings';
  
  // Current Theme with fallback
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
      setForm({ ...form, theme: { ...presetTheme, logo: form.theme?.logo, coverImage: form.theme?.coverImage } });
  };

  // Helpers for Canvas Styles
  const getBorderRadiusPx = (size: string) => {
      const map: any = { 'none': '0px', 'sm': '4px', 'md': '8px', 'lg': '12px', 'full': '24px' };
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

  // ... AI Tool Handlers ...
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

    // ... Field Defaults ...
    if (type === 'select' || type === 'radio' || type === 'checkbox') newField.options = ['Option 1', 'Option 2', 'Option 3'];
    if (type === 'product') { newField.price = 10; newField.currency = 'USD'; newField.paymentMethods = ['card']; }
    if (type === 'rating') newField.max = 5;
    if (type === 'slider') { newField.min = 0; newField.max = 100; newField.step = 1; }

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

  const moveField = (index: number, direction: 'up'|'down') => {
      if (!form) return;
      const newFields = [...form.fields];
      if (direction === 'up' && index > 0) {
          [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
      } else if (direction === 'down' && index < newFields.length - 1) {
          [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      }
      setForm({ ...form, fields: newFields });
  };

  const updateFormMeta = (key: string, value: any) => {
      if (!form) return;
      if (key === 'title') setTitleError(false);
      setForm({ ...form, [key]: value });
  };

  // Drag & Drop
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

          const payload = {
              ...form, // Includes theme
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
          }
      } catch (e: any) {
          console.error(e);
          alert("Save failed: " + e.message);
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">
      
      {/* Sidebar */}
      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg">
          <button onClick={() => setActiveTab('ai')} className={`flex-1 py-2 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${activeTab === 'ai' ? 'bg-secondary text-white shadow-md' : 'hover:bg-white/50 opacity-70'}`}>
            <span className="material-symbols-outlined text-sm">auto_awesome</span> AI
          </button>
          <button onClick={() => setActiveTab('tools')} className={`flex-1 py-2 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${activeTab === 'tools' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'hover:bg-white/50 opacity-70'}`}>
            <span className="material-symbols-outlined text-sm">build</span> Tools
          </button>
          <button onClick={() => setActiveTab('design')} className={`flex-1 py-2 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${activeTab === 'design' ? 'bg-pink-600 text-white shadow-md' : 'hover:bg-white/50 opacity-70'}`}>
            <span className="material-symbols-outlined text-sm">palette</span> Design
          </button>
        </div>

        <div className="flex-1 bg-white dark:bg-background-dark p-5 rounded-xl border border-black/10 dark:border-white/10 shadow-sm overflow-y-auto">
          
          {activeTab === 'ai' && (
             <div className="flex flex-col gap-4">
                <h2 className="font-bold text-secondary">AI Generator</h2>
                <textarea value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-3 rounded-lg border border-secondary/20 bg-background-light dark:bg-white/5 h-32 text-sm" placeholder="Describe your form..." />
                <button onClick={handleGenerate} disabled={status === GenerationStatus.LOADING} className="w-full py-3 bg-secondary text-white rounded-lg font-bold text-sm flex justify-center items-center gap-2">
                    {status === GenerationStatus.LOADING ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Generate'}
                </button>
             </div>
          )}

          {activeTab === 'tools' && (
             <div className="flex flex-col h-full">
                 <div className="grid grid-cols-2 gap-3 mb-4">
                    {FIELD_TYPES.map(item => (
                        <div key={item.type} draggable onDragStart={(e) => handleDragStart(e, item.type)} onClick={() => addField(item.type)} className="flex flex-col items-center p-3 rounded border border-black/5 dark:border-white/5 hover:border-primary hover:bg-primary/5 cursor-grab active:cursor-grabbing transition-all">
                            <span className="material-symbols-outlined text-xl opacity-70">{item.icon}</span>
                            <span className="text-[10px] font-bold mt-1">{item.label}</span>
                        </div>
                    ))}
                 </div>
                 {form && form.fields.length > 0 && (
                     <button 
                        onClick={clearAllFields} 
                        className="mt-auto w-full py-2 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                     >
                         Clear Canvas
                     </button>
                 )}
             </div>
          )}

          {activeTab === 'design' && (
             <div className="flex flex-col gap-6 animate-fade-in">
                 <div>
                     <h3 className="text-xs font-bold uppercase text-black/50 dark:text-white/50 mb-3">Presets</h3>
                     <div className="grid grid-cols-5 gap-2">
                         {THEME_PRESETS.map((p, i) => (
                             <button 
                                key={i} 
                                onClick={() => applyPreset(p.theme)}
                                title={p.name}
                                className="size-8 rounded-full border-2 border-white dark:border-white/10 shadow-sm hover:scale-110 transition-transform"
                                style={{ backgroundColor: p.theme.primaryColor }}
                             ></button>
                         ))}
                     </div>
                 </div>

                 <div className="space-y-3">
                     <h3 className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Colors</h3>
                     <div className="flex items-center justify-between">
                         <span className="text-sm">Primary</span>
                         <input type="color" value={currentTheme.primaryColor} onChange={(e) => updateTheme({ primaryColor: e.target.value })} className="size-8 rounded cursor-pointer border-0 p-0" />
                     </div>
                     <div className="flex items-center justify-between">
                         <span className="text-sm">Background</span>
                         <input type="color" value={currentTheme.backgroundColor} onChange={(e) => updateTheme({ backgroundColor: e.target.value })} className="size-8 rounded cursor-pointer border-0 p-0" />
                     </div>
                     <div className="flex items-center justify-between">
                         <span className="text-sm">Text</span>
                         <input type="color" value={currentTheme.textColor} onChange={(e) => updateTheme({ textColor: e.target.value })} className="size-8 rounded cursor-pointer border-0 p-0" />
                     </div>
                 </div>

                 <div className="space-y-3">
                     <h3 className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Typography & Style</h3>
                     <div className="flex flex-col gap-1">
                         <label className="text-sm">Font Family</label>
                         <select value={currentTheme.fontFamily} onChange={(e) => updateTheme({ fontFamily: e.target.value as any })} className="w-full p-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm">
                             <option value="sans">Sans Serif (Modern)</option>
                             <option value="serif">Serif (Elegant)</option>
                             <option value="mono">Monospace (Tech)</option>
                         </select>
                     </div>
                     <div className="flex flex-col gap-1">
                         <label className="text-sm">Border Radius</label>
                         <div className="flex bg-black/5 dark:bg-white/5 rounded p-1">
                             {['none', 'sm', 'md', 'lg', 'full'].map((r) => (
                                 <button 
                                    key={r} 
                                    onClick={() => updateTheme({ borderRadius: r as any })}
                                    className={`flex-1 py-1 rounded text-[10px] font-bold uppercase ${currentTheme.borderRadius === r ? 'bg-white dark:bg-white/20 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                                 >
                                     {r}
                                 </button>
                             ))}
                         </div>
                     </div>
                 </div>

                 <div className="space-y-3 border-t border-black/10 dark:border-white/10 pt-4">
                     <h3 className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Branding</h3>
                     <div className="flex flex-col gap-1">
                         <label className="text-sm">Logo URL</label>
                         <input type="text" value={currentTheme.logo || ''} onChange={(e) => updateTheme({ logo: e.target.value })} placeholder="https://..." className="w-full p-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm" />
                     </div>
                     <div className="flex flex-col gap-1">
                         <label className="text-sm">Cover Image URL</label>
                         <input type="text" value={currentTheme.coverImage || ''} onChange={(e) => updateTheme({ coverImage: e.target.value })} placeholder="https://..." className="w-full p-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm" />
                     </div>
                 </div>
             </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
         <div className="flex-1 bg-zinc-100 dark:bg-[#121212] rounded-xl border border-black/10 dark:border-white/10 shadow-lg overflow-hidden flex flex-col relative">
             
             {/* Top Toolbar */}
             <div className="p-3 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#1e1e1e] flex justify-between items-center shrink-0 z-10">
                 <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">design_services</span>
                     <span className="font-bold text-sm uppercase tracking-wider">Canvas</span>
                 </div>
                 <div className="flex items-center gap-2">
                     <button onClick={() => saveToFirestore('draft')} disabled={isSaving} className="px-3 py-1.5 text-xs font-bold border border-black/10 dark:border-white/10 rounded hover:bg-black/5 dark:hover:bg-white/5">
                         {draftSaved ? 'Saved' : 'Save Draft'}
                     </button>
                     <button onClick={() => navigate('/preview', { state: { formData: form, formId } })} className="px-3 py-1.5 text-xs font-bold border border-black/10 dark:border-white/10 rounded hover:bg-black/5 dark:hover:bg-white/5">Preview</button>
                     <button onClick={() => setShowShareModal(true)} disabled={!formId} className="px-3 py-1.5 text-xs font-bold border border-black/10 dark:border-white/10 rounded hover:bg-black/5 dark:hover:bg-white/5">Share</button>
                     <button onClick={() => saveToFirestore('published')} disabled={isSaving} className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded hover:bg-orange-600">Publish</button>
                 </div>
             </div>

             {/* Theme-Aware Canvas */}
             <div 
                className={`flex-1 overflow-y-auto p-4 sm:p-8 transition-all duration-200 ${currentTheme.fontFamily === 'serif' ? 'font-serif' : currentTheme.fontFamily === 'mono' ? 'font-mono' : 'font-sans'}`}
                style={{ backgroundColor: currentTheme.backgroundColor, color: currentTheme.textColor }}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                onClick={() => setSelectedId('form-settings')}
             >
                 <div className={`max-w-2xl mx-auto min-h-full ${isDraggingOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''} pb-20 transition-all`}>
                     {/* Branding Header */}
                     {currentTheme.coverImage && (
                         <div className="w-full h-32 sm:h-48 rounded-t-lg bg-cover bg-center mb-4" style={{ backgroundImage: `url(${currentTheme.coverImage})`, borderRadius: `${getBorderRadiusPx(currentTheme.borderRadius)} ${getBorderRadiusPx(currentTheme.borderRadius)} 0 0` }}></div>
                     )}
                     {currentTheme.logo && (
                         <div className="flex justify-center mb-6">
                             <img src={currentTheme.logo} alt="Logo" className="h-16 object-contain" />
                         </div>
                     )}

                     {/* Title Block */}
                     <div 
                        onClick={(e) => { e.stopPropagation(); setSelectedId('form-settings'); }} 
                        className={`text-center mb-8 p-4 rounded cursor-pointer ${isFormSettingsSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                     >
                         <input 
                            value={form?.title || ''} 
                            onChange={(e) => updateFormMeta('title', e.target.value)}
                            className="text-3xl font-black text-center w-full bg-transparent outline-none placeholder:opacity-50" 
                            placeholder="Form Title"
                            style={{ color: currentTheme.textColor }}
                         />
                         <textarea 
                            value={form?.description || ''}
                            onChange={(e) => updateFormMeta('description', e.target.value)}
                            className="w-full text-center bg-transparent outline-none resize-none mt-2 opacity-80"
                            placeholder="Form Description"
                            style={{ color: currentTheme.textColor }}
                         />
                     </div>

                     {/* Fields */}
                     {form?.fields.map((field, index) => (
                         <div 
                            key={field.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedId(field.id); }}
                            className="relative p-6 border transition-all cursor-pointer mb-4 group"
                            style={{
                                backgroundColor: selectedId === field.id ? `${currentTheme.primaryColor}10` : 'rgba(255,255,255,0.05)',
                                borderColor: selectedId === field.id ? currentTheme.primaryColor : `${currentTheme.textColor}20`,
                                borderRadius: getBorderRadiusPx(currentTheme.borderRadius),
                                boxShadow: selectedId === field.id ? `0 0 0 2px ${currentTheme.primaryColor}20` : 'none'
                            }}
                         >
                             <div className="flex justify-between items-start mb-2">
                                 <label className="font-bold" style={{ color: currentTheme.textColor }}>
                                     {field.label} {field.required && <span className="text-red-500">*</span>}
                                 </label>
                                 <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                     <button onClick={(e) => {e.stopPropagation(); duplicateField(field.id)}} className="hover:text-primary"><span className="material-symbols-outlined text-lg">content_copy</span></button>
                                     <button onClick={(e) => {e.stopPropagation(); removeField(field.id)}} className="hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                                 </div>
                             </div>
                             
                             <div className="opacity-60 text-sm p-3 border border-dashed rounded bg-black/5 dark:bg-white/5" style={{ borderColor: currentTheme.textColor }}>
                                 {['text', 'email'].includes(field.type) && `Input Preview`}
                                 {field.type === 'select' && `Dropdown Preview`}
                                 {!['text','email','select'].includes(field.type) && `${field.type.toUpperCase()} FIELD`}
                             </div>
                         </div>
                     ))}

                     {(!form || form.fields.length === 0) && (
                         <div className="text-center opacity-40 py-10 border-2 border-dashed rounded-lg" style={{ borderColor: currentTheme.textColor }}>
                             <p>Drag fields here</p>
                         </div>
                     )}

                     <div className="mt-8 flex justify-center">
                         <button className="px-8 py-3 font-bold text-white rounded shadow-lg opacity-90" style={{ backgroundColor: currentTheme.primaryColor, borderRadius: getBorderRadiusPx(currentTheme.borderRadius) }}>
                             {form?.submitButtonText || 'Submit'}
                         </button>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl max-w-md w-full shadow-2xl">
                  <h3 className="text-xl font-bold mb-2">Share Form</h3>
                  <p className="text-sm opacity-70 mb-4">Your form is ready!</p>
                  <div className="flex gap-2">
                      <input readOnly value={`${window.location.origin}/#/form/${customSlug || formId}`} className="flex-1 p-2 border rounded bg-black/5 dark:bg-white/5 text-sm" />
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/#/form/${customSlug || formId}`); setCopySuccess(true); }} className="bg-primary text-white px-4 rounded font-bold text-sm">{copySuccess ? 'Copied!' : 'Copy'}</button>
                  </div>
                  <button onClick={() => setShowShareModal(false)} className="mt-4 w-full py-2 border rounded text-sm font-bold">Close</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default BuilderPage;
