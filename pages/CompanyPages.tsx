
import React from 'react';
import { Link } from 'react-router-dom';

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
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">Name</label>
                <input type="text" className="p-3 rounded-lg bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Your name" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">Email</label>
                <input type="email" className="p-3 rounded-lg bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="you@company.com" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">Message</label>
                <textarea rows={4} className="p-3 rounded-lg bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="How can we help?" />
            </div>
            <button className="mt-2 py-3 bg-primary hover:bg-orange-600 text-white dark:text-black font-bold rounded-lg transition-colors">
                Send Message
            </button>
          </form>
       </div>
    </div>
  );
};