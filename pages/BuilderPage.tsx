import React, { useState } from 'react';
import { generateFormSchema } from '../services/geminiService';
import { FormField, GeneratedForm, GenerationStatus } from '../types';

const BuilderPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [form, setForm] = useState<GeneratedForm | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setStatus(GenerationStatus.LOADING);
    setForm(null);

    try {
      const generatedForm = await generateFormSchema(topic);
      setForm(generatedForm);
      setStatus(GenerationStatus.SUCCESS);
    } catch (error) {
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8 h-[calc(100vh-80px)]">
      
      {/* Left Panel - Input */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-black/10 dark:border-white/10 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">AI Form Assistant</h2>
          <p className="text-black/60 dark:text-white/60 mb-6">
            Describe the form you need, and our AI will generate the fields for you.
          </p>
          
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-primary">Topic or Purpose</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Customer Satisfaction Survey for a Coffee Shop..."
              className="w-full p-4 rounded-lg bg-background-light dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-32 transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={status === GenerationStatus.LOADING || !topic.trim()}
              className="mt-2 w-full py-3 px-6 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {status === GenerationStatus.LOADING ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Form
                </>
              )}
            </button>
          </div>
          
          {status === GenerationStatus.ERROR && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              Something went wrong. Please check your API key or try again.
            </div>
          )}
        </div>

        {/* Pre-made suggestions */}
        <div className="hidden md:block">
            <p className="text-sm text-black/50 dark:text-white/50 mb-3 uppercase font-bold tracking-wider">Try these examples</p>
            <div className="flex flex-col gap-2">
                {['Job Application for Developer', 'Wedding RSVP', 'Product Feedback', 'Event Registration'].map(ex => (
                    <button key={ex} onClick={() => setTopic(ex)} className="text-left px-4 py-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium">
                        {ex}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-full md:w-2/3 flex flex-col h-full">
        <div className="flex-1 bg-white dark:bg-[#2a1f16] rounded-xl border border-black/10 dark:border-white/10 shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-between items-center">
                <span className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">visibility</span>
                    Live Preview
                </span>
                {form && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded border border-green-500/20">Generated Successfully</span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {!form && status !== GenerationStatus.LOADING && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">description</span>
                        <p className="text-xl font-medium">Your form will appear here</p>
                    </div>
                )}

                {status === GenerationStatus.LOADING && (
                    <div className="h-full flex flex-col items-center justify-center">
                         <div className="relative size-20">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                         </div>
                         <p className="mt-6 text-lg animate-pulse">Thinking about the best questions...</p>
                    </div>
                )}

                {form && (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-primary mb-2">{form.title}</h1>
                            <p className="text-black/70 dark:text-white/70">{form.description}</p>
                        </div>

                        <div className="space-y-6">
                            {form.fields.map((field) => (
                                <div key={field.id} className="flex flex-col gap-2 group">
                                    <label className="font-semibold text-sm flex gap-1">
                                        {field.label}
                                        {field.required && <span className="text-primary">*</span>}
                                    </label>
                                    
                                    {field.type === 'textarea' ? (
                                        <textarea 
                                            placeholder={field.placeholder}
                                            className="w-full p-3 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[100px]"
                                        />
                                    ) : field.type === 'select' ? (
                                        <select className="w-full p-3 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                                            <option value="">Select an option...</option>
                                            {field.options?.map((opt, idx) => (
                                                <option key={idx} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'radio' ? (
                                        <div className="flex flex-col gap-2 mt-1">
                                            {field.options?.map((opt, idx) => (
                                                <label key={idx} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                                    <input type="radio" name={field.id} className="text-primary focus:ring-primary bg-transparent border-white/30" />
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : field.type === 'checkbox' ? (
                                        <div className="flex flex-col gap-2 mt-1">
                                            {field.options ? field.options.map((opt, idx) => (
                                                <label key={idx} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                                    <input type="checkbox" className="rounded text-primary focus:ring-primary bg-transparent border-white/30" />
                                                    <span>{opt}</span>
                                                </label>
                                            )) : (
                                                 <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                                    <input type="checkbox" className="rounded text-primary focus:ring-primary bg-transparent border-white/30" />
                                                    <span>{field.placeholder || 'Yes'}</span>
                                                </label>
                                            )}
                                        </div>
                                    ) : (
                                        <input 
                                            type={field.type} 
                                            placeholder={field.placeholder}
                                            className="w-full p-3 rounded-md bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-6 border-t border-black/10 dark:border-white/10 flex justify-end">
                            <button className="px-8 py-3 bg-primary hover:bg-orange-600 text-white dark:text-black font-bold rounded-lg shadow-lg shadow-primary/20 transition-all transform hover:scale-105">
                                Submit Form
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;