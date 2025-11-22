
import React from 'react';
import { Link } from 'react-router-dom';

// Shared Layout Component for Legal Pages
const LegalLayout: React.FC<{ title: string; updated: string; children: React.ReactNode }> = ({ title, updated, children }) => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
            {/* Header Banner */}
            <div className="relative bg-[#0f172a] text-white py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <Link to="/" className="inline-flex items-center gap-1 text-white/60 hover:text-white mb-6 text-sm font-bold transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{title}</h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/80 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-sm">update</span>
                        Last Updated: {updated}
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20 pb-20">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-black/5 dark:border-white/5 p-8 md:p-12">
                    <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-black dark:prose-headings:text-white prose-p:text-black/70 dark:prose-p:text-white/70 prose-li:text-black/70 dark:prose-li:text-white/70 prose-a:text-primary hover:prose-a:text-orange-600">
                        {children}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col items-center text-center gap-4">
                        <p className="text-black/60 dark:text-white/60 font-medium">Have questions about our {title}?</p>
                        <Link to="/contact" className="px-6 py-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-sm transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined">mail</span> Contact Legal Team
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Privacy Policy ---
export const PrivacyPage: React.FC = () => {
  return (
    <LegalLayout title="Privacy Policy" updated="January 1, 2025">
        <p className="lead text-lg font-medium text-black/80 dark:text-white/80 mb-8">
          At Regal Forms, operated by Regal Network Technologies, we prioritize your privacy. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of your information when you use our services.
        </p>
        
        <h3>1. Information We Collect</h3>
        <p>We collect information to provide better services to all our users. This includes:</p>
        <ul>
            <li><strong>Account Information:</strong> When you sign up, we collect your name, email address, and password.</li>
            <li><strong>Usage Data:</strong> We collect information about how you use our services, such as the forms you create and the features you use.</li>
            <li><strong>Form Data:</strong> We store the content of the forms you create and the responses you receive. You retain ownership of this data.</li>
        </ul>

        <h3>2. How We Use Your Information</h3>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
            <li>To provide, maintain, and improve our services.</li>
            <li>To process your transactions and manage your account.</li>
            <li>To communicate with you about products, services, offers, promotions, and events.</li>
            <li>To monitor and analyze trends, usage, and activities in connection with our services.</li>
        </ul>

        <h3>3. Data Storage and Security</h3>
        <p>
          We use industry-standard encryption (TLS 1.2+) to protect your data during transmission. Your data is stored in secure data centers with restricted access. While we strive to protect your personal data, we cannot guarantee its absolute security.
        </p>

        <h3>4. Sharing of Information</h3>
        <p>
          We do not share your personal information with third parties except as described in this policy. We may share information with:
        </p>
        <ul>
            <li><strong>Service Providers:</strong> Third-party vendors who need access to your information to carry out work on our behalf (e.g., payment processing via Stripe).</li>
            <li><strong>Legal Compliance:</strong> If required by law or in response to valid requests by public authorities.</li>
        </ul>

        <h3>5. Your Rights</h3>
        <p>
          Depending on your location, you may have rights regarding your personal information, including the right to access, correct, delete, or restrict the use of your data. You can manage your data directly from your account settings.
        </p>

        <h3>6. Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, providing you with additional notice.
        </p>
    </LegalLayout>
  );
};

// --- Terms of Service ---
export const TermsPage: React.FC = () => {
  return (
    <LegalLayout title="Terms of Service" updated="January 1, 2025">
        <p className="lead text-lg font-medium text-black/80 dark:text-white/80 mb-8">
          Welcome to Regal Forms! These Terms of Service ("Terms") govern your access to and use of our website, products, and services. By accessing or using our Services, you agree to be bound by these Terms.
        </p>
        
        <h3>1. Acceptance of Terms</h3>
        <p>
          By creating an account or using Regal Forms, you agree to comply with these Terms. If you are using the Services on behalf of an organization, you are agreeing to these Terms for that organization and promising that you have the authority to bind that organization to these terms.
        </p>

        <h3>2. Account Responsibilities</h3>
        <p>
          You are responsible for maintaining the security of your account and password. Regal Forms cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You are responsible for all content posted and activity that occurs under your account.
        </p>

        <h3>3. Use of Services</h3>
        <p>You agree not to misuse the Regal Forms services. For example, you must not:</p>
        <ul>
            <li>Probe, scan, or test the vulnerability of any system or network.</li>
            <li>Breach or otherwise circumvent any security or authentication measures.</li>
            <li>Use the services to send unsolicited communications, promotions, or advertisements (spam).</li>
            <li>Collect sensitive personal information (like credit card numbers) without proper security measures.</li>
        </ul>

        <h3>4. Intellectual Property</h3>
        <p>
          Regal Forms and its original content, features, and functionality are and will remain the exclusive property of Regal Network Technologies and its licensors. The content you create (Forms and Responses) remains yours.
        </p>

        <h3>5. Termination</h3>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
        </p>

        <h3>6. Limitation of Liability</h3>
        <p>
          In no event shall Regal Forms, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>

        <h3>7. Governing Law</h3>
        <p>
          These Terms shall be governed and construed in accordance with the laws of Ghana, without regard to its conflict of law provisions.
        </p>
    </LegalLayout>
  );
};
