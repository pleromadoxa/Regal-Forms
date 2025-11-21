
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { GeneratedForm, FormField, FormTheme } from '../types';

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
      if(!formId) return;
      await addDoc(collection(db, 'forms', formId, 'submissions'), { responses: formValues, submittedAt: serverTimestamp() });
      await updateDoc(doc(db, 'forms', formId), { 'stats.responses': increment(1) });
      setIsSubmitted(true);
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
  const radiusMap: any = { 'none': '0px', 'sm': '4px', 'md': '8px', 'lg': '12px', 'full': '24px' };
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
                                    {['text','email','number','phone'].includes(field.type) && (
                                        <input 
                                            type={field.type} 
                                            required={field.required} 
                                            className="custom-input w-full p-3 transition-all custom-focus" 
                                            onChange={e => setFormValues({...formValues, [field.id]: e.target.value})}
                                        />
                                    )}
                                    {field.type === 'textarea' && (
                                        <textarea required={field.required} rows={4} className="custom-input w-full p-3 transition-all custom-focus" onChange={e => setFormValues({...formValues, [field.id]: e.target.value})} />
                                    )}
                                    {field.type === 'select' && (
                                        <select required={field.required} className="custom-input w-full p-3 transition-all custom-focus" onChange={e => setFormValues({...formValues, [field.id]: e.target.value})}>
                                            <option value="">Select...</option>
                                            {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    )}
                                    {!['text','email','number','phone','textarea','select'].includes(field.type) && (
                                        <div className="p-3 opacity-50 text-sm italic border border-dashed rounded" style={{ borderColor: theme.textColor }}>
                                            {field.type} input preview
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
