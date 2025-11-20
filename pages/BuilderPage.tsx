
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateFormSchema } from '../services/geminiService';
import { FormField, GeneratedForm, GenerationStatus, LogicRule } from '../types';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: 'short_text' },
  { type: 'textarea', label: 'Long Text', icon: 'notes' },
  { type: 'email', label: 'Email', icon: 'mail' },
  { type: 'phone', label: 'Phone', icon: 'call' },
  { type: 'number', label: 'Number', icon: '123' },
  { type: 'select', label: 'Dropdown', icon: 'arrow_drop_down_circle' },
  { type: 'radio', label: 'Single Choice', icon: 'radio_button_checked' },
  { type: 'checkbox', label: 'Checkboxes', icon: 'check_box' },
  { type: 'file', label: 'File Upload', icon: 'upload_file' },
  { type: 'image', label: 'Image Upload', icon: 'image' },
];

const BuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'ai' | 'tools'>('ai');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  
  const [form, setForm] = useState<GeneratedForm | null>(null);
  const [formId, setFormId] = useState<string | null>(null); // Track Firestore Doc ID
  
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Selection state: either a field ID or 'form-settings'
  const [selectedId, setSelectedId] = useState<string | 'form-settings' | null>(null);
  
  const [draftSaved, setDraftSaved] = useState(false);

  // Load form data from navigation state (Templates, Editing Drafts, Returning from Settings/Preview)
  useEffect(() => {
      if (location.state) {
          if (location.state.formData) {
              // Returned from Settings Page or Submissions Page or Preview Page
              setForm(location.state.formData);
              if (location.state.formId) {
                setFormId(location.state.formId);
              }
              // If returning from preview, we don't force a tab change, but ensure tools are visible if form exists
              if(location.state.formData.fields.length > 0) {
                  setActiveTab('tools');
              }
          } else if (location.state.template) {
              // Starting from a template
              const template = location.state.template as GeneratedForm;
              const freshFields = template.fields.map(f => ({
                  ...f,
                  id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              }));
              // Initialize missing setting fields with defaults
              setForm({ 
                ...template,
                fields: freshFields,
                collectEmails: template.collectEmails || false,
                limitOneResponse: template.limitOneResponse || false,
                restrictToOrg: template.restrictToOrg || false,
                allowResponseEditing: template.allowResponseEditing || false,
                showProgressBar: template.showProgressBar || false,
                shuffleQuestions: template.shuffleQuestions || false,
                collaborators: template.collaborators || []
              });
              setActiveTab('tools');
          } else if (location.state.title) { // Fallback for direct passing of form object
               setForm(location.state as GeneratedForm);
               setActiveTab('tools');
          }
      }
  }, [location.state]);

  const selectedField = form?.fields.find(f => f.id === selectedId) || null;
  const isFormSettingsSelected = selectedId === 'form-settings';

  // --- AI Handlers ---
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus(GenerationStatus.LOADING);
    setForm(null);
    setFormId(null); // Reset ID for new generation
    setTitleError(false);
    setSelectedId(null);
    try {
      const generatedForm = await generateFormSchema(topic);
      // Ensure defaults are set
      setForm({
        ...generatedForm,
        collectEmails: generatedForm.collectEmails || false,
        limitOneResponse: generatedForm.limitOneResponse || false,
        restrictToOrg: generatedForm.restrictToOrg || false,
        allowResponseEditing: generatedForm.allowResponseEditing || false,
        showProgressBar: generatedForm.showProgressBar || false,
        shuffleQuestions: generatedForm.shuffleQuestions || false,
        collaborators: generatedForm.collaborators || []
      });
      setStatus(GenerationStatus.SUCCESS);
      setActiveTab('tools');
    } catch (error) {
      setStatus(GenerationStatus.ERROR);
    }
  };

  // --- Manual Builder Handlers ---
  const initFormIfNeeded = () => {
    if (!form) {
      const newForm = {
        title: "Untitled Form",
        description: "Add a description to your form.",
        fields: [],
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
        // Default Settings
        collectEmails: false,
        limitOneResponse: false,
        restrictToOrg: false,
        allowResponseEditing: false,
        showProgressBar: false,
        shuffleQuestions: false,
        collaborators: []
      };
      setForm(newForm);
      return newForm;
    }
    return form;
  };

  const addField = (type: string) => {
    const currentForm = initFormIfNeeded();
    const newId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newField: FormField = {
      id: newId,
      label: `New ${type === 'image' ? 'Image' : type === 'file' ? 'File' : type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type as any,
      placeholder: type === 'phone' ? '123-456-7890' : 'Enter your answer',
      required: false,
      options: (type === 'select' || type === 'radio' || type === 'checkbox') ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    };

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
      
      // Insert after original
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

  // --- Logic Handlers ---
  const addLogicRule = (fieldId: string) => {
      const field = form?.fields.find(f => f.id === fieldId);
      if(!field) return;
      const newRule: LogicRule = {
          fieldId: form?.fields[0].id || '', // Default to first field
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


  // --- Drag & Drop Handlers ---
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

  const handleOpenPreview = () => {
      if (form) {
          if (!form.title.trim()) {
              setTitleError(true);
              return;
          }
          // Pass the entire form object and ID in state
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

  // Unified Save Handler (Draft or Publish)
  const saveToFirestore = async (status: 'draft' | 'published') => {
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
          // 1. Prepare basic data object with all settings included
          const dataToSanitize = {
              title: form.title,
              description: form.description || '',
              submitButtonText: form.submitButtonText || 'Submit',
              successMessage: form.successMessage || 'Thank you for your submission!',
              
              // Pass new settings fields - Default to false if undefined
              collectEmails: !!form.collectEmails,
              limitOneResponse: !!form.limitOneResponse,
              restrictToOrg: !!form.restrictToOrg,
              allowResponseEditing: !!form.allowResponseEditing,
              showProgressBar: !!form.showProgressBar,
              shuffleQuestions: !!form.shuffleQuestions,
              collaborators: form.collaborators || [],
              
              fields: form.fields,
              userId: currentUser.uid,
              status: status,
              // Initialize stats only if new, otherwise preserve or update elsewhere
              stats: form.stats || {
                  views: 0,
                  responses: 0,
                  completionRate: 0,
                  avgTime: '0m 0s'
              }
          };

          // 2. Deep clone and strip undefined values using JSON serialization
          const cleanPayload = JSON.parse(JSON.stringify(dataToSanitize));

          // 3. Add timestamps (serverTimestamp cannot be JSON stringified)
          if (formId) {
              // Update existing document
              const docRef = doc(db, "forms", formId);
              
              const updatePayload = { ...cleanPayload };
              delete updatePayload.createdAt; // Don't update createdAt on edit
              updatePayload.updatedAt = serverTimestamp();

              await updateDoc(docRef, updatePayload);
              console.log("Document updated with ID: ", formId);
          } else {
              // Create new document
              const createPayload = {
                  ...cleanPayload,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
              };
              const docRef = await addDoc(collection(db, "forms"), createPayload);
              setFormId(docRef.id);
              console.log("Document created with ID: ", docRef.id);
          }

          if (status === 'draft') {
              setDraftSaved(true);
              setTimeout(() => setDraftSaved(false), 2000);
          } else {
              navigate('/submissions');
          }

      } catch (e: any) {
          console.error("Error saving form: ", e);
          alert(`Error saving form: ${e.message}`);
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">
      
      {/* Left Sidebar (Tools) */}
      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Regal AI
          </button>
          <button 
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'tools' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-lg">build</span>
            Tools
          </button>
        </div>

        <div className="flex-1 bg-white dark:bg-background-dark p-5 rounded-xl border border-black/10 dark:border-white/10 shadow-sm overflow-y-auto">
          
          {/* AI Content */}
          {activeTab === 'ai' && (
            <div className="flex flex-col gap-6 h-full">
              <div>
                <h2 className="text-xl font-bold mb-2">Generate with AI</h2>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Describe your form and let Gemini build it for you.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-primary">Prompt</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Customer Satisfaction Survey with Net Promoter Score..."
                  className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-32 text-sm"
                />
                <button
                  onClick={handleGenerate}
                  disabled={status === GenerationStatus.LOADING || !topic.trim()}
                  className="w-full py-3 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white dark:text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
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
              
              <div className="mt-auto">
                <p className="text-xs text-black/50 dark:text-white/50 mb-3 uppercase font-bold tracking-wider">Quick Prompts</p>
                <div className="flex flex-col gap-2">
                    {['Job Application', 'Event RSVP', 'Feedback Survey'].map(ex => (
                        <button key={ex} onClick={() => setTopic(ex)} className="text-left px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium">
                            {ex}
                        </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Tools Content */}
          {activeTab === 'tools' && (
            <div className="flex flex-col gap-4 h-full">
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

      {/* Middle Panel - Canvas */}
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
                        onClick={() => saveToFirestore('published')}
                        disabled={!form || isSaving}
                        className="text-xs px-4 py-2 bg-primary text-white hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg font-bold flex items-center gap-1 transition-colors shadow-sm"
                    >
                        {isSaving ? (
                          <>
                             <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                             Saving...
                          </>
                        ) : (
                          <>
                             <span className="material-symbols-outlined text-sm">save</span>
                             {formId ? "Update & Publish" : "Publish Form"}
                          </>
                        )}
                    </button>
                </div>
            </div>

            {/* Drop Zone Area */}
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
                        <p className="text-sm mt-2 max-w-xs">Generate a form with AI, use a template, or drag fields from the toolbar.</p>
                    </div>
                )}

                {status === GenerationStatus.LOADING && (
                    <div className="h-full flex flex-col items-center justify-center">
                         <div className="relative size-16">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                         </div>
                         <p className="mt-6 text-lg font-medium animate-pulse">Constructing your form...</p>
                    </div>
                )}

                {form && (
                    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
                        {/* Form Header Editable */}
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
                            {isFormSettingsSelected && <div className="absolute top-2 right-2 bg-primary text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Editing Settings</div>}
                        </div>

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
                                    
                                    {/* Actions Overlay (On Hover or Selected) */}
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
                                            {/* Clickable Required Toggle on Canvas */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateField(field.id, { required: !field.required });
                                                }}
                                                className={`pointer-events-auto text-xs font-bold px-2 py-0.5 rounded transition-colors border ${field.required ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-black/30 dark:text-white/30 bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10'}`}
                                                title="Toggle Required"
                                            >
                                                {field.required ? '* Req' : 'Opt'}
                                            </button>
                                            <span className="font-semibold text-sm flex-1 truncate">{field.label}</span>
                                            {field.logic && field.logic.length > 0 && (
                                                <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20 font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">alt_route</span>
                                                    Logic
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Field Preview */}
                                        {field.type === 'textarea' ? (
                                            <div className="w-full p-3 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 h-20 text-sm text-black/40 dark:text-white/40">
                                                {field.placeholder}
                                            </div>
                                        ) : field.type === 'select' ? (
                                            <div className="w-full p-3 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 text-sm flex justify-between items-center text-black/40 dark:text-white/40">
                                                <span>Choose an option</span>
                                                <span className="material-symbols-outlined text-lg">expand_more</span>
                                            </div>
                                        ) : (field.type === 'radio' || field.type === 'checkbox') ? (
                                            <div className="flex flex-col gap-2">
                                                {field.options?.map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                                                         <div className={`size-4 border border-black/20 dark:border-white/20 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`}></div>
                                                         <span>{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : field.type === 'phone' ? (
                                            <div className="flex gap-2">
                                                <div className="w-16 p-2 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-base opacity-50">flag</span>
                                                </div>
                                                <div className="flex-1 p-2 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 text-sm text-black/40 dark:text-white/40">
                                                    {field.placeholder}
                                                </div>
                                            </div>
                                        ) : (field.type === 'file' || field.type === 'image') ? (
                                            <div className="w-full p-4 rounded-md bg-background-light dark:bg-black/20 border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-1 text-black/40 dark:text-white/40">
                                                <span className="material-symbols-outlined text-2xl">{field.type === 'image' ? 'image' : 'upload_file'}</span>
                                                <span className="text-xs font-medium">{field.type === 'image' ? 'Image Upload' : 'File Upload'}</span>
                                            </div>
                                        ) : (
                                            <div className="w-full p-3 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 text-sm text-black/40 dark:text-white/40">
                                                {field.placeholder}
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

      {/* Right Panel - Settings (Conditional) */}
      {selectedId && (
         <div className="w-full lg:w-80 flex flex-col shrink-0 bg-white dark:bg-background-dark rounded-xl border border-black/10 dark:border-white/10 shadow-lg overflow-hidden animate-fade-in h-full">
            
            {/* Form Settings Panel */}
            {isFormSettingsSelected ? (
                <>
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
                            <p className="text-xs text-black/40 dark:text-white/40">Displayed after a user submits the form.</p>
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
                /* Field Settings Panel */
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
                            {/* Field Info */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-2xl">
                                    {FIELD_TYPES.find(t => t.type === selectedField.type)?.icon || 'short_text'}
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase text-primary/70">Type</p>
                                    <p className="font-bold text-primary capitalize">{selectedField.type}</p>
                                </div>
                            </div>

                            {/* Common Settings */}
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Label</label>
                                    <input 
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium transition-all"
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Helper Text</label>
                                    <input 
                                        type="text"
                                        value={selectedField.helperText || ''}
                                        onChange={(e) => updateField(selectedField.id, { helperText: e.target.value })}
                                        placeholder="e.g., Only PDF files allowed"
                                        className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                                    />
                                </div>

                                {['text', 'email', 'number', 'phone', 'textarea'].includes(selectedField.type) && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Placeholder</label>
                                        <input 
                                            type="text"
                                            value={selectedField.placeholder || ''}
                                            onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                            className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                                        />
                                    </div>
                                )}

                                {['text', 'textarea'].includes(selectedField.type) && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Min Length</label>
                                            <input 
                                                type="number"
                                                value={selectedField.minLength || ''}
                                                onChange={(e) => updateField(selectedField.id, { minLength: parseInt(e.target.value) || undefined })}
                                                className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Max Length</label>
                                            <input 
                                                type="number"
                                                value={selectedField.maxLength || ''}
                                                onChange={(e) => updateField(selectedField.id, { maxLength: parseInt(e.target.value) || undefined })}
                                                className="w-full p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10">
                                    <span className="text-sm font-bold">Required Field</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedField.required} 
                                            onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Options Editor */}
                            {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                                <div className="flex flex-col gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                                    <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50">Options</label>
                                    <div className="flex flex-col gap-2">
                                        {selectedField.options?.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2 animate-fade-in">
                                                <span className="material-symbols-outlined text-black/30 dark:text-white/30 text-sm cursor-move">drag_indicator</span>
                                                <input 
                                                    value={opt}
                                                    onChange={(e) => updateOption(selectedField.id, i, e.target.value)}
                                                    className="flex-1 p-2 rounded-md bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary outline-none text-sm"
                                                />
                                                <button 
                                                    onClick={() => removeOption(selectedField.id, i)}
                                                    className="text-black/40 dark:text-white/40 hover:text-red-500 transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => addOption(selectedField.id)}
                                            className="mt-2 flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">add</span>
                                            Add Option
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Logic Editor */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                                <label className="text-xs font-bold uppercase text-black/50 dark:text-white/50 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">alt_route</span> Conditional Logic
                                </label>
                                <div className="flex flex-col gap-3">
                                    {selectedField.logic?.map((rule, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-primary">Rule {i + 1}</span>
                                                <button onClick={() => removeLogicRule(selectedField.id, i)} className="text-black/40 hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="whitespace-nowrap">Show if</span>
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
                                    <button 
                                        onClick={() => addLogicRule(selectedField.id)}
                                        className="mt-1 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span> Add Condition
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto pt-6">
                                <button 
                                    onClick={() => removeField(selectedField.id)}
                                    className="w-full py-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                    Delete Field
                                </button>
                            </div>
                        </div>
                    </>
                )
            )}
         </div>
      )}

    </div>
  );
};

export default BuilderPage;