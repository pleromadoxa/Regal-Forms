
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { GeneratedForm, FormField, FormTheme } from '../types';
import { COUNTRIES, PHONE_CODES } from '../data/formResources';
import { sendEmail, generateEmailTemplate } from '../services/emailService';

const SignaturePad = ({ onChange, color }: { onChange: (val: string) => void, color: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.parentElement?.clientWidth || 300;
            canvas.height = 160; 
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [color]);

    const getCoords = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: any) => {
        if (e.type === 'touchstart') document.body.style.overflow = 'hidden';
        setIsDrawing(true);
        const { x, y } = getCoords(e);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const { x, y } = getCoords(e);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            if (!hasSignature) setHasSignature(true);
        }
    };

    const endDrawing = (e: any) => {
        if (e.type === 'touchend') document.body.style.overflow = 'auto';
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            if (canvas) {
                onChange(canvas.toDataURL());
            }
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            onChange('');
            setHasSignature(false);
        }
    };

    return (
        <div className="relative w-full h-40 border rounded-lg bg-white/10 overflow-hidden" style={{ borderColor: color ? `${color}40` : 'currentColor' }}>
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
            />
            {hasSignature && (
                <button 
                    type="button" 
                    onClick={clear} 
                    className="absolute top-2 right-2 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                >
                    Clear
                </button>
            )}
            {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 select-none">
                    <span className="text-xl italic">Sign Here</span>
                </div>
            )}
        </div>
    );
};

const FormPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const [form, setForm] = useState<GeneratedForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formId, setFormId] = useState<string | null>(null);

  useEffect(() => {
      const fetchForm = async () => {
          if (!slug) return;
          setLoading(true);
          try {
              const q = query(collection(db, 'forms'), where('slug', '==', slug));
              const snap = await getDocs(q);
              if (!snap.empty) {
                  setForm(snap.docs[0].data() as GeneratedForm);
                  setFormId(snap.docs[0].id);
                  updateDoc(doc(db, 'forms', snap.docs[0].id), { 'stats.views': increment(1) });
              } else {
                  const docRef = doc(db, 'forms', slug);
                  const dSnap = await getDoc(docRef);
                  if (dSnap.exists()) {
                      setForm(dSnap.data() as GeneratedForm);
                      setFormId(dSnap.id);
                      updateDoc(docRef, { 'stats.views': increment(1) });
                  } else {
                      setError('Form not found');
                  }
              }
          } catch (e) { setError('Error loading'); } 
          finally { setLoading(false); }
      };
      fetchForm();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!formId || !form) return;
      
      try {
        await addDoc(collection(db, 'forms', formId, 'submissions'), { responses: formValues, submittedAt: serverTimestamp() });
        await updateDoc(doc(db, 'forms', formId), { 'stats.responses': increment(1) });
        
        // Helper to format values for email
        const getFormattedValue = (key: string, value: any) => {
            const fieldDef = form.fields.find(f => f.id === key);
            if (fieldDef?.type === 'signature') return '[Signature Image Received]';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value);
        };

        // 1. Send Email Notification to Owner
        if (form.ownerEmail) {
            const emailBody = `
                <p>You have received a new submission for your form <strong>${form.title}</strong>.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
                    ${Object.entries(formValues).slice(0, 10).map(([key, value]) => {
                        const label = form.fields.find(f => f.id === key)?.label || key;
                        return `<p><strong>${label}:</strong> ${getFormattedValue(key, value)}</p>`;
                    }).join('')}
                    ${Object.keys(formValues).length > 10 ? '<p><em>...and more fields.</em></p>' : ''}
                </div>
            `;

            const emailHtml = generateEmailTemplate(
                "New Form Submission 📝",
                emailBody,
                `https://www.regalforms.xyz/#/submissions`,
                "View All Submissions"
            );
            
            await sendEmail(form.ownerEmail, `New Submission: ${form.title}`, emailHtml);
        }

        // 2. Send Confirmation Email to Respondent (if email field exists)
        const emailField = form.fields.find(f => f.type === 'email');
        const respondentEmail = emailField ? formValues[emailField.id] : null;

        if (respondentEmail && typeof respondentEmail === 'string' && respondentEmail.includes('@')) {
             const respondentEmailBody = `
                <p>Hi there,</p>
                <p>Thanks for submitting <strong>${form.title}</strong>. We have received your response successfully.</p>
                <p>Here is a copy of what you submitted:</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
                    ${Object.entries(formValues).map(([key, value]) => {
                        // Skip sensitive/large fields in receipt if needed, but showing text is usually good
                        const label = form.fields.find(f => f.id === key)?.label || key;
                        return `<p><strong>${label}:</strong> ${getFormattedValue(key, value)}</p>`;
                    }).join('')}
                </div>
            `;

            const respondentEmailHtml = generateEmailTemplate(
                "Submission Received ✅",
                respondentEmailBody,
                `https://www.regalforms.xyz/#/form/${slug}`,
                "Submit Another Response"
            );

            await sendEmail(respondentEmail, `Submission Received: ${form.title}`, respondentEmailHtml);
        }

        setIsSubmitted(true);
      } catch (err) {
          console.error("Submission error", err);
          alert("Failed to submit form. Please try again.");
      }
  };

  // Theme Logic
  const theme: FormTheme = form?.theme || { 
      primaryColor: '#f27f0d', 
      backgroundColor: '#ffffff', 
      textColor: '#18181b', 
      fontFamily: 'sans', 
      borderRadius: 'lg' 
  };

  const fontClass = { 'sans': 'font-sans', 'serif': 'font-serif', 'mono': 'font-mono' }[theme.fontFamily];
  const radiusMap: any = { 'none': '0px', 'sm': '4px', 'md': '8px', 'lg': '12px', 'xl': '16px', 'full': '24px' };
  const radius = radiusMap[theme.borderRadius];

  const customStyles = {
      '--primary': theme.primaryColor,
      '--bg': theme.backgroundColor,
      '--text': theme.textColor,
      '--radius': radius,
  } as React.CSSProperties;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !form) return <div className="min-h-screen flex items-center justify-center">{error || 'Form not found'}</div>;

  return (
    <div className={`min-h-screen flex flex-col items-center py-10 px-4 ${fontClass}`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, ...customStyles }}>
      <style>{`
        .custom-focus:focus { ring: 2px solid var(--primary); border-color: var(--primary); outline: none; }
        .custom-btn { background-color: var(--primary); color: white; border-radius: var(--radius); }
        .custom-btn:hover { opacity: 0.9; }
        .custom-input { border-radius: var(--radius); border: 1px solid color-mix(in srgb, var(--text), transparent 80%); background-color: color-mix(in srgb, var(--bg), var(--text) 5%); color: var(--text); }
        .custom-card { background-color: color-mix(in srgb, var(--bg), var(--text) 2%); border: 1px solid color-mix(in srgb, var(--text), transparent 90%); border-radius: var(--radius); }
      `}</style>

      <div className="w-full max-w-2xl custom-card shadow-xl overflow-hidden">
          {theme.coverImage && (
              <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${theme.coverImage})` }}></div>
          )}
          
          <div className="p-8">
              {theme.logo && <img src={theme.logo} alt="Logo" className="h-16 mb-6 object-contain mx-auto" />}
              
              {isSubmitted ? (
                  <div className="text-center py-10">
                      <span className="material-symbols-outlined text-6xl mb-4" style={{ color: theme.primaryColor }}>check_circle</span>
                      <h2 className="text-3xl font-black mb-4">Thank You!</h2>
                      <p className="opacity-80">{form.successMessage || 'Your response has been recorded.'}</p>
                  </div>
              ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                      <div className="text-center mb-4 border-b pb-6" style={{ borderColor: `${theme.textColor}20` }}>
                          <h1 className="text-3xl font-black mb-2">{form.title}</h1>
                          <p className="opacity-70 whitespace-pre-wrap">{form.description}</p>
                      </div>

                      {form.fields.map(field => (
                          <div key={field.id} className="flex flex-col gap-2">
                              {['html', 'quote'].includes(field.type) ? (
                                  <div dangerouslySetInnerHTML={{__html: field.content || ''}} />
                              ) : (
                                  <>
                                    <label className="font-bold text-sm opacity-90">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                                    
                                    {/* Standard Inputs */}
                                    {['text','email','number','phone','url','date','time'].includes(field.type) && (
                                        <input 
                                            type={field.type === 'phone' ? 'tel' : field.type} 
                                            required={field.required} 
                                            placeholder={field.placeholder}
                                            className="custom-input w-full p-3 transition-all custom-focus" 
                                            onChange={e => setFormValues({...formValues, [field.id]: e.target.value})}
                                        />
                                    )}

                                    {/* Textarea */}
                                    {field.type === 'textarea' && (
                                        <textarea 
                                            required={field.required} 
                                            rows={4} 
                                            placeholder={field.placeholder}
                                            className="custom-input w-full p-3 transition-all custom-focus" 
                                            onChange={e => setFormValues({...formValues, [field.id]: e.target.value})} 
                                        />
                                    )}

                                    {/* Dropdown */}
                                    {field.type === 'select' && (
                                        <select 
                                            required={field.required} 
                                            className="custom-input w-full p-3 transition-all custom-focus" 
                                            onChange={e => setFormValues({...formValues, [field.id]: e.target.value})}
                                        >
                                            <option value="">Select...</option>
                                            {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    )}

                                    {/* Country Select */}
                                    {field.type === 'country' && (
                                        <select 
                                            required={field.required} 
                                            className="custom-input w-full p-3 transition-all custom-focus" 
                                            onChange={e => setFormValues({...formValues, [field.id]: e.target.value})}
                                        >
                                            <option value="">Select Country...</option>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    )}

                                    {/* Radio Buttons */}
                                    {field.type === 'radio' && (
                                        <div className="flex flex-col gap-2 mt-1">
                                            {field.options?.map((opt, i) => (
                                                <label key={i} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                    <input 
                                                        type="radio" 
                                                        name={field.id} 
                                                        value={opt}
                                                        required={field.required}
                                                        className="accent-[var(--primary)] size-5"
                                                        onChange={e => setFormValues({...formValues, [field.id]: opt})}
                                                    />
                                                    <span className="text-sm opacity-90">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* Checkboxes */}
                                    {field.type === 'checkbox' && (
                                        <div className="flex flex-col gap-2 mt-1">
                                            {field.options?.map((opt, i) => (
                                                <label key={i} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        name={field.id} 
                                                        value={opt}
                                                        className="accent-[var(--primary)] size-5 rounded"
                                                        onChange={e => {
                                                            const current = (formValues[field.id] as string[]) || [];
                                                            if (e.target.checked) {
                                                                setFormValues({...formValues, [field.id]: [...current, opt]});
                                                            } else {
                                                                setFormValues({...formValues, [field.id]: current.filter(v => v !== opt)});
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm opacity-90">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* File Upload (Basic) */}
                                    {['file', 'image'].includes(field.type) && (
                                        <input 
                                            type="file" 
                                            required={field.required}
                                            accept={field.type === 'image' ? "image/*" : undefined}
                                            className="custom-input w-full p-3 transition-all custom-focus file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black/5 file:text-black/70 hover:file:bg-black/10"
                                            onChange={e => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setFormValues({...formValues, [field.id]: e.target.files[0].name});
                                                }
                                            }}
                                        />
                                    )}

                                    {/* Signature */}
                                    {field.type === 'signature' && (
                                        <SignaturePad 
                                            onChange={(val) => setFormValues({...formValues, [field.id]: val})} 
                                            color={theme.textColor} 
                                        />
                                    )}

                                    {/* Fallback for complex/unsupported types */}
                                    {!['text','email','number','phone','url','date','time','textarea','select','country','radio','checkbox','file','image', 'signature'].includes(field.type) && (
                                        <div className="p-3 opacity-50 text-sm italic border border-dashed rounded" style={{ borderColor: theme.textColor }}>
                                            {field.type} input not supported in public view yet
                                        </div>
                                    )}
                                  </>
                              )}
                          </div>
                      ))}

                      <div className="mt-6 pt-6 border-t" style={{ borderColor: `${theme.textColor}20` }}>
                          <button type="submit" className="custom-btn w-full py-4 font-bold text-lg shadow-lg transition-transform active:scale-[0.98]">
                              {form.submitButtonText || 'Submit'}
                          </button>
                      </div>
                  </form>
              )}
          </div>
      </div>
      
      <div className="mt-8 text-xs opacity-40">
          Powered by Regal Forms
      </div>
    </div>
  );
};

export default FormPublicPage;
