
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateFormSchema, generateOptionsForField, optimizeFieldLabel } from '../services/geminiService';
import { FormField, GeneratedForm, GenerationStatus, LogicRule } from '../types';
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

const BuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'ai' | 'tools'>('ai');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  
  const [form, setForm] = useState<GeneratedForm | null>(null);
  const [formId, setFormId] = useState<string | null>(null); 
  
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | 'form-settings' | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  
  // Slug state
  const [customSlug, setCustomSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // AI Tool loading states
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

  // AI Tools Handlers
  const handleAiGenerateOptions = async (fieldId: string, label: string) => {
      setAiToolLoading(true);
      try {
          const newOptions = await generateOptionsForField(label);
          updateField(fieldId, { options: newOptions });
      } catch (e) {
          console.error(e);
      } finally {
          setAiToolLoading(false);
      }
  };

  const handleAiOptimizeLabel = async (fieldId: string, label: string) => {
      setAiToolLoading(true);
      try {
          const optimized = await optimizeFieldLabel(label);
          updateField(fieldId, { label: optimized });
      } catch (e) {
          console.error(e);
      } finally {
          setAiToolLoading(false);
      }
  };

  const initFormIfNeeded = () => {
    if (!form) {
      const newForm = {
        title: "Untitled Form",
        description: "Add a description to your form.",
        fields: [],
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
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
    
    let newField: FormField = {
      id: newId,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type as any,
      required: false,
    };

    if (type === 'select' || type === 'radio' || type === 'checkbox') {
        newField.options = ['Option 1', 'Option 2', 'Option 3'];
    } else if (type === 'phone') {
        newField.placeholder = '123-456-7890';
    } else if (type === 'url') {
        newField.placeholder = 'https://example.com';
    } else if (type === 'youtube') {
        newField.label = 'Video Embed';
        newField.videoUrl = '';
        newField.placeholder = 'Paste YouTube Link here';
    } else if (type === 'quote') {
        newField.label = 'Quote';
        newField.content = 'Insert quote text here...';
        newField.author = 'Author Name';
    } else if (type === 'html') {
        newField.label = 'Text Block';
        newField.content = '<p>Enter your formatted text or HTML here.</p>';
    } else if (type === 'countdown') {
        newField.label = 'Event Countdown';
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        newField.targetDate = nextWeek.toISOString().split('T')[0];
    } else if (type === 'product') {
        newField.label = 'Product Name';
        newField.price = 10.00;
        newField.currency = 'USD';
        newField.productDescription = 'Great product description';
        newField.required = false; 
        newField.paymentMethods = ['card'];
    } else if (type === 'stripe') {
        newField.label = 'Credit Card Payment';
        newField.paymentMethods = ['visa', 'mastercard', 'amex'];
    } else if (type === 'paypal') {
        newField.label = 'PayPal Checkout';
        newField.currency = 'USD';
    } else if (type === 'file' || type === 'image') {
        newField.maxFileSizeMB = 5;
        newField.allowedFileTypes = ['.jpg', '.png', '.pdf'];
    } else if (type === 'rating') {
        newField.max = 5;
    } else if (type === 'slider') {
        newField.min = 0;
        newField.max = 100;
        newField.step = 1;
    } else if (['text', 'email', 'number', 'textarea'].includes(type)) {
        newField.placeholder = 'Enter your answer';
    }

    setForm({
      ...currentForm,
      fields: [...currentForm.fields, newField]
    });
    setSelectedId(newId);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    if (!form) return;
    setForm({
      ...form,
      fields: form.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const togglePaymentMethod = (id: string, method: string) => {
    if (!form) return;
    const field = form.fields.find(f => f.id === id);
    if (!field) return;
    
    const currentMethods = field.paymentMethods || [];
    let newMethods;
    if (currentMethods.includes(method)) {
        newMethods = currentMethods.filter(m => m !== method);
    } else {
        newMethods = [...currentMethods, method];
    }
    updateField(id, { paymentMethods: newMethods });
  };

  const duplicateField = (id: string) => {
      if (!form) return;
      const fieldToClone = form.fields.find(f => f.id === id);
      if (!fieldToClone) return;

      const newId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const clonedField = {
          ...fieldToClone,
          id: newId,
          label: `${fieldToClone.label} (Copy)`
      };
      
      const index = form.fields.findIndex(f => f.id === id);
      const newFields = [...form.fields];
      newFields.splice(index + 1, 0, clonedField);

      setForm({ ...form, fields: newFields });
      setSelectedId(newId);
  };

  const removeField = (id: string) => {
    if (!form) return;
    setForm({
      ...form,
      fields: form.fields.filter(f => f.id !== id)
    });
    if (selectedId === id) setSelectedId(null);
  };

  const clearAllFields = () => {
      if (!form) return;
      if (window.confirm("Are you sure you want to clear all fields? This cannot be undone.")) {
          setForm({ ...form, fields: [] });
          setSelectedId('form-settings');
      }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!form) return;
    const newFields = [...form.fields];
    if (direction === 'up' && index > 0) {
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }
    setForm({ ...form, fields: newFields });
  };

  const updateFormMeta = (key: 'title' | 'description' | 'submitButtonText' | 'successMessage', value: string) => {
    if (!form) return;
    if (key === 'title') setTitleError(false);
    setForm({ ...form, [key]: value });
  };

  const addOption = (fieldId: string) => {
    const field = form?.fields.find(f => f.id === fieldId);
    if(!field) return;
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    updateField(fieldId, { options: newOptions });
  };

  const updateOption = (fieldId: string, index: number, value: string) => {
    const field = form?.fields.find(f => f.id === fieldId);
    if(!field || !field.options) return;
    const newOptions = [...field.options];
    newOptions[index] = value;
    updateField(fieldId, { options: newOptions });
  };

  const removeOption = (fieldId: string, index: number) => {
    const field = form?.fields.find(f => f.id === fieldId);
    if(!field || !field.options) return;
    const newOptions = field.options.filter((_, i) => i !== index);
    updateField(fieldId, { options: newOptions });
  };

  const addLogicRule = (fieldId: string) => {
      const field = form?.fields.find(f => f.id === fieldId);
      if(!field) return;
      const newRule: LogicRule = {
          fieldId: form?.fields.filter(f => f.id !== fieldId)[0]?.id || '',
          condition: 'equals',
          value: '',
          action: 'show'
      };
      const newLogic = [...(field.logic || []), newRule];
      updateField(fieldId, { logic: newLogic });
  };

  const updateLogicRule = (fieldId: string, index: number, updates: Partial<LogicRule>) => {
      const field = form?.fields.find(f => f.id === fieldId);
      if(!field || !field.logic) return;
      const newLogic = [...field.logic];
      newLogic[index] = { ...newLogic[index], ...updates };
      updateField(fieldId, { logic: newLogic });
  };

  const removeLogicRule = (fieldId: string, index: number) => {
      const field = form?.fields.find(f => f.id === fieldId);
      if(!field || !field.logic) return;
      const newLogic = field.logic.filter((_, i) => i !== index);
      updateField(fieldId, { logic: newLogic });
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/react-dnd-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const type = e.dataTransfer.getData('application/react-dnd-type');
    if (type) {
      addField(type);
    }
  };

  const checkSlugAvailability = async (slugToCheck: string) => {
      if (!slugToCheck) return;
      if (slugToCheck === formId) { // ID is always a valid slug for itself
          setSlugStatus('available');
          return;
      }
      setSlugStatus('checking');
      try {
          const q = query(collection(db, "forms"), where("slug", "==", slugToCheck));
          const querySnapshot = await getDocs(q);
          // If found docs, and not the current form, then taken
          if (!querySnapshot.empty) {
              const docMatch = querySnapshot.docs[0];
              if (docMatch.id !== formId) {
                  setSlugStatus('taken');
                  return;
              }
          }
          setSlugStatus('available');
      } catch (e) {
          console.error("Error checking slug", e);
          setSlugStatus('available'); // assume ok on error to not block
      }
  };

  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          if (customSlug && customSlug.length > 2) {
              checkSlugAvailability(customSlug);
          } else {
              setSlugStatus('idle');
          }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [customSlug]);

  const handleOpenPreview = () => {
      if (form) {
          if (!form.title.trim()) {
              setTitleError(true);
              return;
          }
          navigate('/preview', { 
              state: { 
                  formData: form,
                  formId: formId 
              } 
          });
      } else {
          navigate('/preview');
      }
  };

  const handleOpenSettings = () => {
      if (form) {
          navigate('/settings', { 
              state: { 
                  formData: form,
                  formId: formId
              } 
          });
      }
  };

  const handleCopyLink = () => {
      const url = `${window.location.origin}/#/form/${customSlug || formId}`;
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
  };

  const saveToFirestore = async (targetStatus: 'draft' | 'published') => {
      if (!form) return;
      if (!form.title.trim()) {
          setTitleError(true);
          return;
      }
      if (!currentUser) {
          alert("You must be logged in to save.");
          return;
      }
      
      setIsSaving(true);
      try {
          const currentTimestamp = serverTimestamp();
          
          // Generate ID client-side if new, to use in slug immediately
          let targetId = formId;
          let docRef;
          
          if (!targetId) {
              // Create a reference to generate an ID
              docRef = doc(collection(db, "forms"));
              targetId = docRef.id;
          } else {
              docRef = doc(db, "forms", targetId);
          }

          // Prepare Slug
          let finalSlug = customSlug;
          if (!finalSlug || (targetStatus === 'published' && slugStatus === 'taken')) {
             // Default to ID if no custom slug or taken
             finalSlug = targetId!;
          }
          
          // Sanitize Fields explicitly
          const cleanFields = form.fields.map(f => {
              const fieldObj: any = {
                  id: f.id,
                  type: f.type,
                  label: f.label || 'Untitled Field',
                  required: !!f.required,
              };
              if (f.placeholder !== undefined) fieldObj.placeholder = f.placeholder;
              if (f.helperText !== undefined) fieldObj.helperText = f.helperText;
              if (f.options && Array.isArray(f.options)) fieldObj.options = f.options;
              if (f.content !== undefined) fieldObj.content = f.content;
              if (f.videoUrl !== undefined) fieldObj.videoUrl = f.videoUrl;
              if (f.targetDate !== undefined) fieldObj.targetDate = f.targetDate;
              if (f.author !== undefined) fieldObj.author = f.author;
              if (f.logic && Array.isArray(f.logic)) fieldObj.logic = f.logic;
              if (f.minLength !== undefined) fieldObj.minLength = Number(f.minLength);
              if (f.maxLength !== undefined) fieldObj.maxLength = Number(f.maxLength);
              if (f.price !== undefined) fieldObj.price = Number(f.price);
              if (f.currency !== undefined) fieldObj.currency = f.currency;
              if (f.productImage !== undefined) fieldObj.productImage = f.productImage;
              if (f.productDescription !== undefined) fieldObj.productDescription = f.productDescription;
              if (f.min !== undefined) fieldObj.min = Number(f.min);
              if (f.max !== undefined) fieldObj.max = Number(f.max);
              if (f.step !== undefined) fieldObj.step = Number(f.step);
              
              // Payment & File Props
              if (f.apiKey !== undefined) fieldObj.apiKey = f.apiKey;
              if (f.paymentMethods !== undefined) fieldObj.paymentMethods = f.paymentMethods;
              if (f.environment !== undefined) fieldObj.environment = f.environment;
              if (f.maxFileSizeMB !== undefined) fieldObj.maxFileSizeMB = Number(f.maxFileSizeMB);
              
              return fieldObj;
          });

          const basePayload = {
              title: form.title || 'Untitled',
              description: form.description || '',
              submitButtonText: form.submitButtonText || 'Submit',
              successMessage: form.successMessage || 'Thank you!',
              slug: finalSlug,
              collectEmails: !!form.collectEmails,
              limitOneResponse: !!form.limitOneResponse,
              restrictToOrg: !!form.restrictToOrg,
              allowResponseEditing: !!form.allowResponseEditing,
              showProgressBar: !!form.showProgressBar,
              shuffleQuestions: !!form.shuffleQuestions,
              collaborators: Array.isArray(form.collaborators) ? form.collaborators : [],
              fields: cleanFields,
              status: targetStatus,
              stats: {
                  views: Number(form.stats?.views || 0),
                  responses: Number(form.stats?.responses || 0),
                  completionRate: Number(form.stats?.completionRate || 0),
                  avgTime: form.stats?.avgTime || '0m 0s'
              },
              updatedAt: currentTimestamp
          };

          if (!formId) {
              // New Document - Use setDoc with generated ID
              await setDoc(docRef, {
                  ...basePayload,
                  userId: currentUser.uid,
                  createdAt: currentTimestamp
              });
              setFormId(targetId);
              setCustomSlug(finalSlug);
          } else {
              // Update existing
              await updateDoc(docRef, basePayload);
              if (customSlug !== finalSlug) setCustomSlug(finalSlug);
          }

          if (targetStatus === 'draft') {
              setDraftSaved(true);
              setTimeout(() => setDraftSaved(false), 2000);
          } else {
              // Instead of navigating, show share modal for better UX
              setShowShareModal(true);
          }

      } catch (e: any) {
          console.error("Error saving form: ", e);
          if (e.code === 'permission-denied') {
              alert("Error: Permission denied. Please ensure you are logged in.");
          } else {
              alert(`Error saving form: ${e.message}`);
          }
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">
      
      {/* Left Sidebar (Tools) */}
      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        {/* ... (Existing code for Tabs and AI Tools) ... */}
        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-secondary text-white shadow-md' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Regal AI
          </button>
          <button 
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'tools' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-lg">build</span>
            Tools
          </button>
        </div>

        <div className="flex-1 bg-white dark:bg-background-dark p-5 rounded-xl border border-black/10 dark:border-white/10 shadow-sm overflow-y-auto">
          {activeTab === 'ai' && (
            <div className="flex flex-col gap-6 h-full animate-fade-in">
              <div>
                <h2 className="text-xl font-bold mb-2 text-secondary">Generate with AI</h2>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Describe your form and let Gemini build it for you.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-secondary/80">Prompt</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Product Order Form with payment options..."
                  className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-secondary/20 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none resize-none h-32 text-sm"
                />
                <button
                  onClick={handleGenerate}
                  disabled={status === GenerationStatus.LOADING || !topic.trim()}
                  className="w-full py-3 bg-secondary hover:bg-purple-600 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-secondary/20"
                >
                  {status === GenerationStatus.LOADING ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">auto_awesome</span>
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="flex flex-col gap-4 h-full animate-fade-in">
               <div>
                <h2 className="text-xl font-bold mb-2">Builder Tools</h2>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Drag fields onto the canvas or click to add.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FIELD_TYPES.map((item) => (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    onClick={() => addField(item.type)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-black/10 dark:border-white/10 bg-background-light dark:bg-white/5 hover:border-primary hover:bg-primary/5 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <span className="material-symbols-outlined text-2xl text-black/60 dark:text-white/60 group-hover:text-primary">{item.icon}</span>
                    <span className="text-xs font-bold text-center">{item.label}</span>
                  </div>
                ))}
              </div>

              {form && form.fields.length > 0 && (
                  <button 
                    onClick={clearAllFields}
                    className="mt-auto w-full py-2 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg font-bold text-xs transition-colors"
                  >
                      Clear Canvas
                  </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle Panel - Canvas (Existing) */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="flex-1 bg-white dark:bg-[#2a1f16] rounded-xl border border-black/10 dark:border-white/10 shadow-lg overflow-hidden flex flex-col">
            {/* Canvas Header */}
            <div className="p-4 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">design_services</span>
                    <span className="font-bold text-sm uppercase tracking-wider">Canvas</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => saveToFirestore('draft')}
                        disabled={!form || isSaving}
                        className="text-xs px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold flex items-center gap-1 transition-colors mr-1"
                    >
                        <span className="material-symbols-outlined text-sm">bookmark</span>
                        {draftSaved ? "Saved!" : "Save Draft"}
                    </button>
                    <button 
                        onClick={handleOpenSettings}
                        disabled={!form}
                        className="text-xs px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">settings</span>
                        Settings
                    </button>
                    <button 
                        onClick={handleOpenPreview}
                        disabled={!form}
                        className="text-xs px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Preview
                    </button>
                     <button 
                        onClick={() => setShowShareModal(true)}
                        disabled={!formId}
                        className="text-xs px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold flex items-center gap-1 transition-colors"
                        title="Share Form"
                    >
                        <span className="material-symbols-outlined text-sm">share</span>
                        Share
                    </button>
                    <button 
                        onClick={() => saveToFirestore('published')}
                        disabled={!form || isSaving}
                        className="text-xs px-4 py-2 bg-primary text-white hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg font-bold flex items-center gap-1 transition-colors shadow-sm"
                    >
                        {isSaving ? "Publishing..." : (formId ? "Update & Publish" : "Publish Form")}
                    </button>
                </div>
            </div>

            {/* Canvas Body (Re-render Fields) */}
             <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => setSelectedId('form-settings')}
                className={`flex-1 overflow-y-auto p-4 sm:p-8 transition-colors duration-200 ${isDraggingOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/50' : ''}`}
            >
                {!form && status !== GenerationStatus.LOADING && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl p-8 pointer-events-none">
                        <div className="size-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-4xl">drag_indicator</span>
                        </div>
                        <p className="text-xl font-bold">Your canvas is empty</p>
                    </div>
                )}

                {status === GenerationStatus.LOADING && (
                    <div className="h-full flex flex-col items-center justify-center">
                         <div className="relative size-16">
                            <div className="absolute inset-0 rounded-full border-4 border-secondary/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
                         </div>
                         <p className="mt-6 text-lg font-medium animate-pulse text-secondary">Constructing your form...</p>
                    </div>
                )}

                {form && (
                    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
                        {/* Title Block */}
                        <div 
                            onClick={(e) => { e.stopPropagation(); setSelectedId('form-settings'); }}
                            className={`mb-8 text-center group relative p-4 rounded-xl border transition-all cursor-pointer
                                ${isFormSettingsSelected 
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:border-dashed hover:border-black/20 dark:hover:border-white/20'
                                }`
                            }
                        >
                            <input 
                                type="text" 
                                value={form.title}
                                onChange={(e) => updateFormMeta('title', e.target.value)}
                                className={`text-3xl font-bold bg-transparent text-center w-full outline-none placeholder:text-primary/50 ${titleError ? 'text-red-500' : 'text-primary'}`}
                                placeholder="Form Title (Required)"
                            />
                            {titleError && (
                                <p className="text-red-500 text-xs mt-1 font-bold">Title is required</p>
                            )}
                            <textarea 
                                value={form.description}
                                onChange={(e) => updateFormMeta('description', e.target.value)}
                                className="mt-2 text-black/70 dark:text-white/70 bg-transparent text-center w-full outline-none resize-none"
                                rows={2}
                                placeholder="Form Description"
                            />
                        </div>

                        {/* Fields List */}
                        <div className="space-y-6">
                            {form.fields.map((field, index) => (
                                <div 
                                    key={field.id} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(field.id);
                                    }}
                                    className={`relative p-6 rounded-xl bg-white dark:bg-black/20 border group hover:shadow-md transition-all cursor-pointer
                                        ${selectedId === field.id 
                                            ? 'border-primary ring-2 ring-primary/20 z-10' 
                                            : 'border-black/10 dark:border-white/10 hover:border-primary/50'
                                        }`}
                                >
                                    <div className={`absolute right-2 top-2 flex items-center gap-1 transition-opacity bg-white dark:bg-[#2a1f16] p-1 rounded shadow-sm border border-black/10 dark:border-white/10 z-10 ${selectedId === field.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }} className="p-1 hover:text-primary" title="Duplicate">
                                            <span className="material-symbols-outlined text-lg">content_copy</span>
                                        </button>
                                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>
                                        <button onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }} disabled={index === 0} className="p-1 hover:text-primary disabled:opacity-30">
                                            <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }} disabled={index === form.fields.length - 1} className="p-1 hover:text-primary disabled:opacity-30">
                                            <span className="material-symbols-outlined text-lg">arrow_downward</span>
                                        </button>
                                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>
                                        <button onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1 hover:text-red-500">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3 pointer-events-none">
                                        <div className="flex items-center gap-2 pr-32">
                                            {!['html', 'quote', 'youtube', 'countdown', 'stripe', 'paypal'].includes(field.type) && (
                                                 <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateField(field.id, { required: !field.required });
                                                    }}
                                                    className={`pointer-events-auto text-xs font-bold px-2 py-0.5 rounded transition-colors border ${field.required ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-black/30 dark:text-white/30 bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10'}`}
                                                >
                                                    {field.required ? '* Req' : 'Opt'}
                                                </button>
                                            )}
                                            <span className="font-semibold text-sm flex-1 truncate">{field.label}</span>
                                        </div>

                                        {/* Field Render Logic */}
                                        {field.type === 'product' ? (
                                            <div className="p-4 rounded-lg border border-black/10 dark:border-white/10 bg-background-light dark:bg-white/5 flex flex-col sm:flex-row gap-4">
                                                {field.productImage && (
                                                    <img src={field.productImage} alt={field.label} className="w-full sm:w-24 h-24 object-cover rounded-lg bg-black/5 dark:bg-white/10" />
                                                )}
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm">{field.label}</span>
                                                            <span className="text-xs opacity-60 line-clamp-1">{field.productDescription || 'No description'}</span>
                                                        </div>
                                                        <span className="font-bold text-lg text-primary">{field.price} {field.currency || 'USD'}</span>
                                                    </div>
                                                    {field.paymentMethods && field.paymentMethods.length > 0 && (
                                                        <div className="mt-2 flex gap-2">
                                                            {field.paymentMethods.includes('visa') && <span className="text-[10px] bg-white dark:bg-white/10 border px-1 rounded">VISA</span>}
                                                            {field.paymentMethods.includes('mastercard') && <span className="text-[10px] bg-white dark:bg-white/10 border px-1 rounded">MC</span>}
                                                            {field.paymentMethods.includes('paypal') && <span className="text-[10px] bg-white dark:bg-white/10 border px-1 rounded">PayPal</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : field.type === 'stripe' ? (
                                            <div className="w-full p-3 rounded-md bg-[#635BFF] text-white flex items-center justify-center font-bold gap-2">
                                                <span className="material-symbols-outlined">credit_card</span> 
                                                Pay with Card {field.price ? `(${field.price} ${field.currency})` : ''}
                                            </div>
                                        ) : field.type === 'paypal' ? (
                                            <div className="w-full p-3 rounded-md bg-[#FFC439] text-black flex items-center justify-center font-bold gap-2">
                                                <span className="material-symbols-outlined">account_balance_wallet</span> 
                                                PayPal {field.price ? `(${field.price} ${field.currency})` : ''}
                                            </div>
                                        ) : field.type === 'file' ? (
                                            <div className="w-full p-3 rounded-md border border-dashed border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center text-center gap-1">
                                                <span className="material-symbols-outlined text-black/40 dark:text-white/40">cloud_upload</span>
                                                <span className="text-xs text-black/40 dark:text-white/40">Drag & drop files here</span>
                                                <span className="text-[10px] opacity-50">Max {field.maxFileSizeMB || 5}MB • {field.allowedFileTypes?.join(', ') || 'Any'}</span>
                                            </div>
                                        ) : field.type === 'html' ? (
                                            <div className="p-3 rounded border border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                                                <div className="text-xs font-bold uppercase opacity-50 mb-1">HTML Content Preview</div>
                                                <div className="text-sm opacity-70 line-clamp-3" dangerouslySetInnerHTML={{ __html: field.content || '' }}></div>
                                            </div>
                                        ) : field.type === 'quote' ? (
                                            <div className="pl-4 border-l-4 border-primary italic text-black/70 dark:text-white/70">
                                                "{field.content}"
                                                <div className="text-xs font-bold mt-1 not-italic">— {field.author}</div>
                                            </div>
                                        ) : field.type === 'youtube' ? (
                                            <div className="aspect-video bg-black/10 dark:bg-white/10 rounded-lg flex items-center justify-center flex-col gap-2 text-black/40 dark:text-white/40">
                                                <span className="material-symbols-outlined text-4xl">play_circle</span>
                                                <span className="text-xs">{field.videoUrl ? 'Video Embedded' : 'No URL Set'}</span>
                                            </div>
                                        ) : field.type === 'countdown' ? (
                                            <div className="flex justify-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                                                {['Days', 'Hours', 'Minutes', 'Seconds'].map(u => (
                                                    <div key={u} className="text-center">
                                                        <div className="text-2xl font-black">00</div>
                                                        <div className="text-[10px] uppercase tracking-wider opacity-60">{u}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="w-full p-3 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 text-sm text-black/40 dark:text-white/40">
                                                {field.placeholder || `[${field.type} input]`}
                                            </div>
                                        )}

                                        {field.helperText && (
                                            <p className="text-xs text-black/50 dark:text-white/50 italic">{field.helperText}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Right Panel - Settings */}
      {selectedId && (
         <div className="w-full lg:w-80 flex flex-col shrink-0 bg-white dark:bg-background-dark rounded-xl border border-black/10 dark:border-white/10 shadow-lg overflow-hidden animate-fade-in h-full">
            {isFormSettingsSelected ? (
                <>
                   {/* Form General Settings (Existing) */}
                   <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">settings</span>
                            <h3 className="font-bold text-sm uppercase tracking-wider">Form Settings</h3>
                        </div>
                        <button onClick={() => setSelectedId(null)} className="hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                        {/* ... Form Settings Inputs ... */}
                         <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Submit Button Text</label>
                            <input 
                                type="text"
                                value={form?.submitButtonText || 'Submit'}
                                onChange={(e) => updateFormMeta('submitButtonText', e.target.value)}
                                className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Success Message</label>
                            <textarea 
                                rows={3}
                                value={form?.successMessage || 'Thank you!'}
                                onChange={(e) => updateFormMeta('successMessage', e.target.value)}
                                className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all resize-none"
                            />
                        </div>
                        
                        {/* Slug / Share Section */}
                        <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col gap-4">
                            <h4 className="font-bold text-sm uppercase tracking-wider text-black/50 dark:text-white/50">Distribution</h4>
                             <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Custom Slug</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={customSlug}
                                        onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase())}
                                        placeholder="my-custom-form"
                                        className={`w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border focus:ring-1 outline-none text-sm transition-all ${slugStatus === 'taken' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-black/10 dark:border-white/10 focus:border-primary focus:ring-primary'}`}
                                    />
                                    <span className="absolute right-3 top-3">
                                        {slugStatus === 'checking' && <span className="material-symbols-outlined text-sm animate-spin">refresh</span>}
                                        {slugStatus === 'available' && <span className="material-symbols-outlined text-sm text-green-500">check</span>}
                                        {slugStatus === 'taken' && <span className="material-symbols-outlined text-sm text-red-500">error</span>}
                                    </span>
                                </div>
                                {slugStatus === 'taken' && <p className="text-xs text-red-500">Slug already taken.</p>}
                            </div>
                        </div>
                        
                         <div className="pt-4 border-t border-black/10 dark:border-white/10">
                            <button 
                                onClick={handleOpenSettings}
                                className="w-full py-3 rounded-lg bg-black/5 dark:bg-white/5 text-black dark:text-white font-bold text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">tune</span>
                                Advanced Settings
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                selectedField && (
                    <>
                        <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                <h3 className="font-bold text-sm uppercase tracking-wider">Field Settings</h3>
                            </div>
                            <button onClick={() => setSelectedId(null)} className="hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                            {/* AI Tools - Only for relevant fields */}
                            {['text', 'textarea', 'select', 'radio', 'checkbox'].includes(selectedField.type) && (
                                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-wider mb-1">
                                        <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Assistant
                                    </div>
                                    <button 
                                        onClick={() => handleAiOptimizeLabel(selectedField.id, selectedField.label)}
                                        disabled={aiToolLoading}
                                        className="w-full text-left text-sm font-medium text-black/70 dark:text-white/70 hover:text-secondary hover:bg-secondary/10 px-2 py-1.5 rounded transition-colors flex items-center gap-2"
                                    >
                                        {aiToolLoading ? <span className="material-symbols-outlined text-sm animate-spin">refresh</span> : <span className="material-symbols-outlined text-sm">edit_note</span>}
                                        Optimize Label
                                    </button>
                                    {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                                        <button 
                                            onClick={() => handleAiGenerateOptions(selectedField.id, selectedField.label)}
                                            disabled={aiToolLoading}
                                            className="w-full text-left text-sm font-medium text-black/70 dark:text-white/70 hover:text-secondary hover:bg-secondary/10 px-2 py-1.5 rounded transition-colors flex items-center gap-2"
                                        >
                                            {aiToolLoading ? <span className="material-symbols-outlined text-sm animate-spin">refresh</span> : <span className="material-symbols-outlined text-sm">list</span>}
                                            Auto-Generate Options
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Common: Label */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Label</label>
                                <input 
                                    type="text"
                                    value={selectedField.label}
                                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium transition-all"
                                />
                            </div>

                            {/* === STRIPE SETTINGS === */}
                            {selectedField.type === 'stripe' && (
                                <div className="flex flex-col gap-4 border-t border-black/10 dark:border-white/10 pt-4 mt-2">
                                    <h4 className="font-bold text-sm text-primary">Stripe Configuration</h4>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Publishable Key</label>
                                        <input 
                                            type="text"
                                            value={selectedField.apiKey || ''}
                                            onChange={(e) => updateField(selectedField.id, { apiKey: e.target.value })}
                                            placeholder="pk_test_..."
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm font-mono"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Payment Amount</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number"
                                                value={selectedField.price || 0}
                                                onChange={(e) => updateField(selectedField.id, { price: parseFloat(e.target.value) })}
                                                className="w-2/3 p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                                placeholder="0.00"
                                            />
                                            <input 
                                                type="text"
                                                value={selectedField.currency || 'USD'}
                                                onChange={(e) => updateField(selectedField.id, { currency: e.target.value.toUpperCase() })}
                                                className="w-1/3 p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm text-center"
                                                placeholder="USD"
                                            />
                                        </div>
                                    </div>
                                     <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Accepted Cards</label>
                                        {['visa', 'mastercard', 'amex', 'discover'].map(card => (
                                            <label key={card} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                                                <input 
                                                    type="checkbox" 
                                                    checked={(selectedField.paymentMethods || []).includes(card)}
                                                    onChange={() => togglePaymentMethod(selectedField.id, card)}
                                                    className="rounded text-primary focus:ring-primary" 
                                                />
                                                {card}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* === PAYPAL SETTINGS === */}
                            {selectedField.type === 'paypal' && (
                                <div className="flex flex-col gap-4 border-t border-black/10 dark:border-white/10 pt-4 mt-2">
                                    <h4 className="font-bold text-sm text-[#FFC439]">PayPal Configuration</h4>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Client ID</label>
                                        <input 
                                            type="text"
                                            value={selectedField.apiKey || ''}
                                            onChange={(e) => updateField(selectedField.id, { apiKey: e.target.value })}
                                            placeholder="Enter Client ID"
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm font-mono"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Environment</label>
                                        <select 
                                            value={selectedField.environment || 'sandbox'}
                                            onChange={(e) => updateField(selectedField.id, { environment: e.target.value as any })}
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                        >
                                            <option value="sandbox">Sandbox (Test)</option>
                                            <option value="live">Live (Production)</option>
                                        </select>
                                    </div>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Payment Amount</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number"
                                                value={selectedField.price || 0}
                                                onChange={(e) => updateField(selectedField.id, { price: parseFloat(e.target.value) })}
                                                className="w-2/3 p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                                placeholder="0.00"
                                            />
                                            <input 
                                                type="text"
                                                value={selectedField.currency || 'USD'}
                                                onChange={(e) => updateField(selectedField.id, { currency: e.target.value.toUpperCase() })}
                                                className="w-1/3 p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm text-center"
                                                placeholder="USD"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === PRODUCT SETTINGS === */}
                            {selectedField.type === 'product' && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-2">
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Price</label>
                                            <input 
                                                type="number"
                                                value={selectedField.price || 0}
                                                onChange={(e) => updateField(selectedField.id, { price: parseFloat(e.target.value) })}
                                                className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 w-24">
                                            <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Currency</label>
                                            <input 
                                                type="text"
                                                value={selectedField.currency || 'USD'}
                                                onChange={(e) => updateField(selectedField.id, { currency: e.target.value.toUpperCase() })}
                                                className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Description</label>
                                        <textarea
                                            value={selectedField.productDescription || ''}
                                            onChange={(e) => updateField(selectedField.id, { productDescription: e.target.value })}
                                            rows={2}
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all resize-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Image URL</label>
                                        <input 
                                            type="text"
                                            value={selectedField.productImage || ''}
                                            onChange={(e) => updateField(selectedField.id, { productImage: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                                        />
                                    </div>
                                    {/* Payment Method Selection for Product */}
                                    <div className="flex flex-col gap-2 border-t border-black/10 dark:border-white/10 pt-2">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Accepted Payment Methods</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['card', 'paypal', 'cash'].map(method => (
                                                <label key={method} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={(selectedField.paymentMethods || []).includes(method)}
                                                        onChange={() => togglePaymentMethod(selectedField.id, method)}
                                                        className="rounded text-primary focus:ring-primary" 
                                                    />
                                                    {method === 'card' ? 'Credit Card (Stripe)' : method}
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-black/50 dark:text-white/50 italic">Ensure you have Stripe or PayPal fields/integrations enabled if selected.</p>
                                    </div>
                                </div>
                            )}

                            {/* === FILE UPLOAD SETTINGS === */}
                             {selectedField.type === 'file' && (
                                <div className="flex flex-col gap-4 border-t border-black/10 dark:border-white/10 pt-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Max File Size (MB)</label>
                                        <input 
                                            type="number"
                                            value={selectedField.maxFileSizeMB || 5}
                                            onChange={(e) => updateField(selectedField.id, { maxFileSizeMB: parseInt(e.target.value) })}
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                        />
                                    </div>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Allowed Extensions</label>
                                        <input 
                                            type="text"
                                            value={selectedField.allowedFileTypes?.join(', ') || ''}
                                            onChange={(e) => updateField(selectedField.id, { allowedFileTypes: e.target.value.split(',').map(s => s.trim()) })}
                                            placeholder=".pdf, .jpg, .png"
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* === DATE/TIME SETTINGS === */}
                             {(selectedField.type === 'date' || selectedField.type === 'time') && (
                                <div className="flex flex-col gap-4 border-t border-black/10 dark:border-white/10 pt-4">
                                     <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Helper Text</label>
                                        <input 
                                            type="text"
                                            value={selectedField.helperText || ''}
                                            onChange={(e) => updateField(selectedField.id, { helperText: e.target.value })}
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Helper Text for Common Fields */}
                            {['text', 'email', 'number', 'phone', 'textarea', 'url'].includes(selectedField.type) && (
                                     <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Helper Text</label>
                                        <input 
                                            type="text"
                                            value={selectedField.helperText || ''}
                                            onChange={(e) => updateField(selectedField.id, { helperText: e.target.value })}
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                                        />
                                    </div>
                                )}

                            {/* ... (Rest of existing code for Quote, Youtube, HTML, Options, Logic, Delete) ... */}
                            {/* Options Editor */}
                            {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                                <div className="flex flex-col gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                                    <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Options</label>
                                    <div className="flex flex-col gap-2">
                                        {selectedField.options?.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-black/30 dark:text-white/30 text-sm cursor-move">drag_indicator</span>
                                                <input 
                                                    value={opt}
                                                    onChange={(e) => updateOption(selectedField.id, i, e.target.value)}
                                                    className="flex-1 p-2 rounded-md bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                                />
                                                <button onClick={() => removeOption(selectedField.id, i)} className="text-black/40 hover:text-red-500"><span className="material-symbols-outlined text-lg">close</span></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addOption(selectedField.id)} className="mt-2 flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-primary/30 text-primary text-sm font-bold hover:bg-primary/5">
                                            <span className="material-symbols-outlined text-lg">add</span> Add Option
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Logic Editor */}
                            {!['html', 'quote', 'youtube', 'countdown', 'stripe', 'paypal'].includes(selectedField.type) && (
                                <div className="flex flex-col gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                                    <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">alt_route</span> Conditional Logic
                                    </label>
                                    <div className="flex flex-col gap-3">
                                        {selectedField.logic?.map((rule, i) => (
                                            <div key={i} className="p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-primary">Rule {i + 1}</span>
                                                        <select 
                                                            value={rule.action || 'show'} 
                                                            onChange={(e) => updateLogicRule(selectedField.id, i, { action: e.target.value as any })}
                                                            className="p-1 rounded bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs font-bold uppercase"
                                                        >
                                                            <option value="show">Show</option>
                                                            <option value="hide">Hide</option>
                                                        </select>
                                                    </div>
                                                    <button onClick={() => removeLogicRule(selectedField.id, i)} className="text-black/40 hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="whitespace-nowrap">if</span>
                                                    <select 
                                                        value={rule.fieldId}
                                                        onChange={(e) => updateLogicRule(selectedField.id, i, { fieldId: e.target.value })}
                                                        className="flex-1 p-1 rounded bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs"
                                                    >
                                                        {form?.fields.filter(f => f.id !== selectedField.id).map(f => (
                                                            <option key={f.id} value={f.id}>{f.label.substring(0, 20)}...</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <select 
                                                        value={rule.condition}
                                                        onChange={(e) => updateLogicRule(selectedField.id, i, { condition: e.target.value as any })}
                                                        className="w-1/2 p-1 rounded bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs"
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
                                                        className="w-1/2 p-1 rounded bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addLogicRule(selectedField.id)} className="mt-1 text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">add</span> Add Condition
                                        </button>
                                    </div>
                                </div>
                            )}

                             <div className="mt-auto pt-6 pb-10">
                                <button onClick={() => removeField(selectedField.id)} className="w-full py-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">delete</span> Delete Field
                                </button>
                            </div>
                        </div>
                    </>
                )
            )}
         </div>
      )}

      {/* Share Modal (Existing) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1a2f4a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
                {/* ... Share Modal Content ... */}
                 <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Share Form</h3>
                    <button onClick={() => setShowShareModal(false)} className="hover:text-primary"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h4 className="font-bold text-lg">Your form is live!</h4>
                        <p className="text-sm opacity-70">Share this link with your audience to start collecting responses.</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <input 
                            readOnly 
                            value={`${window.location.origin}/#/form/${customSlug || formId}`} 
                            className="flex-1 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-mono outline-none focus:border-primary text-black dark:text-white"
                        />
                        <button 
                            onClick={handleCopyLink}
                            className="p-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors relative group"
                            title="Copy Link"
                        >
                            <span className="material-symbols-outlined">content_copy</span>
                            {copySuccess && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">Copied!</div>
                            )}
                        </button>
                    </div>
                     <div className="flex gap-6 justify-center pt-2">
                        <a href={`mailto:?subject=${encodeURIComponent(form?.title || 'Form')}&body=${encodeURIComponent('Check out this form: ' + `${window.location.origin}/#/form/${customSlug || formId}`)}`} className="flex flex-col items-center gap-1 group">
                            <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                            <span className="text-xs font-bold opacity-70">Email</span>
                        </a>
                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this form!')}&url=${encodeURIComponent(`${window.location.origin}/#/form/${customSlug || formId}`)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group">
                            <div className="size-12 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </div>
                            <span className="text-xs font-bold opacity-70">X</span>
                        </a>
                        <a href={`${window.location.origin}/#/form/${customSlug || formId}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group">
                            <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">open_in_new</span>
                            </div>
                            <span className="text-xs font-bold opacity-70">Open</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default BuilderPage;
