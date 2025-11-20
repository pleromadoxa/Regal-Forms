
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneratedForm, FormField } from '../types';

// --- Template Library Data ---
const TEMPLATES: Record<string, GeneratedForm & { category: string; icon: string; color: string }> = {
  // --- Church & Ministry ---
  'church-membership': {
    category: 'Church',
    icon: 'church',
    color: 'bg-indigo-500',
    title: "Church Membership Application",
    description: "Collect details from individuals wishing to join your church congregation.",
    collectEmails: true,
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

  // --- Sales & Orders (20 Templates) ---
  'product-order': {
    category: 'Sales',
    icon: 'shopping_cart',
    color: 'bg-blue-600',
    title: "Product Order Form",
    description: "Simple order form for customers to purchase products directly.",
    collectEmails: true,
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
    fields: [
      { id: 'wi1', label: 'Company Name', type: 'text', required: true },
      { id: 'wi2', label: 'Contact Person', type: 'text', required: true },
      { id: 'wi3', label: 'Website URL', type: 'url', required: false },
      { id: 'wi4', label: 'Business Type', type: 'select', options: ['Retailer', 'Distributor', 'Online Store', 'Other'], required: true },
      { id: 'wi5', label: 'Tax ID / Reseller Number', type: 'text', required: true },
      { id: 'wi6', label: 'Estimated Monthly Volume', type: 'select', options: ['$0 - $1,000', '$1,000 - $10,000', '$10,000+'], required: false }
    ]
  },
  'sales-call-script': {
    category: 'Sales',
    icon: 'call',
    color: 'bg-purple-600',
    title: "Sales Call Script & Log",
    description: "A form for sales reps to log call details and follow specific script points.",
    collectEmails: false,
    fields: [
      { id: 'sc1', label: 'Lead Name', type: 'text', required: true },
      { id: 'sc2', label: 'Call Outcome', type: 'select', options: ['Connected', 'Voicemail', 'Gatekeeper', 'Not Interested', 'Meeting Booked'], required: true },
      { id: 'sc3', label: 'Pain Points Identified', type: 'checkbox', options: ['Budget', 'Timing', 'Features', 'Competitor'], required: false },
      { id: 'sc4', label: 'Call Notes', type: 'textarea', required: true },
      { id: 'sc5', label: 'Follow-up Date', type: 'date', required: false }
    ]
  },
  'quote-request': {
    category: 'Sales',
    icon: 'request_quote',
    color: 'bg-emerald-600',
    title: "Customer Quote Request",
    description: "Allow potential clients to request pricing for specific services.",
    collectEmails: true,
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
    fields: [
      { id: 'sb1', label: 'Client Name', type: 'text', required: true },
      { id: 'sb2', label: 'Phone Number', type: 'phone', required: true },
      { id: 'sb3', label: 'Service Required', type: 'select', options: ['Repair', 'Installation', 'Maintenance', 'Inspection'], required: true },
      { id: 'sb4', label: 'Preferred Date', type: 'date', required: true },
      { id: 'sb5', label: 'Preferred Time', type: 'time', required: true },
      { id: 'sb6', label: 'Address', type: 'textarea', required: true }
    ]
  },
  'product-feedback': {
    category: 'Sales',
    icon: 'thumbs_up_down',
    color: 'bg-rose-500',
    title: "Product Feedback Survey",
    description: "Gather post-purchase feedback to improve sales offerings.",
    collectEmails: true,
    fields: [
      { id: 'pf1', label: 'Product Purchased', type: 'text', required: true },
      { id: 'pf2', label: 'Overall Satisfaction', type: 'radio', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'], required: true },
      { id: 'pf3', label: 'What did you like most?', type: 'textarea', required: false },
      { id: 'pf4', label: 'How can we improve?', type: 'textarea', required: false },
      { id: 'pf5', label: 'Would you recommend us?', type: 'radio', options: ['Yes', 'No'], required: true }
    ]
  },
  'lead-qualification': {
    category: 'Sales',
    icon: 'filter_alt',
    color: 'bg-cyan-600',
    title: "Lead Qualification Form",
    description: "Qualify incoming leads based on budget, authority, need, and timeline (BANT).",
    collectEmails: true,
    fields: [
      { id: 'lq1', label: 'Company', type: 'text', required: true },
      { id: 'lq2', label: 'Role', type: 'text', required: true },
      { id: 'lq3', label: 'Timeline for Implementation', type: 'select', options: ['Immediate', '1-3 Months', '3-6 Months', '6+ Months'], required: true },
      { id: 'lq4', label: 'Budget Status', type: 'radio', options: ['Approved', 'Pending Approval', 'Not Allocated'], required: true },
      { id: 'lq5', label: 'Decision Making Process', type: 'textarea', required: false }
    ]
  },
  'demo-request': {
    category: 'Sales',
    icon: 'desktop_windows',
    color: 'bg-indigo-600',
    title: "Software Demo Request",
    description: "Capture interest for product demonstrations.",
    collectEmails: true,
    fields: [
      { id: 'dr1', label: 'First Name', type: 'text', required: true },
      { id: 'dr2', label: 'Work Email', type: 'email', required: true },
      { id: 'dr3', label: 'Company URL', type: 'url', required: false },
      { id: 'dr4', label: 'Team Size', type: 'select', options: ['1-10', '11-50', '51-200', '201+'], required: true },
      { id: 'dr5', label: 'Primary Use Case', type: 'textarea', required: false }
    ]
  },
  'affiliate-app': {
    category: 'Sales',
    icon: 'handshake',
    color: 'bg-orange-600',
    title: "Affiliate Application",
    description: "Recruit partners to sell your products.",
    collectEmails: true,
    fields: [
      { id: 'aa1', label: 'Applicant Name', type: 'text', required: true },
      { id: 'aa2', label: 'Website / Blog URL', type: 'url', required: true },
      { id: 'aa3', label: 'Social Media Handles', type: 'text', required: false },
      { id: 'aa4', label: 'Promotion Method', type: 'checkbox', options: ['SEO', 'Paid Ads', 'Email List', 'Social Media'], required: true },
      { id: 'aa5', label: 'Estimated Audience Size', type: 'select', options: ['<1k', '1k-10k', '10k-50k', '50k+'], required: true }
    ]
  },
  'distributor-app': {
    category: 'Sales',
    icon: 'local_shipping',
    color: 'bg-slate-600',
    title: "Distributor Application",
    description: "Vet potential distributors for your goods.",
    collectEmails: true,
    fields: [
      { id: 'da1', label: 'Company Legal Name', type: 'text', required: true },
      { id: 'da2', label: 'Years in Business', type: 'number', required: true },
      { id: 'da3', label: 'Warehousing Capabilities', type: 'textarea', required: true },
      { id: 'da4', label: 'Territory Covered', type: 'text', required: true },
      { id: 'da5', label: 'Upload Business License', type: 'file', required: true }
    ]
  },
  'presales-questionnaire': {
    category: 'Sales',
    icon: 'quiz',
    color: 'bg-violet-600',
    title: "Pre-Sales Questionnaire",
    description: "Gather requirements before a sales meeting.",
    collectEmails: true,
    fields: [
      { id: 'pq1', label: 'Current Solution Used', type: 'text', required: false },
      { id: 'pq2', label: 'Top 3 Challenges', type: 'textarea', required: true },
      { id: 'pq3', label: 'Number of Users', type: 'number', required: true },
      { id: 'pq4', label: 'Key Integrations Needed', type: 'text', required: false },
      { id: 'pq5', label: 'Success Criteria', type: 'textarea', required: false }
    ]
  },
  'event-vendor': {
    category: 'Sales',
    icon: 'store',
    color: 'bg-pink-600',
    title: "Event Vendor Application",
    description: "Sell booth space for trade shows or markets.",
    collectEmails: true,
    fields: [
      { id: 'ev1', label: 'Business Name', type: 'text', required: true },
      { id: 'ev2', label: 'Product Category', type: 'select', options: ['Food', 'Crafts', 'Apparel', 'Tech', 'Service'], required: true },
      { id: 'ev3', label: 'Booth Size Needed', type: 'select', options: ['10x10', '10x20', '20x20'], required: true },
      { id: 'ev4', label: 'Electricity Required?', type: 'radio', options: ['Yes', 'No'], required: true },
      { id: 'ev5', label: 'Setup Date', type: 'date', required: true }
    ]
  },
  'sponsorship-request': {
    category: 'Sales',
    icon: 'volunteer_activism',
    color: 'bg-red-600',
    title: "Sponsorship Request Form",
    description: "Inbound requests for donations or sponsorships.",
    collectEmails: true,
    fields: [
      { id: 'sr1', label: 'Organization Name', type: 'text', required: true },
      { id: 'sr2', label: 'Event Name', type: 'text', required: true },
      { id: 'sr3', label: 'Event Date', type: 'date', required: true },
      { id: 'sr4', label: 'Sponsorship Level Requested', type: 'select', options: ['Bronze ($500)', 'Silver ($1000)', 'Gold ($5000)'], required: true },
      { id: 'sr5', label: 'Audience Demographics', type: 'textarea', required: false }
    ]
  },
  'custom-order': {
    category: 'Sales',
    icon: 'palette',
    color: 'bg-fuchsia-600',
    title: "Custom Order Request",
    description: "For bespoke products like cakes, furniture, or art.",
    collectEmails: true,
    fields: [
      { id: 'co1', label: 'Item Description', type: 'text', required: true },
      { id: 'co2', label: 'Reference Image', type: 'image', required: false },
      { id: 'co3', label: 'Dimensions/Size', type: 'text', required: true },
      { id: 'co4', label: 'Specific Colors/Materials', type: 'textarea', required: false },
      { id: 'co5', label: 'Budget Range', type: 'text', required: true },
      { id: 'co6', label: 'Date Needed By', type: 'date', required: true }
    ]
  },
  'returning-customer': {
    category: 'Sales',
    icon: 'history',
    color: 'bg-lime-600',
    title: "Returning Customer Fast Order",
    description: "Simplified order form for repeat clients.",
    collectEmails: true,
    fields: [
      { id: 'rc1', label: 'Account Number / Customer ID', type: 'text', required: true },
      { id: 'rc2', label: 'Re-order Previous Items?', type: 'radio', options: ['Yes, exact same', 'Yes, but with changes', 'No, new order'], required: true },
      { id: 'rc3', label: 'Items to Order', type: 'textarea', required: true },
      { id: 'rc4', label: 'PO Number', type: 'text', required: false }
    ]
  },
  'bulk-order': {
    category: 'Sales',
    icon: 'inventory_2',
    color: 'bg-amber-700',
    title: "Bulk Order Form",
    description: "Order form optimized for large quantities.",
    collectEmails: true,
    fields: [
      { id: 'bo1', label: 'Organization', type: 'text', required: true },
      { id: 'bo2', label: 'Shipping Destination', type: 'select', options: ['Domestic', 'International'], required: true },
      { id: 'bo3', label: 'SKU List (CSV Upload preferred)', type: 'file', required: false },
      { id: 'bo4', label: 'Or List Items Here', type: 'textarea', placeholder: 'SKU, Qty\nSKU, Qty', required: false },
      { id: 'bo5', label: 'Requested Delivery Date', type: 'date', required: true }
    ]
  },
  'sales-report': {
    category: 'Sales',
    icon: 'assessment',
    color: 'bg-sky-600',
    title: "Sales Rep Daily Report",
    description: "Internal form for sales teams to track activity.",
    collectEmails: true,
    fields: [
      { id: 'rp1', label: 'Date', type: 'date', required: true },
      { id: 'rp2', label: 'Calls Made', type: 'number', required: true },
      { id: 'rp3', label: 'Emails Sent', type: 'number', required: true },
      { id: 'rp4', label: 'Meetings Held', type: 'number', required: true },
      { id: 'rp5', label: 'Deals Closed ($)', type: 'number', required: true },
      { id: 'rp6', label: 'Key Blockers', type: 'textarea', required: false }
    ]
  },
  'competitor-analysis': {
    category: 'Sales',
    icon: 'visibility',
    color: 'bg-gray-600',
    title: "Competitor Analysis Input",
    description: "Field intelligence gathering form.",
    collectEmails: true,
    fields: [
      { id: 'ca1', label: 'Competitor Name', type: 'text', required: true },
      { id: 'ca2', label: 'Product/Service Analyzed', type: 'text', required: true },
      { id: 'ca3', label: 'Pricing Observed', type: 'text', required: false },
      { id: 'ca4', label: 'Strengths', type: 'textarea', required: true },
      { id: 'ca5', label: 'Weaknesses', type: 'textarea', required: true },
      { id: 'ca6', label: 'Customer Sentiment', type: 'select', options: ['Positive', 'Neutral', 'Negative'], required: false }
    ]
  },
  'churn-survey': {
    category: 'Sales',
    icon: 'exit_to_app',
    color: 'bg-red-500',
    title: "Cancellation / Churn Survey",
    description: "Understand why customers are leaving.",
    collectEmails: true,
    fields: [
      { id: 'cs1', label: 'Reason for Cancellation', type: 'select', options: ['Too expensive', 'Missing features', 'Found better alternative', 'No longer needed', 'Poor support'], required: true },
      { id: 'cs2', label: 'Which competitor did you choose?', type: 'text', required: false },
      { id: 'cs3', label: 'What could we have done better?', type: 'textarea', required: true },
      { id: 'cs4', label: 'How likely are you to return?', type: 'radio', options: ['Likely', 'Unlikely', 'Never'], required: true }
    ]
  },
  'client-onboarding': {
    category: 'Sales',
    icon: 'flight_takeoff',
    color: 'bg-emerald-500',
    title: "New Client Onboarding",
    description: "Collect initial assets and info after closing a sale.",
    collectEmails: true,
    fields: [
      { id: 'no1', label: 'Primary Point of Contact', type: 'text', required: true },
      { id: 'no2', label: 'Billing Contact Email', type: 'email', required: true },
      { id: 'no3', label: 'Brand Guidelines / Logo Upload', type: 'file', required: false },
      { id: 'no4', label: 'Access Credentials (if needed)', type: 'textarea', required: false },
      { id: 'no5', label: 'Target Launch Date', type: 'date', required: true }
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
    fields: [
      { id: 'ce1', label: 'Course Name', type: 'text', required: true },
      { id: 'ce2', label: 'Instructor Rating', type: 'radio', options: ['Excellent', 'Good', 'Average', 'Poor'], required: true },
      { id: 'ce3', label: 'Material Clarity', type: 'radio', options: ['Clear', 'Somewhat Clear', 'Unclear'], required: true },
      { id: 'ce4', label: 'Comments', type: 'textarea', required: false }
    ]
  },

  // --- Business & HR ---
  'job-application': {
    category: 'HR',
    icon: 'work',
    color: 'bg-slate-700',
    title: "Job Application",
    description: "Standard application form for open positions.",
    collectEmails: true,
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
