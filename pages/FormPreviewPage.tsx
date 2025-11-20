
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GeneratedForm, FormField } from '../types';

const FormPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const form = location.state?.formData as GeneratedForm | null;
  const formId = location.state?.formId; // Capture ID if present
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  
  // Presentation State
  const [displayFields, setDisplayFields] = useState<FormField[]>([]);
  const [progress, setProgress] = useState(0);

  // A comprehensive list of country codes
  const COUNTRY_CODES = [
    { code: "+1", name: "US/CA" },
    { code: "+44", name: "UK" },
    { code: "+91", name: "IN" },
    { code: "+61", name: "AU" },
    { code: "+86", name: "CN" }, { code: "+33", name: "FR" }, { code: "+49", name: "DE" },
    { code: "+81", name: "JP" }, { code: "+7", name: "RU" }, { code: "+55", name: "BR" },
    { code: "+39", name: "IT" }, { code: "+234", name: "NG" }, { code: "+27", name: "ZA" }
  ];

  // Initialize visibility and order
  useEffect(() => {
      if (form) {
          // Handle Shuffling
          let fieldsToRender = [...form.fields];
          if (form.shuffleQuestions) {
             fieldsToRender = fieldsToRender.sort(() => Math.random() - 0.5);
          }
          setDisplayFields(fieldsToRender);

          const initialVisibility: Record<string, boolean> = {};
          form.fields.forEach(f => initialVisibility[f.id] = true);
          setVisibleFields(initialVisibility);
      }
  }, [form]);

  // Logic Evaluation Effect and Progress Calculation
  useEffect(() => {
      if (!form) return;

      // Logic
      const newVisibility = { ...visibleFields };
      let hasChanges = false;

      form.fields.forEach(field => {
          if (field.logic && field.logic.length > 0) {
              // OR logic for visibility
              const matchedRule = field.logic.some(rule => {
                  const dependentValue = formValues[rule.fieldId];
                  if (rule.condition === 'equals') return dependentValue === rule.value;
                  if (rule.condition === 'not_equals') return dependentValue !== rule.value;
                  if (rule.condition === 'contains') return dependentValue && dependentValue.includes(rule.value);
                  return false;
              });

              // If field has logic, default to hidden unless matched.
              // Assuming logic defines "Show If".
              const shouldShow = matchedRule;

              if (newVisibility[field.id] !== shouldShow) {
                  newVisibility[field.id] = shouldShow;
                  hasChanges = true;
              }
          }
      });

      if (hasChanges) {
          setVisibleFields(newVisibility);
      }

      // Calculate Progress
      // Count how many *visible* and *required* fields are filled, vs total visible required.
      // Simplified: Count how many fields have a value vs total fields.
      const visibleFieldIds = Object.keys(newVisibility).filter(id => newVisibility[id]);
      const filledCount = visibleFieldIds.filter(id => formValues[id] && formValues[id].trim() !== "").length;
      const totalCount = visibleFieldIds.length;
      
      const newProgress = totalCount === 0 ? 0 : Math.round((filledCount / totalCount) * 100);
      setProgress(newProgress);

  }, [formValues, form]);

  const handleInputChange = (fieldId: string, value: string) => {
      setFormValues(prev => ({
          ...prev,
          [fieldId]: value
      }));
  };

  // Handle mock submission
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturn = () => {
      if (form) {
          navigate('/create', {
              state: {
                  formData: form,
                  formId: formId
              }
          });
      } else {
          navigate('/create');
      }
  };

  const handleEditResponse = () => {
      setIsSubmitted(false);
  };

  // Static fallback preview (if no form passed)
  if (!form) {
     return (
         <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark text-center p-8">
             <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                 <span className="material-symbols-outlined text-4xl">visibility_off</span>
             </div>
             <h2 className="text-2xl font-bold mb-2">No Preview Available</h2>
             <p className="text-black/60 dark:text-white/60 mb-6">Return to the editor to create or open a form.</p>
             <Link to="/create" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-600">Go to Builder</Link>
         </div>
     );
  }

  return (
    <div className="font-display antialiased bg-[#f5f5f5] dark:bg-[#0d253f] text-[#4a4a4a] dark:text-[#e0e0e0] min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex w-full items-center justify-between whitespace-nowrap border-b border-[#e5e7eb] dark:border-[#374151] bg-[#ffffff] dark:bg-[#1a2f4a] px-4 py-3 shadow-sm sm:px-6 md:px-8">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#ff9a00]">visibility</span>
          <h2 className="hidden text-lg font-bold leading-tight sm:block">Form Preview</h2>
        </div>
        <button 
            onClick={handleReturn}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#ff9a00] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Return to Editor
        </button>
      </header>
      
      {/* Progress Bar (If Enabled) */}
      {form.showProgressBar && !isSubmitted && (
          <div className="sticky top-[61px] z-10 w-full h-1.5 bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-full bg-[#ff9a00] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
          </div>
      )}

      <main className="flex flex-1 justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-8">
        <div className="flex w-full max-w-3xl flex-col">
          <div className="w-full rounded-xl border border-[#e5e7eb] dark:border-[#ff9a00]/20 bg-[#ffffff] dark:bg-[#1a2f4a] shadow-lg overflow-hidden">
            
            {/* Success State */}
            {isSubmitted ? (
                <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
                    <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                        <span className="material-symbols-outlined text-5xl">check_circle</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#0d253f] dark:text-white mb-4">Success!</h2>
                    <p className="text-lg text-black/70 dark:text-white/70 mb-8 max-w-md">
                        {form.successMessage || 'Thank you for your submission!'}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => { setIsSubmitted(false); setFormValues({}); window.scrollTo(0,0); }}
                            className="text-[#ff9a00] font-bold hover:underline"
                        >
                            Submit another response
                        </button>
                        
                        {form.allowResponseEditing && (
                            <button 
                                onClick={handleEditResponse}
                                className="text-black/60 dark:text-white/60 text-sm font-medium hover:text-[#ff9a00] flex items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-base">edit</span>
                                Edit your response
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-3 border-b-4 border-[#ff9a00] p-6 bg-[#ffffff] dark:bg-[#1a2f4a]">
                        <h1 className="font-display text-4xl font-black tracking-tight text-[#0d253f] dark:text-white">{form.title}</h1>
                        <p className="font-display text-base font-normal leading-normal opacity-80">{form.description}</p>
                        {form.collectEmails && (
                             <div className="mt-2 flex items-center gap-2 text-sm text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5 p-2 rounded w-fit">
                                <span className="material-symbols-outlined text-base">info</span>
                                <span>Email addresses are being collected.</span>
                             </div>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-8 p-6">
                    {displayFields.map((field) => {
                        if (!visibleFields[field.id]) return null;
                        
                        return (
                            <div key={field.id} className="flex flex-col gap-2 animate-fade-in">
                                <label className="text-base font-medium">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                
                                {field.type === 'textarea' ? (
                                    <textarea 
                                        className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all" 
                                        placeholder={field.placeholder}
                                        rows={4}
                                        value={formValues[field.id] || ''}
                                        required={field.required}
                                        minLength={field.minLength}
                                        maxLength={field.maxLength}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    />
                                ) : field.type === 'select' ? (
                                    <select 
                                        className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all"
                                        required={field.required}
                                        value={formValues[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    >
                                        <option value="">Select an option...</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : field.type === 'radio' ? (
                                    <div className="flex flex-col gap-3">
                                        {field.options?.map((opt) => (
                                            <label key={opt} className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all hover:border-[#ff9a00] dark:hover:border-[#ff9a00] ${formValues[field.id] === opt ? 'border-[#ff9a00] bg-[#ff9a00]/5' : 'border-[#e5e7eb] dark:border-[#374151]'}`}>
                                                <input 
                                                    type="radio" 
                                                    name={field.id}
                                                    required={field.required} 
                                                    checked={formValues[field.id] === opt}
                                                    className="h-5 w-5 rounded-full border-2 border-[#374151] text-[#ff9a00] focus:ring-[#ff9a00]" 
                                                    onChange={() => handleInputChange(field.id, opt)}
                                                />
                                                <span className="text-sm font-medium">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : field.type === 'checkbox' ? (
                                    <div className="flex flex-col gap-3">
                                        {field.options?.map((opt) => (
                                            <label key={opt} className="flex cursor-pointer items-center gap-4 rounded-lg border border-[#e5e7eb] dark:border-[#374151] p-4 transition-all hover:border-[#ff9a00] dark:hover:border-[#ff9a00]">
                                                <input 
                                                    type="checkbox"
                                                    name={field.id}
                                                    className="h-5 w-5 rounded border-2 border-[#374151] text-[#ff9a00] focus:ring-[#ff9a00]"
                                                    onChange={(e) => {
                                                        // Complex handling for checkbox array values
                                                        const currentVal = formValues[field.id] || '';
                                                        // Just storing selected option for logic demo in single value field for now
                                                        handleInputChange(field.id, opt); 
                                                    }}
                                                />
                                                <span className="text-sm font-medium">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : field.type === 'phone' ? (
                                    <div className="flex gap-2">
                                        <select className="w-28 rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all">
                                            {COUNTRY_CODES.slice(0, 10).map((c, i) => (
                                                <option key={i} value={c.code}>{c.name} {c.code}</option>
                                            ))}
                                        </select>
                                        <input 
                                            type="tel" 
                                            className="flex-1 rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all" 
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formValues[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    </div>
                                ) : (field.type === 'file' || field.type === 'image') ? (
                                    <div className="relative w-full">
                                        <input 
                                            type="file" 
                                            accept={field.type === 'image' ? "image/*" : "*"}
                                            required={field.required}
                                            className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff9a00]/10 file:text-[#ff9a00] hover:file:bg-[#ff9a00]/20"
                                        />
                                    </div>
                                ) : (
                                    <input 
                                        type={field.type} 
                                        className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all" 
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        value={formValues[field.id] || ''}
                                        minLength={field.minLength}
                                        maxLength={field.maxLength}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    />
                                )}

                                {field.helperText && (
                                    <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] italic mt-1">{field.helperText}</p>
                                )}
                            </div>
                        );
                    })}

                    <div className="mt-4 flex flex-col items-center gap-4 border-t border-[#e5e7eb] dark:border-[#374151] pt-6 sm:flex-row sm:justify-between">
                        <button type="submit" className="w-full rounded-lg bg-[#0d253f] dark:bg-[#ff9a00] px-6 py-3 text-base font-bold text-white sm:w-auto hover:opacity-90 shadow-lg shadow-[#ff9a00]/20 transition-transform active:scale-95">
                            {form.submitButtonText || 'Submit'}
                        </button>
                        <p className="text-xs text-[#6b7280] dark:text-white/90">This form is in preview mode.</p>
                    </div>
                    </form>
                </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FormPreviewPage;
