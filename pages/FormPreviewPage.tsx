
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GeneratedForm, FormTheme } from '../types';
import { COUNTRIES, PHONE_CODES } from '../data/formResources';

const DEMO_FORM: GeneratedForm = {
  title: "Product Demo Request",
  description: "Experience the power of Regal Forms firsthand.",
  fields: [
    { id: 'd1', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
    { id: 'd2', label: 'Preferred Date', type: 'date', required: true },
    { id: 'd3', label: 'Interests', type: 'checkbox', options: ['Design', 'Development', 'AI'], required: false }
  ],
  theme: { primaryColor: '#f27f0d', backgroundColor: '#ffffff', textColor: '#18181b', fontFamily: 'sans', borderRadius: 'lg' }
};

const SignaturePad = ({ onChange, color }: { onChange: (val: string) => void, color: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Set resolution to match display size
            canvas.width = canvas.parentElement?.clientWidth || 300;
            canvas.height = 160; // Fixed height
            
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
        // Handle both touch and mouse events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: any) => {
        // Prevent default only for touch to stop scrolling
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
        <div className="relative w-full h-40 border rounded-lg bg-white dark:bg-white/5 overflow-hidden" style={{ borderColor: color ? `${color}40` : 'currentColor' }}>
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

const FormPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const form = (location.state?.formData as GeneratedForm) || DEMO_FORM;
  const formId = location.state?.formId; // Allow null for unsaved drafts
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setIsSubmitted(true); window.scrollTo(0,0); };
  
  // Always return the current form state to preserve draft in BuilderPage
  const handleReturn = () => { 
      navigate('/create', { state: { formData: form, formId } });
  };

  const theme: FormTheme = form?.theme || DEMO_FORM.theme!;
  const fontClass = { 'sans': 'font-sans', 'serif': 'font-serif', 'mono': 'font-mono' }[theme.fontFamily];
  const radiusMap: any = { 'none': '0px', 'sm': '4px', 'md': '8px', 'lg': '12px', 'xl': '16px', 'full': '24px' };
  const radius = radiusMap[theme.borderRadius];

  const customStyles = {
      '--primary': theme.primaryColor,
      '--bg': theme.backgroundColor,
      '--text': theme.textColor,
      '--radius': radius,
  } as React.CSSProperties;

  return (
    <div className={`min-h-screen flex flex-col ${fontClass}`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, ...customStyles }}>
      <style>{`
        .custom-focus:focus { ring: 2px solid var(--primary); border-color: var(--primary); outline:none; }
        .custom-btn { background-color: var(--primary); color: white; border-radius: var(--radius); }
        .custom-input { border-radius: var(--radius); border: 1px solid color-mix(in srgb, var(--text), transparent 80%); background-color: color-mix(in srgb, var(--bg), var(--text) 5%); color: var(--text); }
        .custom-card { background-color: color-mix(in srgb, var(--bg), var(--text) 2%); border: 1px solid color-mix(in srgb, var(--text), transparent 90%); border-radius: var(--radius); }
        input[type="range"] { accent-color: var(--primary); }
      `}</style>

      <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm text-black">
        <div className="flex items-center gap-4">
           <button onClick={handleReturn} className="flex items-center gap-1 text-sm font-bold hover:opacity-70">
               <span className="material-symbols-outlined text-lg">arrow_back</span> Back
           </button>
           <h2 className="hidden text-lg font-bold sm:block">Preview Mode</h2>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsSubmitted(false)} className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold hover:bg-gray-50">
                Reset
            </button>
            <button onClick={handleReturn} className="rounded-lg bg-black text-white px-4 py-2 text-sm font-bold hover:bg-gray-800">
                Return to Editor
            </button>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-2xl custom-card shadow-xl overflow-hidden h-fit">
            {theme.coverImage && (
                <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${theme.coverImage})` }}></div>
            )}
            
            <div className="p-8">
                {theme.logo && <img src={theme.logo} alt="Logo" className="h-16 mb-6 object-contain mx-auto" />}
                
                {isSubmitted ? (
                    <div className="text-center py-10">
                        <span className="material-symbols-outlined text-6xl mb-4" style={{ color: theme.primaryColor }}>check_circle</span>
                        <h2 className="text-3xl font-black mb-4">Success!</h2>
                        <p className="opacity-80 mb-6">{form.successMessage || "Your submission has been received."}</p>
                        <button onClick={() => setIsSubmitted(false)} className="text-blue-500 underline font-bold">Submit another response</button>
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
                                     field.type === 'quote' ? (
                                        <div className="border-l-4 pl-4 italic opacity-80 my-2" style={{ borderColor: theme.textColor }}>
                                            "{field.content}"
                                            {field.author && <div className="text-xs font-bold mt-1 opacity-60">- {field.author}</div>}
                                        </div>
                                     ) : (
                                        <div dangerouslySetInnerHTML={{ __html: field.content || '' }} className="opacity-90 my-2 prose max-w-none" />
                                     )
                                ) : field.type === 'youtube' ? (
                                    <div className="aspect-video w-full bg-black rounded-lg flex items-center justify-center overflow-hidden my-2">
                                        <span className="material-symbols-outlined text-4xl text-white opacity-50">play_circle</span>
                                        <p className="text-white text-xs mt-2 absolute bottom-2">Video Placeholder</p>
                                    </div>
                                ) : field.type === 'countdown' ? (
                                    <div className="flex gap-4 justify-center p-6 rounded-lg opacity-90 my-2" style={{ backgroundColor: 'color-mix(in srgb, var(--bg), var(--text) 5%)' }}>
                                        <div className="text-center"><span className="text-2xl font-black">02</span><div className="text-[10px] uppercase font-bold opacity-60">Days</div></div>
                                        <div className="text-center"><span className="text-2xl font-black">:</span></div>
                                        <div className="text-center"><span className="text-2xl font-black">14</span><div className="text-[10px] uppercase font-bold opacity-60">Hours</div></div>
                                        <div className="text-center"><span className="text-2xl font-black">:</span></div>
                                        <div className="text-center"><span className="text-2xl font-black">45</span><div className="text-[10px] uppercase font-bold opacity-60">Mins</div></div>
                                    </div>
                                ) : (
                                    <>
                                        <label className="font-bold text-sm opacity-90">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                                        
                                        {/* Standard Inputs */}
                                        {['text','email','number','url','date','time'].includes(field.type) && (
                                            <input 
                                                type={field.type} 
                                                className="custom-input w-full p-3 custom-focus" 
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                                            />
                                        )}

                                        {/* Phone Input */}
                                        {field.type === 'phone' && (
                                            <div className="flex gap-2">
                                                {field.showCountryCode !== false && (
                                                    <select className="custom-input p-3 w-28 custom-focus">
                                                        {PHONE_CODES.map((c, i) => (
                                                            <option key={i} value={c.code}>{c.country} {c.code}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                <input 
                                                    type="tel" 
                                                    className="custom-input flex-1 p-3 custom-focus" 
                                                    placeholder={field.placeholder}
                                                    required={field.required}
                                                    onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                                                />
                                            </div>
                                        )}

                                        {/* Selects */}
                                        {field.type === 'country' && (
                                            <select 
                                                className="custom-input w-full p-3 custom-focus"
                                                required={field.required}
                                                onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                                            >
                                                <option value="">Select Country</option>
                                                {COUNTRIES.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        )}

                                        {field.type === 'select' && (
                                            <select 
                                                className="custom-input w-full p-3 custom-focus"
                                                required={field.required}
                                                onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                                            >
                                                <option value="">Select...</option>
                                                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        )}

                                        {/* Textarea */}
                                        {field.type === 'textarea' && (
                                            <textarea 
                                                className="custom-input w-full p-3 custom-focus" 
                                                rows={4} 
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                                            />
                                        )}

                                        {/* Radios */}
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
                                                            onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
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
                                                            onChange={(e) => {
                                                                const current = previewValues[field.id] || [];
                                                                const updated = e.target.checked 
                                                                    ? [...current, opt]
                                                                    : current.filter((v: string) => v !== opt);
                                                                setPreviewValues({...previewValues, [field.id]: updated});
                                                            }}
                                                        />
                                                        <span className="text-sm opacity-90">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {/* Files */}
                                        {['file', 'image'].includes(field.type) && (
                                            <div className="w-full">
                                                <input 
                                                    type="file" 
                                                    className="custom-input w-full p-3 custom-focus file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black/5 file:text-black/70 hover:file:bg-black/10 cursor-pointer"
                                                    required={field.required}
                                                />
                                            </div>
                                        )}

                                        {/* Rating */}
                                        {field.type === 'rating' && (
                                            <div className="flex gap-1 py-2">
                                                {[...Array(field.max || 5)].map((_, i) => (
                                                    <button 
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setPreviewValues({...previewValues, [field.id]: i + 1})}
                                                        className={`material-symbols-outlined text-2xl transition-colors ${
                                                            (previewValues[field.id] || 0) > i ? 'text-yellow-400 fill-current' : 'opacity-30'
                                                        }`}
                                                    >
                                                        star
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Slider */}
                                        {field.type === 'slider' && (
                                            <div className="py-2">
                                                <div className="flex items-center justify-between text-xs opacity-60 mb-2">
                                                    <span>{field.min || 0}</span>
                                                    <span className="font-bold text-base opacity-100">{previewValues[field.id] || field.min || 0}</span>
                                                    <span>{field.max || 100}</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min={field.min || 0} 
                                                    max={field.max || 100} 
                                                    step={field.step || 1}
                                                    value={previewValues[field.id] || field.min || 0}
                                                    onChange={(e) => setPreviewValues({...previewValues, [field.id]: Number(e.target.value)})}
                                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
                                                />
                                            </div>
                                        )}

                                        {/* Product */}
                                        {field.type === 'product' && (
                                            <div 
                                                className={`p-4 border rounded-lg flex items-center gap-4 cursor-pointer transition-colors ${
                                                    previewValues[field.id] ? 'border-primary bg-primary/5' : 'border-black/10 dark:border-white/10 hover:border-black/20'
                                                }`}
                                                style={{ borderColor: previewValues[field.id] ? theme.primaryColor : undefined }}
                                                onClick={() => setPreviewValues({...previewValues, [field.id]: !previewValues[field.id]})}
                                            >
                                                <div className="size-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: theme.textColor }}>
                                                    {previewValues[field.id] && <div className="size-2.5 rounded-full bg-current"></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold">{field.label}</div>
                                                    <div className="text-xs opacity-60">{field.productDescription}</div>
                                                </div>
                                                <div className="font-bold">{field.price} {field.currency}</div>
                                            </div>
                                        )}

                                        {/* Payment Placeholders */}
                                        {['stripe', 'paypal'].includes(field.type) && (
                                            <div className="p-4 border rounded-lg flex items-center justify-center gap-2 opacity-70 bg-black/5 dark:bg-white/5">
                                                <span className="material-symbols-outlined">credit_card</span>
                                                <span className="font-bold">Payment Integration Preview</span>
                                            </div>
                                        )}

                                        {/* Signature */}
                                        {field.type === 'signature' && (
                                            <SignaturePad 
                                                onChange={(val) => setPreviewValues({...previewValues, [field.id]: val})} 
                                                color={theme.textColor} 
                                            />
                                        )}

                                        {field.helperText && <p className="text-xs opacity-60 mt-1">{field.helperText}</p>}
                                    </>
                                )}
                            </div>
                        ))}

                        <div className="mt-6 pt-6 border-t" style={{ borderColor: `${theme.textColor}20` }}>
                            <button type="submit" className="custom-btn w-full py-4 font-bold text-lg shadow-lg active:scale-[0.98] transition-transform">
                                {form.submitButtonText || 'Submit'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default FormPreviewPage;
