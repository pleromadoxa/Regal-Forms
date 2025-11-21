
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneratedForm, FormField } from '../types';

// --- Template Library Data ---
const TEMPLATES: Record<string, GeneratedForm & { category: string; icon: string; color: string }> = {
  // --- Landing Pages ---
  'app-launch': {
    category: 'Landing Page',
    icon: 'rocket',
    color: 'bg-pink-600',
    title: "App Launch Waitlist",
    description: "Generate hype for your new mobile application.",
    collectEmails: true,
    theme: { primaryColor: '#f472b6', backgroundColor: '#1a1a2e', textColor: '#e94560', fontFamily: 'sans', borderRadius: 'xl' }, // Neon Nights
    fields: [
      { id: 'al1', label: 'Hero', type: 'html', content: "<h1 class='text-4xl font-black text-center mb-2'>The Future of Task Management</h1><p class='text-center text-lg opacity-80'>Join 10,000+ others waiting for early access.</p>" },
      { id: 'al2', label: 'Email Address', type: 'email', required: true, placeholder: 'you@example.com' },
      { id: 'al3', label: 'What platform do you use?', type: 'radio', options: ['iOS', 'Android', 'Both'], required: true },
      { id: 'al4', label: 'Features you need most', type: 'checkbox', options: ['Offline Mode', 'Collaboration', 'Dark Mode', 'Integrations'], required: false }
    ]
  },
  'product-waitlist': {
    category: 'Landing Page',
    icon: 'rocket_launch',
    color: 'bg-violet-600',
    title: "Product Waitlist",
    description: "Collect emails for your upcoming product launch.",
    collectEmails: true,
    theme: { primaryColor: '#38bdf8', backgroundColor: '#020617', textColor: '#f8fafc', fontFamily: 'sans', borderRadius: 'xl' }, // Deep Space
    fields: [
      { id: 'pw1', label: 'Join the Waitlist', type: 'html', content: "<h2 class='text-2xl font-bold text-center'>Something big is coming.</h2><p class='text-center opacity-80'>Be the first to know when we launch.</p>" },
      { id: 'pw2', label: 'Full Name', type: 'text', required: true },
      { id: 'pw3', label: 'Email Address', type: 'email', required: true },
      { id: 'pw4', label: 'Company Name', type: 'text', required: false },
      { id: 'pw5', label: 'What problem are you trying to solve?', type: 'textarea', required: false }
    ]
  },
  'course-presale': {
    category: 'Landing Page',
    icon: 'school',
    color: 'bg-amber-500',
    title: "Course Pre-sale",
    description: "Sell your course before it launches.",
    collectEmails: true,
    theme: { primaryColor: '#ffd700', backgroundColor: '#240046', textColor: '#e0aaff', fontFamily: 'serif', borderRadius: 'xl' }, // Royal Gold
    fields: [
      { id: 'cp1', label: 'Course Intro', type: 'html', content: "<h2 class='text-3xl font-bold'>Master Photography in 30 Days</h2><p>Pre-order now and save 50%.</p>" },
      { id: 'cp2', label: 'Full Name', type: 'text', required: true },
      { id: 'cp3', label: 'Email', type: 'email', required: true },
      { id: 'cp4', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'], required: true },
      { id: 'cp5', label: 'Pre-order Package ($49)', type: 'product', price: 49, currency: 'USD', productDescription: 'Full access + Bonus presets', required: true }
    ]
  },
  'webinar-registration': {
    category: 'Landing Page',
    icon: 'cast_for_education',
    color: 'bg-purple-600',
    title: "Webinar Registration",
    description: "Sign up page for online events and webinars.",
    collectEmails: true,
    theme: { primaryColor: '#a855f7', backgroundColor: '#faf5ff', textColor: '#3b0764', fontFamily: 'sans', borderRadius: 'full' }, // Lavender Dream
    fields: [
      { id: 'wr1', label: 'Event Details', type: 'html', content: "<div class='text-center'><h3 class='text-xl font-bold'>Mastering AI Workflows</h3><p>October 24th, 2025 • 2:00 PM EST</p></div>" },
      { id: 'wr2', label: 'First Name', type: 'text', required: true },
      { id: 'wr3', label: 'Last Name', type: 'text', required: true },
      { id: 'wr4', label: 'Email', type: 'email', required: true },
      { id: 'wr5', label: 'Job Title', type: 'text', required: true },
      { id: 'wr6', label: 'Questions for the speaker?', type: 'textarea', required: false }
    ]
  },
  'newsletter-signup': {
    category: 'Landing Page',
    icon: 'mail',
    color: 'bg-blue-500',
    title: "Newsletter Subscription",
    description: "Simple form to grow your email list.",
    collectEmails: true,
    theme: { primaryColor: '#334155', backgroundColor: '#f8fafc', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'sm' }, // Slate Corporate
    fields: [
      { id: 'ns1', label: 'Header', type: 'html', content: "<h2 class='text-xl font-bold'>Weekly Insights</h2><p>Get the latest tech news delivered to your inbox.</p>" },
      { id: 'ns2', label: 'Email Address', type: 'email', required: true },
      { id: 'ns3', label: 'Interests', type: 'checkbox', options: ['Technology', 'Design', 'Marketing', 'Business'], required: false }
    ]
  },
  'ebook-download': {
    category: 'Landing Page',
    icon: 'book',
    color: 'bg-emerald-600',
    title: "E-book Download",
    description: "Lead magnet form for digital downloads.",
    collectEmails: true,
    theme: { primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'md' }, // Ocean Blue
    fields: [
      { id: 'eb1', label: 'Cover', type: 'html', content: "<div class='p-4 bg-blue-100 rounded-lg text-center mb-4'><strong>Free Guide:</strong> The Ultimate Guide to Remote Work</div>" },
      { id: 'eb2', label: 'First Name', type: 'text', required: true },
      { id: 'eb3', label: 'Work Email', type: 'email', required: true },
      { id: 'eb4', label: 'Company Website', type: 'url', required: false }
    ]
  },

  // --- Polls & Surveys ---
  'feature-voting': {
    category: 'Polls & Surveys',
    icon: 'thumbs_up_down',
    color: 'bg-green-500',
    title: "Feature Voting Board",
    description: "Let users vote on the next feature to build.",
    collectEmails: false,
    theme: { primaryColor: '#00ff00', backgroundColor: '#000000', textColor: '#00ff00', fontFamily: 'mono', borderRadius: 'none' }, // Tech Terminal
    fields: [
      { id: 'fv1', label: 'Vote for the next feature', type: 'radio', options: ['Dark Mode', 'Mobile App', 'API Access', 'Zapier Integration'], required: true },
      { id: 'fv2', label: 'How important is this to you?', type: 'slider', min: 1, max: 10, step: 1, required: true },
      { id: 'fv3', label: 'Why do you need this?', type: 'textarea', required: false }
    ]
  },
  'brand-awareness': {
    category: 'Polls & Surveys',
    icon: 'campaign',
    color: 'bg-lime-600',
    title: "Brand Awareness Survey",
    description: "Measure how well people know your brand.",
    collectEmails: false,
    theme: { primaryColor: '#606c38', backgroundColor: '#fefae0', textColor: '#283618', fontFamily: 'serif', borderRadius: 'md' }, // Nature Walk
    fields: [
      { id: 'ba1', label: 'How did you hear about us?', type: 'select', options: ['Social Media', 'Search Engine', 'Friend/Colleague', 'Advertisement'], required: true },
      { id: 'ba2', label: 'When you think of [Industry], what brand comes to mind first?', type: 'text', required: true },
      { id: 'ba3', label: 'Have you seen our ads recently?', type: 'radio', options: ['Yes', 'No', 'Not sure'], required: true }
    ]
  },
  'employee-pulse': {
    category: 'Polls & Surveys',
    icon: 'monitor_heart',
    color: 'bg-teal-500',
    title: "Employee Pulse Check",
    description: "Quick weekly check-in for team morale.",
    collectEmails: false,
    theme: { primaryColor: '#059669', backgroundColor: '#ecfdf5', textColor: '#064e3b', fontFamily: 'sans', borderRadius: 'lg' }, // Mint Fresh
    fields: [
      { id: 'ep1', label: 'How are you feeling this week?', type: 'radio', options: ['Great', 'Good', 'Okay', 'Stressed', 'Burnt out'], required: true },
      { id: 'ep2', label: 'Do you have the resources you need?', type: 'radio', options: ['Yes', 'No'], required: true },
      { id: 'ep3', label: 'Any blockers?', type: 'textarea', required: false }
    ]
  },
  'event-voting': {
    category: 'Polls & Surveys',
    icon: 'how_to_vote',
    color: 'bg-pink-500',
    title: "Team Event Voting",
    description: "Decide on the next team activity.",
    collectEmails: true,
    theme: { primaryColor: '#db2777', backgroundColor: '#fffde7', textColor: '#000000', fontFamily: 'mono', borderRadius: 'none' }, // Retro Pop
    fields: [
      { id: 'ev1', label: 'Vote for Activity', type: 'radio', options: ['Bowling', 'Karaoke', 'Escape Room', 'Dinner'], required: true },
      { id: 'ev2', label: 'Preferred Day', type: 'checkbox', options: ['Thursday', 'Friday'], required: true },
      { id: 'ev3', label: 'Dietary Restrictions', type: 'text', required: false }
    ]
  },
  'market-research': {
    category: 'Polls & Surveys',
    icon: 'pie_chart',
    color: 'bg-indigo-500',
    title: "Market Research Survey",
    description: "Gather insights on consumer preferences.",
    collectEmails: false,
    theme: { primaryColor: '#00b4d8', backgroundColor: '#caf0f8', textColor: '#03045e', fontFamily: 'sans', borderRadius: 'lg' }, // Arctic Frost
    fields: [
      { id: 'mr1', label: 'Age Group', type: 'select', options: ['18-24', '25-34', '35-44', '45-54', '55+'], required: true },
      { id: 'mr2', label: 'How often do you shop online?', type: 'radio', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'], required: true },
      { id: 'mr3', label: 'What matters most to you?', type: 'checkbox', options: ['Price', 'Quality', 'Brand', 'Speed'], required: true }
    ]
  },
  'website-feedback': {
    category: 'Polls & Surveys',
    icon: 'thumb_up',
    color: 'bg-cyan-600',
    title: "Website Feedback",
    description: "Collect user feedback on your new site design.",
    collectEmails: false,
    theme: { primaryColor: '#00ff9d', backgroundColor: '#0a0a0a', textColor: '#e0e0e0', fontFamily: 'mono', borderRadius: 'none' }, // Cyberpunk
    fields: [
      { id: 'wf1', label: 'How easy was it to find what you were looking for?', type: 'rating', max: 5, required: true },
      { id: 'wf2', label: 'What did you like most?', type: 'textarea', required: false },
      { id: 'wf3', label: 'What could be improved?', type: 'textarea', required: false }
    ]
  },
  'customer-satisfaction': {
    category: 'Polls & Surveys',
    icon: 'sentiment_satisfied',
    color: 'bg-orange-500',
    title: "Customer Satisfaction (CSAT)",
    description: "Measure customer happiness after support interactions.",
    collectEmails: true,
    theme: { primaryColor: '#f43f5e', backgroundColor: '#fff7ed', textColor: '#431407', fontFamily: 'sans', borderRadius: 'xl' }, // Sunset Vibes
    fields: [
      { id: 'cs1', label: 'How would you rate the support you received?', type: 'rating', max: 5, required: true },
      { id: 'cs2', label: 'Was your issue resolved?', type: 'radio', options: ['Yes', 'No'], required: true },
      { id: 'cs3', label: 'Additional Comments', type: 'textarea', required: false }
    ]
  },


  // --- Church & Ministry ---
  'church-membership': {
    category: 'Church',
    icon: 'church',
    color: 'bg-indigo-500',
    title: "Church Membership Application",
    description: "Collect details from individuals wishing to join your church congregation.",
    collectEmails: true,
    theme: { primaryColor: '#be185d', backgroundColor: '#fff1f2', textColor: '#4c0519', fontFamily: 'serif', borderRadius: 'sm' }, // Elegant Serif
    fields: [
      { id: 'cm1', label: 'Full Name', type: 'text', required: true },
      { id: 'cm2', label: 'Date of Birth', type: 'text', placeholder: 'MM/DD/YYYY', required: true },
      { id: 'cm3', label: 'Phone Number', type: 'phone', required: true },
      { id: 'cm4', label: 'Residential Address', type: 'textarea', required: true },
      { id: 'cm5', label: 'Have you been baptized?', type: 'radio', options: ['Yes, by immersion', 'Yes, by sprinkling', 'No'], required: true },
      { id: 'cm6', label: 'Ministries of Interest', type: 'checkbox', options: ['Choir', 'Ushering', 'Sunday School', 'Outreach', 'Media/Tech'], required: false },
      { id: 'cm7', label: 'Previous Church (if any)', type: 'text', required: false }
    ]
  },
  'camp-registration': {
    category: 'Church',
    icon: 'camping',
    color: 'bg-green-600',
    title: "Camp Meeting Registration",
    description: "Register campers for retreats or summer camps, including medical and emergency info.",
    collectEmails: true,
    theme: { primaryColor: '#15803d', backgroundColor: '#f0fdf4', textColor: '#14532d', fontFamily: 'mono', borderRadius: 'none' }, // Forest Green
    fields: [
      { id: 'cr1', label: 'Camper Name', type: 'text', required: true },
      { id: 'cr2', label: 'Age', type: 'number', required: true },
      { id: 'cr3', label: 'Gender', type: 'select', options: ['Male', 'Female'], required: true },
      { id: 'cr4', label: 'Parent/Guardian Name', type: 'text', required: true },
      { id: 'cr5', label: 'Emergency Contact Phone', type: 'phone', required: true },
      { id: 'cr6', label: 'Medical Conditions / Allergies', type: 'textarea', placeholder: 'List any allergies or medications...', required: false },
      { id: 'cr7', label: 'T-Shirt Size', type: 'select', options: ['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'], required: true },
    ]
  },

  // --- Sales & Orders ---
  'product-order': {
    category: 'Sales',
    icon: 'shopping_cart',
    color: 'bg-blue-600',
    title: "Product Order Form",
    description: "Simple order form for customers to purchase products directly.",
    collectEmails: true,
    theme: { primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'md' }, // Ocean Blue
    fields: [
      { id: 'po1', label: 'Customer Name', type: 'text', required: true },
      { id: 'po2', label: 'Shipping Address', type: 'textarea', required: true },
      { id: 'po3', label: 'Select Product', type: 'select', options: ['Standard Package - $50', 'Premium Package - $100', 'Enterprise Bundle - $500'], required: true },
      { id: 'po4', label: 'Quantity', type: 'number', required: true },
      { id: 'po5', label: 'Preferred Delivery Date', type: 'date', required: false },
      { id: 'po6', label: 'Payment Method', type: 'radio', options: ['Credit Card', 'Bank Transfer', 'PayPal'], required: true }
    ]
  },
  'wholesale-inquiry': {
    category: 'Sales',
    icon: 'storefront',
    color: 'bg-amber-600',
    title: "Wholesale Inquiry",
    description: "Capture leads for bulk purchasing or distribution partners.",
    collectEmails: true,
    theme: { primaryColor: '#d97706', backgroundColor: '#fffbeb', textColor: '#451a03', fontFamily: 'serif', borderRadius: 'md' }, // Golden Hour
    fields: [
      { id: 'wi1', label: 'Company Name', type: 'text', required: true },
      { id: 'wi2', label: 'Contact Person', type: 'text', required: true },
      { id: 'wi3', label: 'Website URL', type: 'url', required: false },
      { id: 'wi4', label: 'Business Type', type: 'select', options: ['Retailer', 'Distributor', 'Online Store', 'Other'], required: true },
      { id: 'wi5', label: 'Tax ID / Reseller Number', type: 'text', required: true },
      { id: 'wi6', label: 'Estimated Monthly Volume', type: 'select', options: ['$0 - $1,000', '$1,000 - $10,000', '$10,000+'], required: false }
    ]
  },
  'quote-request': {
    category: 'Sales',
    icon: 'request_quote',
    color: 'bg-emerald-600',
    title: "Customer Quote Request",
    description: "Allow potential clients to request pricing for specific services.",
    collectEmails: true,
    theme: { primaryColor: '#334155', backgroundColor: '#f8fafc', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'sm' }, // Slate Corporate
    fields: [
      { id: 'qr1', label: 'Project Name', type: 'text', required: true },
      { id: 'qr2', label: 'Service Type', type: 'select', options: ['Consulting', 'Development', 'Design', 'Maintenance'], required: true },
      { id: 'qr3', label: 'Project Description', type: 'textarea', required: true },
      { id: 'qr4', label: 'Estimated Budget', type: 'select', options: ['<$1k', '$1k-$5k', '$5k-$20k', '$20k+'], required: true },
      { id: 'qr5', label: 'Deadline', type: 'date', required: false },
      { id: 'qr6', label: 'File Attachments (Specs/RFP)', type: 'file', required: false }
    ]
  },
  'service-booking': {
    category: 'Sales',
    icon: 'event_available',
    color: 'bg-teal-600',
    title: "Service Booking Form",
    description: "Schedule appointments or service calls.",
    collectEmails: true,
    theme: { primaryColor: '#059669', backgroundColor: '#ecfdf5', textColor: '#064e3b', fontFamily: 'sans', borderRadius: 'lg' }, // Mint Fresh
    fields: [
      { id: 'sb1', label: 'Client Name', type: 'text', required: true },
      { id: 'sb2', label: 'Phone Number', type: 'phone', required: true },
      { id: 'sb3', label: 'Service Required', type: 'select', options: ['Repair', 'Installation', 'Maintenance', 'Inspection'], required: true },
      { id: 'sb4', label: 'Preferred Date', type: 'date', required: true },
      { id: 'sb5', label: 'Preferred Time', type: 'time', required: true },
      { id: 'sb6', label: 'Address', type: 'textarea', required: true }
    ]
  },
  'demo-request': {
    category: 'Sales',
    icon: 'desktop_windows',
    color: 'bg-indigo-600',
    title: "Software Demo Request",
    description: "Capture interest for product demonstrations.",
    collectEmails: true,
    theme: { primaryColor: '#8b5cf6', backgroundColor: '#18181b', textColor: '#ffffff', fontFamily: 'sans', borderRadius: 'lg' }, // Dark Night
    fields: [
      { id: 'dr1', label: 'First Name', type: 'text', required: true },
      { id: 'dr2', label: 'Work Email', type: 'email', required: true },
      { id: 'dr3', label: 'Company URL', type: 'url', required: false },
      { id: 'dr4', label: 'Team Size', type: 'select', options: ['1-10', '11-50', '51-200', '201+'], required: true },
      { id: 'dr5', label: 'Primary Use Case', type: 'textarea', required: false }
    ]
  },

  // --- Education ---
  'workshop-registration': {
    category: 'Education',
    icon: 'school',
    color: 'bg-blue-500',
    title: "Workshop Registration",
    description: "Sign up form for educational seminars or classes.",
    collectEmails: true,
    theme: { primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'md' }, // Ocean Blue
    fields: [
      { id: 'wr1', label: 'Participant Name', type: 'text', required: true },
      { id: 'wr2', label: 'Institution/Organization', type: 'text', required: false },
      { id: 'wr3', label: 'Workshop Selection', type: 'select', options: ['Intro to AI', 'Advanced React', 'Data Science 101'], required: true },
      { id: 'wr4', label: 'Dietary Restrictions', type: 'text', required: false }
    ]
  },
  'course-evaluation': {
    category: 'Education',
    icon: 'rate_review',
    color: 'bg-indigo-400',
    title: "Course Evaluation",
    description: "Feedback form for students to rate courses and instructors.",
    collectEmails: false,
    theme: { primaryColor: '#78350f', backgroundColor: '#fff8f0', textColor: '#451a03', fontFamily: 'serif', borderRadius: 'sm' }, // Coffee House
    fields: [
      { id: 'ce1', label: 'Course Name', type: 'text', required: true },
      { id: 'ce2', label: 'Instructor Rating', type: 'radio', options: ['Excellent', 'Good', 'Average', 'Poor'], required: true },
      { id: 'ce3', label: 'Material Clarity', type: 'radio', options: ['Clear', 'Somewhat Clear', 'Unclear'], required: true },
      { id: 'ce4', label: 'Comments', type: 'textarea', required: false }
    ]
  },

  // --- HR ---
  'job-application': {
    category: 'HR',
    icon: 'work',
    color: 'bg-slate-700',
    title: "Job Application",
    description: "Standard application form for open positions.",
    collectEmails: true,
    theme: { primaryColor: '#334155', backgroundColor: '#f8fafc', textColor: '#0f172a', fontFamily: 'sans', borderRadius: 'sm' }, // Slate Corporate
    fields: [
      { id: 'ja1', label: 'Full Name', type: 'text', required: true },
      { id: 'ja2', label: 'LinkedIn Profile URL', type: 'url', required: false },
      { id: 'ja3', label: 'Position Applied For', type: 'text', required: true },
      { id: 'ja4', label: 'Resume / CV', type: 'file', required: true },
      { id: 'ja5', label: 'Cover Letter', type: 'textarea', required: false },
      { id: 'ja6', label: 'Availability Start Date', type: 'date', required: true }
    ]
  },
  'employee-satisfaction': {
    category: 'HR',
    icon: 'sentiment_satisfied',
    color: 'bg-pink-500',
    title: "Employee Satisfaction Survey",
    description: "Anonymous internal survey for team feedback.",
    collectEmails: false,
    theme: { primaryColor: '#f43f5e', backgroundColor: '#fff7ed', textColor: '#431407', fontFamily: 'sans', borderRadius: 'xl' }, // Sunset Vibes
    fields: [
      { id: 'es1', label: 'Department', type: 'select', options: ['Engineering', 'Sales', 'Marketing', 'Support'], required: true },
      { id: 'es2', label: 'How satisfied are you with your role?', type: 'radio', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'], required: true },
      { id: 'es3', label: 'Work-Life Balance Rating', type: 'select', options: ['1', '2', '3', '4', '5'], required: true },
      { id: 'es4', label: 'Suggestions for Improvement', type: 'textarea', required: false }
    ]
  },

  // --- Healthcare ---
  'patient-intake': {
    category: 'Healthcare',
    icon: 'medical_services',
    color: 'bg-teal-500',
    title: "Patient Intake Form",
    description: "New patient registration and medical history.",
    collectEmails: true,
    theme: { primaryColor: '#059669', backgroundColor: '#ecfdf5', textColor: '#064e3b', fontFamily: 'sans', borderRadius: 'lg' }, // Mint Fresh
    fields: [
      { id: 'pi1', label: 'Patient Name', type: 'text', required: true },
      { id: 'pi2', label: 'Date of Birth', type: 'date', required: true },
      { id: 'pi3', label: 'Insurance Provider', type: 'text', required: true },
      { id: 'pi4', label: 'Current Medications', type: 'textarea', required: false },
      { id: 'pi5', label: 'Reason for Visit', type: 'textarea', required: true }
    ]
  },
};

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = new Set(Object.values(TEMPLATES).map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredTemplates = useMemo(() => {
    return Object.entries(TEMPLATES).filter(([_, t]) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleUseTemplate = (template: GeneratedForm) => {
      navigate('/create', { state: { template } });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 text-center py-10 bg-black/5 dark:bg-white/5 rounded-2xl">
        <h1 className="text-4xl font-black tracking-tight">Template Gallery</h1>
        <p className="text-black/60 dark:text-white/60 max-w-2xl mx-auto">
          Jumpstart your form building with our collection of professionally designed templates.
        </p>
        
        <div className="max-w-md mx-auto w-full relative mt-4">
            <input 
                type="text" 
                placeholder="Search templates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 shadow-sm focus:ring-2 focus:ring-primary outline-none"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">search</span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(cat => (
            <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/5'}`}
            >
                {cat}
            </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map(([key, t]) => (
            <div key={key} className="group relative flex flex-col bg-white dark:bg-[#1e1e1e] rounded-xl border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`h-32 ${t.color} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    <span className="material-symbols-outlined text-6xl text-white opacity-50 transform group-hover:scale-110 transition-transform duration-500">{t.icon}</span>
                    <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {t.category}
                    </div>
                    {/* Theme Preview Dot */}
                    <div className="absolute bottom-3 right-3 size-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: t.theme?.primaryColor }}></div>
                </div>
                
                <div className="p-6 flex flex-col gap-3 flex-1">
                    <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{t.title}</h3>
                    <p className="text-sm text-black/60 dark:text-white/60 line-clamp-2 mb-4">{t.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold text-black/40 dark:text-white/40">{t.fields.length} Fields</span>
                        <button 
                            onClick={() => handleUseTemplate(t)}
                            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            Use Template <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
          <div className="text-center py-20 opacity-50">
              <span className="material-symbols-outlined text-6xl mb-4">sentiment_dissatisfied</span>
              <p className="text-xl font-bold">No templates found matching your search.</p>
          </div>
      )}
    </div>
  );
};

export default TemplatesPage;
