
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GeneratedForm } from '../types';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  // Define full schemas for templates
  const TEMPLATES: Record<string, GeneratedForm> = {
    'contact': {
        title: "Contact Us",
        description: "We'd love to hear from you. Please fill out this form.",
        fields: [
            { id: 't1', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
            { id: 't2', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
            { id: 't3', label: 'Subject', type: 'select', options: ['General Inquiry', 'Support', 'Sales', 'Feedback'], required: false },
            { id: 't4', label: 'Message', type: 'textarea', placeholder: 'How can we help you?', required: true }
        ]
    },
    'event': {
        title: "Event Registration",
        description: "Register for our upcoming annual conference.",
        fields: [
            { id: 'e1', label: 'Attendee Name', type: 'text', required: true },
            { id: 'e2', label: 'Email', type: 'email', required: true },
            { id: 'e3', label: 'Phone Number', type: 'phone', required: true },
            { id: 'e4', label: 'Ticket Type', type: 'radio', options: ['General Admission', 'VIP', 'Student'], required: true },
            { id: 'e5', label: 'Dietary Restrictions', type: 'checkbox', options: ['Vegetarian', 'Vegan', 'Gluten Free', 'Nut Allergy'], required: false }
        ]
    },
    'feedback': {
        title: "Customer Feedback",
        description: "Your feedback helps us improve our services.",
        fields: [
            { id: 'f1', label: 'How would you rate our service?', type: 'radio', options: ['Excellent', 'Good', 'Average', 'Poor'], required: true },
            { id: 'f2', label: 'What did you like most?', type: 'textarea', required: false },
            { id: 'f3', label: 'What can we improve?', type: 'textarea', required: false },
            { id: 'f4', label: 'Can we contact you for follow-up?', type: 'checkbox', options: ['Yes, via email'], required: false }
        ]
    },
    'job': {
        title: "Job Application",
        description: "Apply for the open position at our company.",
        fields: [
            { id: 'j1', label: 'Full Name', type: 'text', required: true },
            { id: 'j2', label: 'Email', type: 'email', required: true },
            { id: 'j3', label: 'Phone', type: 'phone', required: true },
            { id: 'j4', label: 'Position Applied For', type: 'select', options: ['Frontend Dev', 'Backend Dev', 'Designer', 'Product Manager'], required: true },
            { id: 'j5', label: 'Resume/CV', type: 'file', required: true },
            { id: 'j6', label: 'Portfolio URL', type: 'text', required: false }
        ]
    },
    'product': {
        title: "Product Survey",
        description: "Help us shape the future of our product.",
        fields: [
            { id: 'p1', label: 'How often do you use our product?', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'], required: true },
            { id: 'p2', label: 'Which features do you use most?', type: 'checkbox', options: ['Analytics', 'Builder', 'Templates', 'Integrations'], required: false },
            { id: 'p3', label: 'Upload a screenshot of any issues (optional)', type: 'image', required: false }
        ]
    }
  };

  const handleUseTemplate = (key: string) => {
      const template = TEMPLATES[key];
      if (template) {
          navigate('/create', { state: { template } });
      }
  };

  const displayTemplates = [
    { key: 'contact', title: "Contact Form", cat: "Business", desc: "Simple contact form with name, email, and message fields.", icon: "contact_mail" },
    { key: 'event', title: "Event Registration", cat: "Events", desc: "Register attendees with dietary preferences and ticket types.", icon: "event" },
    { key: 'feedback', title: "Customer Feedback", cat: "Survey", desc: "Gather insights on your product or service quality.", icon: "thumb_up" },
    { key: 'job', title: "Job Application", cat: "HR", desc: "Collect resumes and applicant details efficiently.", icon: "work" },
    { key: 'product', title: "Product Survey", cat: "Product", desc: "Detailed questionnaire about product usage and features.", icon: "inventory_2" },
  ];

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-10 gap-8">
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <h1 className="text-4xl font-black tracking-tight">Start with a Template</h1>
        <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl">Choose from our collection of professionally designed templates to launch your form in seconds.</p>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['All', 'Business', 'Education', 'Events', 'HR', 'Personal'].map((cat, i) => (
                <button key={cat} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-primary text-white dark:text-black' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>
                    {cat}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTemplates.map((t, i) => (
            <div key={i} className="group relative flex flex-col rounded-xl bg-white dark:bg-background-dark border border-black/10 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="h-32 bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-black/20 dark:text-white/20 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-6xl">{t.icon}</span>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">{t.title}</h3>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">{t.cat}</span>
                    </div>
                    <p className="text-sm text-black/60 dark:text-white/60 line-clamp-2">{t.desc}</p>
                    
                    <div className="mt-auto pt-4">
                        <button 
                            onClick={() => handleUseTemplate(t.key)}
                            className="flex items-center justify-center w-full py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:text-black font-bold text-sm transition-all gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Use Template
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;
