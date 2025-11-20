
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { GeneratedForm, FormField } from '../types';

const FormPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const [form, setForm] = useState<GeneratedForm | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [formOwnerId, setFormOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormClosed, setIsFormClosed] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [displayFields, setDisplayFields] = useState<FormField[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const COUNTRY_CODES = [
    { code: "+1", name: "US/CA" }, { code: "+44", name: "UK" }, { code: "+91", name: "IN" },
    { code: "+61", name: "AU" }, { code: "+86", name: "CN" }, { code: "+33", name: "FR" },
    { code: "+49", name: "DE" }, { code: "+81", name: "JP" }, { code: "+7", name: "RU" },
    { code: "+55", name: "BR" }, { code: "+39", name: "IT" }, { code: "+234", name: "NG" },
    { code: "+27", name: "ZA" }, { code: "+34", name: "ES" }, { code: "+31", name: "NL" },
    { code: "+46", name: "SE" }, { code: "+41", name: "CH" }, { code: "+65", name: "SG" },
    { code: "+82", name: "KR" }, { code: "+90", name: "TR" }, { code: "+52", name: "MX" },
    { code: "+971", name: "AE" }, { code: "+966", name: "SA" }, { code: "+20", name: "EG" },
    { code: "+254", name: "KE" }, { code: "+233", name: "GH" }
  ];

  useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
  }, []);

  const getCountdownTime = (targetDateStr?: string) => {
      if (!targetDateStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      const target = new Date(targetDateStr).getTime();
      const now = currentTime.getTime();
      const diff = target - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
  };

  const getYoutubeEmbedUrl = (url?: string) => {
      if (!url) return '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
  };

  // Fetch Form Logic
  useEffect(() => {
      const fetchForm = async () => {
          if (!slug) return;
          setLoading(true);
          try {
              // Try to find by slug first
              const q = query(collection(db, 'forms'), where('slug', '==', slug));
              const slugSnapshot = await getDocs(q);

              let fetchedForm: any = null;
              let fetchedId = null;

              if (!slugSnapshot.empty) {
                  fetchedForm = slugSnapshot.docs[0].data();
                  fetchedId = slugSnapshot.docs[0].id;
              } else {
                  // Fallback: Try ID
                  const docRef = doc(db, 'forms', slug);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                      fetchedForm = docSnap.data();
                      fetchedId = docSnap.id;
                  }
              }

              if (fetchedForm && fetchedId) {
                  if (fetchedForm.status === 'completed') {
                      setIsFormClosed(true);
                      setForm(fetchedForm); // Still set form to show title if needed
                  } else if (fetchedForm.status === 'published') {
                      setForm(fetchedForm as GeneratedForm);
                      setFormId(fetchedId);
                      
                      if (fetchedForm.userId) {
                          setFormOwnerId(fetchedForm.userId);
                      }

                      // Increment View Count
                      await updateDoc(doc(db, 'forms', fetchedId), {
                          'stats.views': increment(1)
                      });

                      // Setup Display
                      let fieldsToRender = [...fetchedForm.fields];
                      if (fetchedForm.shuffleQuestions) {
                          fieldsToRender = fieldsToRender.sort(() => Math.random() - 0.5);
                      }
                      setDisplayFields(fieldsToRender);
                      const initialVisibility: Record<string, boolean> = {};
                      fetchedForm.fields.forEach((f: FormField) => initialVisibility[f.id] = true);
                      setVisibleFields(initialVisibility);
                  } else {
                       // Draft or other status
                       setError('Form not found or not published.');
                  }
              } else {
                  setError('Form not found.');
              }
          } catch (err: any) {
              console.error(err);
              setError('Error loading form.');
          } finally {
              setLoading(false);
          }
      };
      fetchForm();
  }, [slug]);

  // Logic Engine
  useEffect(() => {
      if (!form || isFormClosed) return;
      const newVisibility: Record<string, boolean> = {};
      form.fields.forEach(field => {
          let shouldBeVisible = true;
          const rules = field.logic || [];
          if (rules.length > 0) {
              const hasShowRules = rules.some(r => !r.action || r.action === 'show');
              if (hasShowRules) {
                  shouldBeVisible = false; 
                  const showMatch = rules.some(rule => {
                      if (rule.action && rule.action !== 'show') return false; 
                      const dependentValue = formValues[rule.fieldId];
                      if (rule.condition === 'equals') return dependentValue === rule.value;
                      if (rule.condition === 'not_equals') return dependentValue !== rule.value;
                      if (rule.condition === 'contains') return dependentValue && dependentValue.includes(rule.value);
                      return false;
                  });
                  if (showMatch) shouldBeVisible = true;
              } else {
                  shouldBeVisible = true; 
                  const hideMatch = rules.some(rule => {
                      if (rule.action !== 'hide') return false;
                      const dependentValue = formValues[rule.fieldId];
                      if (rule.condition === 'equals') return dependentValue === rule.value;
                      if (rule.condition === 'not_equals') return dependentValue !== rule.value;
                      if (rule.condition === 'contains') return dependentValue && dependentValue.includes(rule.value);
                      return false;
                  });
                  if (hideMatch) shouldBeVisible = false;
              }
          }
          newVisibility[field.id] = shouldBeVisible;
      });
      setVisibleFields(newVisibility);

      const visibleInputFields = Object.keys(newVisibility).filter(id => {
          const field = form.fields.find(f => f.id === id);
          return newVisibility[id] && field && !['html', 'quote', 'youtube', 'countdown', 'stripe', 'paypal'].includes(field.type);
      });
      const filledCount = visibleInputFields.filter(id => formValues[id] && formValues[id].trim() !== "").length;
      const totalCount = visibleInputFields.length;
      const newProgress = totalCount === 0 ? 0 : Math.round((filledCount / totalCount) * 100);
      setProgress(newProgress);

  }, [formValues, form, isFormClosed]);

  const handleInputChange = (fieldId: string, value: string) => {
      setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formId || !form) return;
      
      setLoading(true);
      try {
          const userLocale = navigator.language || 'en-US';
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

          // Log specific submission
          await addDoc(collection(db, 'forms', formId, 'submissions'), {
              responses: formValues,
              submittedAt: serverTimestamp(),
              meta: { locale: userLocale, timeZone: userTimeZone }
          });

          // Log global activity for admin dashboard
          await addDoc(collection(db, 'activity_logs'), {
              type: 'submission',
              formId: formId,
              formTitle: form.title,
              submittedAt: serverTimestamp(),
              locale: userLocale,
              timeZone: userTimeZone
          });
          
          await updateDoc(doc(db, 'forms', formId), {
              'stats.responses': increment(1)
          });

          // Trigger Integrations (Zapier)
          if (formOwnerId) {
              const triggerIntegrations = async () => {
                  try {
                      const userIntegrationsRef = doc(db, 'user_integrations', formOwnerId);
                      const userIntegrationsSnap = await getDoc(userIntegrationsRef);
                      
                      if (userIntegrationsSnap.exists()) {
                          const integrations = userIntegrationsSnap.data();
                          
                          // Zapier
                          if (integrations.zapier?.enabled && integrations.zapier.settings?.webhookUrl) {
                              fetch(integrations.zapier.settings.webhookUrl, {
                                  method: 'POST',
                                  body: JSON.stringify({
                                      formId,
                                      formTitle: form.title,
                                      submittedAt: new Date().toISOString(),
                                      data: formValues
                                  }),
                                  mode: 'no-cors', 
                                  headers: {
                                      'Content-Type': 'application/json' 
                                  }
                              }).catch(err => console.warn("Zapier trigger failed", err));
                          }
                      }
                  } catch (e) {
                      console.error("Error triggering integrations", e);
                  }
              };
              triggerIntegrations();
          }

          setIsSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
          console.error("Submission error", err);
          alert("Failed to submit form. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
              <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-black/60 dark:text-white/60 animate-pulse">Loading form...</p>
              </div>
          </div>
      );
  }

  // Form Closed State
  if (isFormClosed) {
       return (
          <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
              <div className="text-center max-w-md bg-white dark:bg-white/5 p-10 rounded-xl border border-black/10 dark:border-white/10 shadow-lg">
                  <div className="size-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-white/40">lock</span>
                  </div>
                  <h2 className="text-2xl font-black mb-2">{form?.title || 'Form'}</h2>
                  <div className="h-1 w-12 bg-primary mx-auto mb-4 rounded-full"></div>
                  <p className="text-black/60 dark:text-white/60 mb-6 text-lg">
                      This form is no longer accepting responses.
                  </p>
                  <p className="text-sm text-black/40 dark:text-white/40">
                      Please contact the form owner if you think this is a mistake.
                  </p>
              </div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
              <div className="text-center max-w-md bg-white dark:bg-white/5 p-8 rounded-xl border border-black/10 dark:border-white/10 shadow-lg">
                  <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
                  <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                  <p className="text-black/60 dark:text-white/60 mb-6">{error}</p>
                  <a href="/" className="text-primary font-bold hover:underline">Go to Regal Forms Home</a>
              </div>
          </div>
      );
  }

  if (!form) return null;

  return (
    <div className="font-display antialiased bg-[#f5f5f5] dark:bg-[#0d253f] text-[#4a4a4a] dark:text-[#e0e0e0] min-h-screen flex flex-col">
      {form.showProgressBar && !isSubmitted && (
          <div className="sticky top-0 z-50 w-full h-1.5 bg-gray-200 dark:bg-gray-700">
              <div className="h-full bg-[#ff9a00] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
      )}

      <main className="flex flex-1 justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-8">
        <div className="flex w-full max-w-3xl flex-col">
          <div className="w-full rounded-xl border border-[#e5e7eb] dark:border-[#ff9a00]/20 bg-[#ffffff] dark:bg-[#1a2f4a] shadow-lg overflow-hidden">
            {isSubmitted ? (
                <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
                    <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                        <span className="material-symbols-outlined text-5xl">check_circle</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#0d253f] dark:text-white mb-4">Success!</h2>
                    <p className="text-lg text-black/70 dark:text-white/70 mb-8 max-w-md">{form.successMessage || 'Thank you for your submission!'}</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => { setIsSubmitted(false); setFormValues({}); window.scrollTo(0,0); }} className="text-[#ff9a00] font-bold hover:underline">Submit another response</button>
                        {form.allowResponseEditing && (
                            <button onClick={() => setIsSubmitted(false)} className="text-black/60 dark:text-white/60 text-sm font-medium hover:text-[#ff9a00] flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-base">edit</span> Edit your response
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-3 border-b-4 border-[#ff9a00] p-6 bg-[#ffffff] dark:bg-[#1a2f4a]">
                        <h1 className="font-display text-4xl font-black tracking-tight text-[#0d253f] dark:text-white">{form.title}</h1>
                        <p className="font-display text-base font-normal leading-normal opacity-80 whitespace-pre-wrap">{form.description}</p>
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
                        
                        if (field.type === 'html') {
                            return (
                                <div key={field.id} className="animate-fade-in prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: field.content || '' }} />
                            );
                        }

                        if (field.type === 'quote') {
                            return (
                                <div key={field.id} className="animate-fade-in pl-6 border-l-4 border-[#ff9a00] py-2">
                                    <p className="text-xl italic font-serif text-[#0d253f] dark:text-white">"{field.content}"</p>
                                    {field.author && <p className="mt-2 text-sm font-bold uppercase tracking-wider opacity-60">— {field.author}</p>}
                                </div>
                            );
                        }

                        if (field.type === 'product') {
                             const isSelected = formValues[field.id] === 'selected';
                             return (
                                 <div key={field.id} 
                                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer animate-fade-in group relative overflow-hidden ${isSelected ? 'border-[#ff9a00] bg-[#ff9a00]/5' : 'border-[#e5e7eb] dark:border-[#374151] hover:border-[#ff9a00]/50'}`}
                                      onClick={() => handleInputChange(field.id, isSelected ? '' : 'selected')}
                                 >
                                     {isSelected && (
                                         <div className="absolute top-0 right-0 bg-[#ff9a00] text-white px-3 py-1 rounded-bl-lg font-bold text-xs flex items-center gap-1 z-10">
                                             <span className="material-symbols-outlined text-sm">check</span> Selected
                                         </div>
                                     )}
                                     {field.productImage && (
                                         <div className="sm:w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                                             <img src={field.productImage} alt={field.label} className="w-full h-full object-cover" />
                                         </div>
                                     )}
                                     <div className="flex flex-col justify-between flex-1 py-1">
                                         <div>
                                             <h3 className="font-bold text-lg">{field.label}</h3>
                                             <p className="text-sm text-black/60 dark:text-white/60 mt-1 leading-relaxed">{field.productDescription}</p>
                                         </div>
                                         
                                         {/* Payment Methods Icons */}
                                         {field.paymentMethods && field.paymentMethods.length > 0 && (
                                             <div className="flex gap-2 mt-2">
                                                  {field.paymentMethods.includes('card') && <span className="material-symbols-outlined text-sm text-black/50 dark:text-white/50" title="Credit Card">credit_card</span>}
                                                  {field.paymentMethods.includes('paypal') && <span className="material-symbols-outlined text-sm text-black/50 dark:text-white/50" title="PayPal">account_balance_wallet</span>}
                                                  {field.paymentMethods.includes('cash') && <span className="material-symbols-outlined text-sm text-black/50 dark:text-white/50" title="Cash">payments</span>}
                                             </div>
                                         )}

                                         <div className="mt-4 flex items-center justify-between">
                                             <div className="text-xl font-black text-[#0d253f] dark:text-white">
                                                {field.price} <span className="text-sm font-medium text-black/50 dark:text-white/50">{field.currency || 'USD'}</span>
                                             </div>
                                             <button type="button" className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isSelected ? 'bg-[#ff9a00]/20 text-[#ff9a00]' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'}`}>
                                                 {isSelected ? 'Remove' : 'Select'}
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                             )
                        }

                        if (field.type === 'youtube') {
                             const embedUrl = getYoutubeEmbedUrl(field.videoUrl);
                             return (
                                 <div key={field.id} className="animate-fade-in w-full aspect-video rounded-lg overflow-hidden shadow-sm bg-black">
                                    {embedUrl ? (
                                        <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube Video"></iframe>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/50">Invalid Video URL</div>
                                    )}
                                 </div>
                             );
                        }

                        if (field.type === 'countdown') {
                            const time = getCountdownTime(field.targetDate);
                            return (
                                <div key={field.id} className="animate-fade-in p-6 rounded-xl bg-[#0d253f] text-white shadow-lg flex flex-col items-center gap-4">
                                    {field.label && <h3 className="font-bold uppercase tracking-widest opacity-80">{field.label}</h3>}
                                    <div className="flex gap-4 sm:gap-8">
                                        {[['Days', time.days], ['Hours', time.hours], ['Minutes', time.minutes], ['Seconds', time.seconds]].map(([label, val]) => (
                                            <div key={label as string} className="flex flex-col items-center">
                                                <span className="text-3xl sm:text-5xl font-black tabular-nums">{String(val).padStart(2, '0')}</span>
                                                <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-60">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        // Payment Fields (Updated Visuals)
                        if (field.type === 'stripe') {
                             return (
                                 <div key={field.id} className="animate-fade-in">
                                     <label className="text-base font-medium mb-2 block">{field.label}</label>
                                     <div className="p-4 rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f]">
                                         <div className="flex gap-2 mb-3">
                                            {/* Dynamic Card Icons based on Settings */}
                                            {(!field.paymentMethods || field.paymentMethods.length === 0 || field.paymentMethods.includes('visa')) && (
                                                <div className="h-8 w-12 bg-white/50 rounded flex items-center justify-center text-[10px] font-bold tracking-tighter text-blue-800">VISA</div>
                                            )}
                                            {(!field.paymentMethods || field.paymentMethods.length === 0 || field.paymentMethods.includes('mastercard')) && (
                                                <div className="h-8 w-12 bg-white/50 rounded flex items-center justify-center text-[10px] font-bold tracking-tighter text-red-600">MC</div>
                                            )}
                                            {(field.paymentMethods?.includes('amex')) && (
                                                <div className="h-8 w-12 bg-white/50 rounded flex items-center justify-center text-[10px] font-bold tracking-tighter text-blue-500">AMEX</div>
                                            )}
                                         </div>
                                         <div className="grid gap-3">
                                             <input disabled type="text" placeholder="Card number" className="w-full p-3 rounded border dark:border-white/10 bg-white dark:bg-black/20" />
                                             <div className="flex gap-3">
                                                 <input disabled type="text" placeholder="MM / YY" className="w-1/2 p-3 rounded border dark:border-white/10 bg-white dark:bg-black/20" />
                                                 <input disabled type="text" placeholder="CVC" className="w-1/2 p-3 rounded border dark:border-white/10 bg-white dark:bg-black/20" />
                                             </div>
                                         </div>
                                         <button disabled type="button" className="w-full mt-3 py-3 bg-[#635BFF] text-white font-bold rounded-lg opacity-90 flex items-center justify-center gap-2">
                                             Pay Now {field.price ? `(${field.price} ${field.currency})` : ''}
                                         </button>
                                     </div>
                                 </div>
                             )
                        }

                        if (field.type === 'paypal') {
                            return (
                                <div key={field.id} className="animate-fade-in">
                                    <button type="button" disabled className="w-full py-3 rounded-lg bg-[#FFC439] text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                        <span className="material-symbols-outlined">account_balance_wallet</span> 
                                        Pay with PayPal {field.price ? `(${field.price} ${field.currency})` : ''}
                                    </button>
                                </div>
                            )
                        }

                        if (field.type === 'file' || field.type === 'image') {
                             return (
                                 <div key={field.id} className="flex flex-col gap-2 animate-fade-in">
                                     <label className="text-base font-medium">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                     </label>
                                     <div className="relative w-full">
                                        <input type="file" accept={field.allowedFileTypes ? field.allowedFileTypes.join(',') : (field.type === 'image' ? "image/*" : "*")} required={field.required} className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff9a00]/10 file:text-[#ff9a00] hover:file:bg-[#ff9a00]/20" />
                                    </div>
                                    {(field.maxFileSizeMB || field.allowedFileTypes) && (
                                        <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] italic mt-1">
                                            {field.maxFileSizeMB ? `Max size: ${field.maxFileSizeMB}MB. ` : ''}
                                            {field.allowedFileTypes ? `Allowed: ${field.allowedFileTypes.join(', ')}` : ''}
                                        </p>
                                    )}
                                 </div>
                             )
                        }

                        return (
                            <div key={field.id} className="flex flex-col gap-2 animate-fade-in">
                                <label className="text-base font-medium">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all" placeholder={field.placeholder} rows={4} value={formValues[field.id] || ''} required={field.required} minLength={field.minLength} maxLength={field.maxLength} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                                ) : field.type === 'select' ? (
                                    <select className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all" required={field.required} value={formValues[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)}>
                                        <option value="">Select an option...</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : field.type === 'radio' ? (
                                    <div className="flex flex-col gap-3">
                                        {field.options?.map((opt) => (
                                            <label key={opt} className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all hover:border-[#ff9a00] dark:hover:border-[#ff9a00] ${formValues[field.id] === opt ? 'border-[#ff9a00] bg-[#ff9a00]/5' : 'border-[#e5e7eb] dark:border-[#374151]'}`}>
                                                <input type="radio" name={field.id} required={field.required} checked={formValues[field.id] === opt} className="h-5 w-5 rounded-full border-2 border-[#374151] text-[#ff9a00] focus:ring-[#ff9a00]" onChange={() => handleInputChange(field.id, opt)} />
                                                <span className="text-sm font-medium">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : field.type === 'checkbox' ? (
                                    <div className="flex flex-col gap-3">
                                        {field.options?.map((opt) => (
                                            <label key={opt} className="flex cursor-pointer items-center gap-4 rounded-lg border border-[#e5e7eb] dark:border-[#374151] p-4 transition-all hover:border-[#ff9a00] dark:hover:border-[#ff9a00]">
                                                <input type="checkbox" name={field.id} className="h-5 w-5 rounded border-2 border-[#374151] text-[#ff9a00] focus:ring-[#ff9a00]" onChange={(e) => handleInputChange(field.id, opt)} />
                                                <span className="text-sm font-medium">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : field.type === 'phone' ? (
                                    <div className="flex gap-2">
                                        <div className="relative w-32">
                                            <select className="w-full appearance-none rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 pr-8 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all">
                                                {COUNTRY_CODES.map((c, i) => (
                                                    <option key={i} value={c.code}>{c.name} ({c.code})</option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs opacity-50">expand_more</span>
                                        </div>
                                        <input type="tel" className="flex-1 rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all" placeholder={field.placeholder} required={field.required} value={formValues[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                                    </div>
                                ) : (
                                    <input type={field.type} className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#f5f5f5] dark:bg-[#0d253f] p-3 text-base outline-none focus:border-[#ff9a00] focus:ring-2 focus:ring-[#ff9a00]/50 transition-all" placeholder={field.placeholder} required={field.required} value={formValues[field.id] || ''} minLength={field.minLength} maxLength={field.maxLength} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                                )}
                                {field.helperText && <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] italic mt-1">{field.helperText}</p>}
                            </div>
                        );
                    })}
                    <div className="mt-4 flex flex-col items-center gap-4 border-t border-[#e5e7eb] dark:border-[#374151] pt-6 sm:flex-row sm:justify-between">
                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#0d253f] dark:bg-[#ff9a00] px-6 py-3 text-base font-bold text-white sm:w-auto hover:opacity-90 shadow-lg shadow-[#ff9a00]/20 transition-transform active:scale-95 disabled:opacity-70">
                            {loading ? 'Sending...' : (form.submitButtonText || 'Submit')}
                        </button>
                        <p className="text-xs text-[#6b7280] dark:text-white/50">Powered by Regal Forms</p>
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

export default FormPublicPage;
