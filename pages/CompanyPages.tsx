
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { sendEmail, generateEmailTemplate } from '../services/emailService';

// --- Careers Page ---
export const CareersPage: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-12">
      <div className="text-center flex flex-col gap-6 py-10">
        <span className="text-primary font-bold uppercase tracking-wider">Join the Team</span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Build the future of data collection</h1>
        <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
          We're looking for passionate individuals who care about design, AI, and user experience.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
        {[
            { title: "Senior Frontend Engineer", dept: "Engineering", loc: "Remote", type: "Full-time" },
            { title: "Product Designer", dept: "Design", loc: "New York, NY", type: "Full-time" },
            { title: "AI Research Scientist", dept: "AI Lab", loc: "San Francisco, CA", type: "Full-time" },
            { title: "Customer Success Manager", dept: "Sales", loc: "Remote", type: "Full-time" },
        ].map((job, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 hover:border-primary transition-colors group cursor-pointer">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex gap-4 text-sm text-black/60 dark:text-white/60">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">domain</span> {job.dept}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {job.loc}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {job.type}</span>
                    </div>
                </div>
                <button className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 text-sm font-bold hover:bg-primary hover:text-white transition-colors">
                    Apply Now
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

// --- Contact Page ---
export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !email || !message) return;
      
      setStatus('submitting');
      try {
          await addDoc(collection(db, 'contact_messages'), {
              name,
              email,
              message,
              submittedAt: serverTimestamp(),
              status: 'new'
          });

          // 1. Send Email to Admin/Support
          const adminEmailHtml = generateEmailTemplate(
              `New Contact Message from ${name}`,
              `<p>You have received a new message from the contact form.</p>
               <ul>
                 <li><strong>Name:</strong> ${name}</li>
                 <li><strong>Email:</strong> ${email}</li>
               </ul>
               <p><strong>Message:</strong></p>
               <div style="background: #f5f5f5; padding: 10px; border-left: 3px solid #f27f0d;">
                 ${message.replace(/\n/g, '<br/>')}
               </div>`,
              "https://www.regalforms.xyz/#/admin",
              "View in Admin Console"
          );
          await sendEmail('support@regalforms.xyz', `Contact: ${name}`, adminEmailHtml);

          // 2. Send Auto-Reply to User
          const userReplyHtml = generateEmailTemplate(
              `We received your message, ${name}!`,
              `<p>Thank you for contacting Regal Forms. We have received your message and will get back to you as soon as possible.</p>
               <p><strong>Your Message:</strong></p>
               <div style="background: #f5f5f5; padding: 10px; font-style: italic;">
                 "${message.replace(/\n/g, '<br/>')}"
               </div>
               <p>If you have any urgent questions, check out our Help Center.</p>`,
              "https://www.regalforms.xyz/#/help",
              "Visit Help Center"
          );
          await sendEmail(email, "We received your message - Regal Forms", userReplyHtml);

          setStatus('success');
          setName('');
          setEmail('');
          setMessage('');
      } catch (error) {
          console.error("Error submitting contact form", error);
          setStatus('error');
      }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-12">
       <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black tracking-tight">Get in touch</h1>
            <p className="text-lg text-black/70 dark:text-white/70">
                Have questions about our pricing, features, or enterprise solutions? Our team is ready to help.
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                    <h3 className="font-bold">Email</h3>
                    <p className="text-black/70 dark:text-white/70">support@regalforms.xyz</p>
                    <p className="text-black/70 dark:text-white/70">sales@regalforms.xyz</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                    <h3 className="font-bold">Office</h3>
                    <p className="text-black/70 dark:text-white/70">Greater Accra, Ghana.</p>
                </div>
            </div>
          </div>
       </div>

       <div className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-lg">
          {status === 'success' ? (
             <div className="h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                 <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4">
                     <span className="material-symbols-outlined text-3xl">check</span>
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                 <p className="text-black/60 dark:text-white/60 mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
                 <button onClick={() => setStatus('idle')} className="text-primary font-bold hover:underline">Send another message</button>
             </div>
          ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">Name</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 rounded-lg bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                        placeholder="Your name" 
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 rounded-lg bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                        placeholder="you@company.com" 
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">Message</label>
                    <textarea 
                        required
                        rows={4} 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="p-3 rounded-lg bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                        placeholder="How can we help?" 
                    />
                </div>
                
                {status === 'error' && <p className="text-red-500 text-sm">Failed to send message. Please try again.</p>}

                <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="mt-2 py-3 bg-primary hover:bg-orange-600 text-white dark:text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {status === 'submitting' && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                    Send Message
                </button>
              </form>
          )}
       </div>
    </div>
  );
};
