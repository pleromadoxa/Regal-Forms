import React from 'react';

// --- Privacy Policy ---
export const PrivacyPage: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-black/60 dark:text-white/60">Last updated: January 1, 2025</p>
      </div>
      
      <div className="prose dark:prose-invert max-w-none flex flex-col gap-6 text-black/80 dark:text-white/80">
        <p>
          At Regal Forms, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application.
        </p>
        
        <h3 className="text-xl font-bold text-black dark:text-white">1. Information We Collect</h3>
        <p>
          We collect information that you provide directly to us, such as when you create an account, create a form, or submit a form. This may include your name, email address, and the content of your forms and responses.
        </p>

        <h3 className="text-xl font-bold text-black dark:text-white">2. How We Use Your Information</h3>
        <p>
          We use the information we collect to provide, maintain, and improve our services, to process your transactions, to send you related information including confirmations and invoices, and to respond to your comments and questions.
        </p>

        <h3 className="text-xl font-bold text-black dark:text-white">3. Cookies</h3>
        <p>
          We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>

        <h3 className="text-xl font-bold text-black dark:text-white">4. Data Security</h3>
        <p>
          The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
        </p>
      </div>
    </div>
  );
};

// --- Terms of Service ---
export const TermsPage: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
        <p className="text-black/60 dark:text-white/60">Last updated: January 1, 2025</p>
      </div>
      
      <div className="prose dark:prose-invert max-w-none flex flex-col gap-6 text-black/80 dark:text-white/80">
        <p>
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Regal Forms website and application.
        </p>
        
        <h3 className="text-xl font-bold text-black dark:text-white">1. Acceptance of Terms</h3>
        <p>
          By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
        </p>

        <h3 className="text-xl font-bold text-black dark:text-white">2. Accounts</h3>
        <p>
          When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>

        <h3 className="text-xl font-bold text-black dark:text-white">3. Content</h3>
        <p>
          Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
        </p>

        <h3 className="text-xl font-bold text-black dark:text-white">4. Termination</h3>
        <p>
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </div>
    </div>
  );
};
