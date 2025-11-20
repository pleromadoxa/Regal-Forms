
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GeneratedForm } from '../types';

const FormSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [form, setForm] = useState<GeneratedForm | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [newCollaborator, setNewCollaborator] = useState('');

  useEffect(() => {
      if (location.state && location.state.formData) {
          setForm(location.state.formData);
          setFormId(location.state.formId || null);
      } else {
          navigate('/create');
      }
  }, [location.state, navigate]);

  const handleSave = () => {
      navigate('/create', { 
          state: { 
              formData: form,
              formId: formId 
          } 
      });
  };

  const updateSetting = (key: keyof GeneratedForm, value: any) => {
      if (!form) return;
      setForm(prev => prev ? ({ ...prev, [key]: value }) : null);
  };

  const addCollaborator = () => {
      if (!form || !newCollaborator.trim()) return;
      const currentCollaborators = form.collaborators || [];
      if (!currentCollaborators.includes(newCollaborator.trim())) {
          setForm({
              ...form,
              collaborators: [...currentCollaborators, newCollaborator.trim()]
          });
      }
      setNewCollaborator('');
  };

  const removeCollaborator = (email: string) => {
      if (!form || !form.collaborators) return;
      setForm({
          ...form,
          collaborators: form.collaborators.filter(c => c !== email)
      });
  };

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  if (!form) return null;

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-zinc-900 dark:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-black/10 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-background-dark/80 sm:px-6 md:px-8">
        <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-2xl">data_object</span>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Form Settings</h2>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-primary dark:text-zinc-300 dark:hover:text-primary"
            >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span className="hidden sm:inline">Form Editor</span>
            </button>
            <button 
                onClick={handleSave}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90"
            >
                <span className="truncate">Save Changes</span>
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="sticky top-0 hidden h-full w-64 flex-col border-r border-black/10 bg-background-light p-4 dark:border-white/10 dark:bg-background-dark lg:flex overflow-y-auto">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col px-3 pt-2">
                    <h1 className="text-base font-medium">Settings Menu</h1>
                    <p className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Navigate to a category</p>
                </div>
                <div className="flex flex-col gap-1">
                    <button onClick={() => scrollToSection('general')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5 focus:bg-primary/10 focus:text-primary dark:focus:bg-primary/20">
                        <span className="material-symbols-outlined text-xl">settings</span>
                        <p className="text-sm font-medium leading-normal">General</p>
                    </button>
                    <button onClick={() => scrollToSection('responses')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5 focus:bg-primary/10 focus:text-primary dark:focus:bg-primary/20">
                        <span className="material-symbols-outlined text-xl">forum</span>
                        <p className="text-sm font-medium leading-normal">Responses</p>
                    </button>
                    <button onClick={() => scrollToSection('presentation')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5 focus:bg-primary/10 focus:text-primary dark:focus:bg-primary/20">
                        <span className="material-symbols-outlined text-xl">slideshow</span>
                        <p className="text-sm font-medium leading-normal">Presentation</p>
                    </button>
                    <button onClick={() => scrollToSection('collaboration')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5 focus:bg-primary/10 focus:text-primary dark:focus:bg-primary/20">
                        <span className="material-symbols-outlined text-xl">group</span>
                        <p className="text-sm font-medium leading-normal">Collaboration</p>
                    </button>
                </div>
            </div>
        </aside>

        <main className="w-full flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto scroll-smooth">
            <div className="mx-auto max-w-4xl flex flex-col gap-8 pb-20">
                
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-4xl font-black leading-tight tracking-[-0.033em]">Form Settings</p>
                </div>

                {/* Mobile Accordions */}
                <div className="flex flex-col gap-3 lg:hidden">
                    <details className="flex flex-col rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5 group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
                            <p className="text-base font-bold">General</p>
                            <span className="material-symbols-outlined text-zinc-500 transition-transform group-open:rotate-180 dark:text-zinc-400">expand_more</span>
                        </summary>
                        <div className="border-t border-black/10 p-4 dark:border-white/10 flex flex-col gap-4">
                             <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Collect email addresses</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Respondent's email will be collected.</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.collectEmails} onChange={(e) => updateSetting('collectEmails', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Limit to 1 response</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.limitOneResponse} onChange={(e) => updateSetting('limitOneResponse', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                        </div>
                    </details>

                    <details className="flex flex-col rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5 group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
                            <p className="text-base font-bold">Responses</p>
                            <span className="material-symbols-outlined text-zinc-500 transition-transform group-open:rotate-180 dark:text-zinc-400">expand_more</span>
                        </summary>
                        <div className="border-t border-black/10 p-4 dark:border-white/10 flex flex-col gap-4">
                             <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Allow response editing</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Change answers after submitting.</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.allowResponseEditing} onChange={(e) => updateSetting('allowResponseEditing', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                             <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Confirmation message</p>
                                <textarea className="w-full rounded-md border-black/10 bg-background-light text-black p-3 shadow-sm focus:border-primary focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white outline-none" rows={3} value={form.successMessage || ''} onChange={(e) => updateSetting('successMessage', e.target.value)}></textarea>
                            </div>
                        </div>
                    </details>

                    <details className="flex flex-col rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5 group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
                            <p className="text-base font-bold">Presentation</p>
                            <span className="material-symbols-outlined text-zinc-500 transition-transform group-open:rotate-180 dark:text-zinc-400">expand_more</span>
                        </summary>
                        <div className="border-t border-black/10 p-4 dark:border-white/10 flex flex-col gap-4">
                             <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Show progress bar</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.showProgressBar} onChange={(e) => updateSetting('showProgressBar', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Shuffle question order</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.shuffleQuestions} onChange={(e) => updateSetting('shuffleQuestions', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                        </div>
                    </details>

                    <details className="flex flex-col rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5 group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
                            <p className="text-base font-bold">Collaboration</p>
                            <span className="material-symbols-outlined text-zinc-500 transition-transform group-open:rotate-180 dark:text-zinc-400">expand_more</span>
                        </summary>
                        <div className="border-t border-black/10 p-4 dark:border-white/10">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium">Add collaborators</label>
                                    <div className="flex gap-2">
                                        <input type="email" value={newCollaborator} onChange={(e) => setNewCollaborator(e.target.value)} placeholder="Email address" className="block w-full rounded-md border-black/10 bg-background-light p-2 outline-none dark:border-white/10 dark:bg-black/20" />
                                        <button onClick={addCollaborator} className="rounded-lg bg-black/5 px-4 py-2 text-sm font-bold hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20">Add</button>
                                    </div>
                                </div>
                                {form.collaborators && form.collaborators.length > 0 && (
                                    <ul className="space-y-2">
                                        {form.collaborators.map((email, i) => (
                                            <li key={i} className="flex justify-between items-center text-sm">
                                                <span>{email}</span>
                                                <button onClick={() => removeCollaborator(email)} className="text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </details>
                </div>

                {/* Desktop Sections */}
                <div className="hidden flex-col gap-10 lg:flex">
                    <section id="general" className="scroll-mt-24">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">General</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage basic form settings and preferences.</p>
                        </div>
                        <div className="space-y-4 rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-base font-medium">Collect email addresses</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Respondent's email will be collected automatically.</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.collectEmails} onChange={(e) => updateSetting('collectEmails', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                            <div className="h-px bg-black/10 dark:bg-white/10"></div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-base font-medium">Limit to 1 response</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Respondents will be required to sign in.</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.limitOneResponse} onChange={(e) => updateSetting('limitOneResponse', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                            <div className="h-px bg-black/10 dark:bg-white/10"></div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-base font-medium">Restrict to my organization</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Only users within your organization can respond.</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.restrictToOrg} onChange={(e) => updateSetting('restrictToOrg', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <section id="responses" className="scroll-mt-24">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">Responses</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Control how responses are collected and managed.</p>
                        </div>
                        <div className="space-y-4 rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-base font-medium">Allow response editing</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Respondents can change their answers after submitting.</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.allowResponseEditing} onChange={(e) => updateSetting('allowResponseEditing', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                            <div className="h-px bg-black/10 dark:bg-white/10"></div>
                            <div className="flex flex-col gap-2">
                                <p className="text-base font-medium">Confirmation message</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Message shown to respondents after submission.</p>
                                <textarea className="w-full rounded-md border-black/10 bg-background-light text-black shadow-sm focus:border-primary focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white p-3 outline-none" rows={3} value={form.successMessage || ''} onChange={(e) => updateSetting('successMessage', e.target.value)}></textarea>
                            </div>
                        </div>
                    </section>

                    <section id="presentation" className="scroll-mt-24">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">Presentation</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize what respondents see when filling out the form.</p>
                        </div>
                        <div className="space-y-4 rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-base font-medium">Show progress bar</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Display progress based on form completion.</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.showProgressBar} onChange={(e) => updateSetting('showProgressBar', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                            <div className="h-px bg-black/10 dark:bg-white/10"></div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-base font-medium">Shuffle question order</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Randomize the order of questions for each respondent.</p>
                                </div>
                                <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-zinc-200 p-1 transition-colors has-[:checked]:bg-primary dark:bg-zinc-700">
                                    <input type="checkbox" className="sr-only peer" checked={!!form.shuffleQuestions} onChange={(e) => updateSetting('shuffleQuestions', e.target.checked)} />
                                    <span className="h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <section id="collaboration" className="scroll-mt-24">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">Collaboration</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Invite others to edit this form with you.</p>
                        </div>
                        <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Add collaborators</label>
                                    <input type="email" value={newCollaborator} onChange={(e) => setNewCollaborator(e.target.value)} placeholder="Enter email address" className="block w-full rounded-md border-black/10 bg-background-light text-black shadow-sm focus:border-primary focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white p-3 outline-none" />
                                </div>
                                <button onClick={addCollaborator} className="flex h-[46px] items-center justify-center rounded-lg bg-zinc-200 px-4 text-sm font-bold text-zinc-800 hover:bg-zinc-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                                    Add
                                </button>
                            </div>
                            <div className="mt-6">
                                <h4 className="text-base font-semibold">Current Collaborators</h4>
                                {!form.collaborators || form.collaborators.length === 0 ? (
                                    <p className="text-sm text-zinc-500 italic mt-2">No collaborators added yet.</p>
                                ) : (
                                    <ul className="mt-3 space-y-3">
                                        {form.collaborators.map((email, index) => (
                                            <li key={index} className="flex items-center justify-between p-2 rounded hover:bg-zinc-50 dark:hover:bg-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                                        {email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{email}</p>
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Editor</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeCollaborator(email)} className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-500 p-2">
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default FormSettingsPage;
