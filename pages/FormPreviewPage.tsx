
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GeneratedForm, FormTheme } from '../types';

const DEMO_FORM: GeneratedForm = {
  title: "Product Demo Request",
  description: "Experience the power of Regal Forms firsthand.",
  fields: [
    { id: 'd1', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
  ],
  theme: { primaryColor: '#f27f0d', backgroundColor: '#ffffff', textColor: '#18181b', fontFamily: 'sans', borderRadius: 'lg' }
};

const FormPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const form = (location.state?.formData as GeneratedForm) || DEMO_FORM;
  const formId = location.state?.formId || 'demo-form';
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setIsSubmitted(true); window.scrollTo(0,0); };
  const handleReturn = () => { 
      if(formId !== 'demo-form') navigate('/create', { state: { formData: form, formId } });
      else navigate('/create');
  };

  const theme: FormTheme = form?.theme || DEMO_FORM.theme!;
  const fontClass = { 'sans': 'font-sans', 'serif': 'font-serif', 'mono': 'font-mono' }[theme.fontFamily];
  const radiusMap: any = { 'none': '0px', 'sm': '4px', 'md': '8px', 'lg': '12px', 'full': '24px' };
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
      `}</style>

      <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm text-black">
        <div className="flex items-center gap-4">
           <button onClick={handleReturn} className="flex items-center gap-1 text-sm font-bold hover:opacity-70">
               <span className="material-symbols-outlined text-lg">arrow_back</span> Back
           </button>
           <h2 className="hidden text-lg font-bold sm:block">Preview Mode</h2>
        </div>
        <button onClick={handleReturn} className="rounded-lg bg-black text-white px-4 py-2 text-sm font-bold hover:bg-gray-800">
          {formId === 'demo-form' ? 'Edit Demo' : 'Return to Editor'}
        </button>
      </header>

      <main className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-2xl custom-card shadow-xl overflow-hidden">
            {theme.coverImage && (
                <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${theme.coverImage})` }}></div>
            )}
            
            <div className="p-8">
                {theme.logo && <img src={theme.logo} alt="Logo" className="h-16 mb-6 object-contain mx-auto" />}
                
                {isSubmitted ? (
                    <div className="text-center py-10">
                        <h2 className="text-3xl font-black mb-4">Success!</h2>
                        <button onClick={() => setIsSubmitted(false)} className="text-blue-500 underline">Reset Preview</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="text-center mb-4 border-b pb-6" style={{ borderColor: `${theme.textColor}20` }}>
                            <h1 className="text-3xl font-black mb-2">{form.title}</h1>
                            <p className="opacity-70">{form.description}</p>
                        </div>

                        {form.fields.map(field => (
                            <div key={field.id} className="flex flex-col gap-2">
                                <label className="font-bold text-sm opacity-90">{field.label}</label>
                                {['text','email'].includes(field.type) ? (
                                    <input type={field.type} className="custom-input w-full p-3 custom-focus" />
                                ) : (
                                    <div className="p-3 border border-dashed opacity-50 rounded text-sm" style={{ borderColor: theme.textColor }}>Input Preview</div>
                                )}
                            </div>
                        ))}

                        <div className="mt-6 pt-6 border-t" style={{ borderColor: `${theme.textColor}20` }}>
                            <button type="submit" className="custom-btn w-full py-4 font-bold text-lg shadow-lg">
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
