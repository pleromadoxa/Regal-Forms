import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="py-16 sm:py-24 container mx-auto px-4 md:px-10">
        <div className="flex flex-col-reverse gap-10 @[864px]:flex-row items-center md:flex-row">
          <div className="flex flex-col gap-6 text-center md:text-left md:w-1/2">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl lg:text-6xl">
                Create Powerful Forms, <span className="text-primary">Effortlessly.</span>
              </h1>
              <p className="text-black/70 dark:text-white/70 text-base font-normal leading-normal md:text-lg">
                Build, share, and analyze beautiful, responsive forms with our intuitive drag-and-drop builder. 
                Experience the power of AI generation.
              </p>
            </div>
            <div className="flex justify-center md:justify-start">
              <Link to="/create" className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-orange-600 transition-all text-white dark:text-black text-base font-bold shadow-lg shadow-primary/20">
                Get Started Free
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div 
              className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl shadow-2xl border border-white/10"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDCLfl_s6kQtDXZHD1n9GQRLsJJr7kdO7Xk4YiH2RK9dInA6BNRqqwuA_yqVsHc7SyN5vROaMvb68MIYufDXuba7bLZO9Y2wBsYqP6aW7QJjNHZQPBcFKfk_3iFNmYa6dy0HQWtpbQ3nGWpa3CUOi6PRIBwfkZUV-JjQZRNgaFfub86uwWt2IVdfIRnSkmASfD6s9MEheYCa4Ek4mEi_kQY59ZxGigYiavY0a2BWHdFkEXIbh-bFPaqkt_ebazbDyqnQQschGoJyuE')" }}
              aria-label="Abstract gradient"
            ></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="flex flex-col gap-10 px-4 py-16 sm:py-24 bg-black/5 dark:bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold leading-tight md:text-4xl md:font-black">Everything you need to succeed</h2>
            <p className="text-black/70 dark:text-white/70 text-base font-normal leading-normal max-w-2xl mx-auto">
              Explore the features that make Regal Forms the best choice for capturing data and gathering insights.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "drag_indicator", title: "Drag-and-Drop", desc: "Easily create any type of form with our user-friendly visual editor." },
              { icon: "analytics", title: "Smart Analytics", desc: "Gain valuable insights with powerful, real-time analytics dashboards." },
              { icon: "dashboard_customize", title: "AI Generation", desc: "Describe your form and let our Gemini-powered AI build it for you." },
              { icon: "hub", title: "Integrations", desc: "Connect your forms to the tools you already use like Slack and Notion." },
            ].map((feature, i) => (
              <div key={i} className="flex flex-1 gap-4 rounded-xl border border-black/10 dark:border-white/10 bg-background-light dark:bg-background-dark p-6 flex-col hover:-translate-y-1 transition-transform duration-300 shadow-sm">
                <div className="text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{feature.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold leading-tight">{feature.title}</h3>
                  <p className="text-black/70 dark:text-white/70 text-sm font-normal leading-normal">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4 py-16 sm:py-24 container mx-auto max-w-4xl">
        <div className="flex flex-col gap-12">
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-center">How It Works</h2>
          <div className="grid grid-cols-[40px_1fr] gap-x-6">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="bg-primary/20 rounded-full p-2 text-primary flex items-center justify-center size-10">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <div className="w-[2px] bg-black/10 dark:bg-white/10 h-full min-h-[40px]"></div>
            </div>
            <div className="flex flex-1 flex-col pb-12">
              <p className="text-lg font-bold leading-normal">1. Create Your Form</p>
              <p className="text-black/70 dark:text-white/70 text-base font-normal leading-normal mt-1">
                Use our AI prompt or drag-and-drop builder to design the perfect form for your needs in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="bg-primary/20 rounded-full p-2 text-primary flex items-center justify-center size-10">
                <span className="material-symbols-outlined">share</span>
              </div>
              <div className="w-[2px] bg-black/10 dark:bg-white/10 h-full min-h-[40px]"></div>
            </div>
            <div className="flex flex-1 flex-col pb-12">
              <p className="text-lg font-bold leading-normal">2. Share & Collect</p>
              <p className="text-black/70 dark:text-white/70 text-base font-normal leading-normal mt-1">
                Embed your form on your website or share a direct link to start collecting responses immediately.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="bg-primary/20 rounded-full p-2 text-primary flex items-center justify-center size-10">
                <span className="material-symbols-outlined">query_stats</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col pb-4">
              <p className="text-lg font-bold leading-normal">3. Analyze Results</p>
              <p className="text-black/70 dark:text-white/70 text-base font-normal leading-normal mt-1">
                Watch the results come in and use our built-in analytics to understand your data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-4 py-16 sm:py-24 bg-black/5 dark:bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-12">
            <div className="text-center max-w-2xl">
              <h2 className="text-3xl font-bold leading-tight tracking-tight">Loved by teams around the world</h2>
              <p className="mt-4 text-black/70 dark:text-white/70 text-base">See what our users have to say about their experience with Regal Forms.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {[
                {
                  text: "Regal Forms transformed how we collect feedback. It's incredibly intuitive and the analytics are a game-changer.",
                  name: "Sarah L.",
                  role: "Marketing Manager",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_vRsdNavYuMP71gbx2fhSFTQeKKVpIy8YZlFLqXu0y_WkzWLmd64E6Byht0duQQ3yMP3E4yrgUlGLRxJEBSE5ghS3XWnBsTkMwHzQDdxfo-rh-fllo5tip5tGVkcB0s07IWxNMbdO5uH6DGqyWRT2rI9K9a7TKIsNMd-YS65HXrF4MDUJYiCPmr6W7r5D4rE2ClHsU5DgtdOMLtXuNL7fUQ0hYnuS3O9Jqzlh7_kxnoFjR7uRjDjb2XVZxq2ry-grMDv7PX5ROoM"
                },
                {
                  text: "As a small business owner, I need tools that are powerful yet simple. Regal Forms is exactly that. I set up my first contact form in under 5 minutes!",
                  name: "David Chen",
                  role: "Business Owner",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHOhVTPz8kaNeZ1l-Zms3l_g8VckIoYmAx3BHbTWOO4yxel9elIuOeXeVuCGclS5wWN9FLwOAALh5FZZaB9AE2qecN8b8LXWP_TkXq7pOvybOq7ZTI9U5MGbdib01vzwBKCUQYkGsM-CPY1c5ZYVtW9-eXDaEoIlZFSn6E93nUjuTyW56i-i9IolDRjg5jMLapL04AI7RROT-82HQ-t_zAWdkNdny3oka62ahH9Gf9MpA7Enia5Dy9_WtXic4s4X1cq5mC3ycRKTA"
                },
                {
                  text: "The AI generation capability is fantastic. I just typed 'Event Registration' and it built the perfect form for me instantly.",
                  name: "Maria Rodriguez",
                  role: "Operations Specialist",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGy-of8w-P5hXpFCC5R20eDR4E7DhYjzMdhTVHJWlysH5hdIxZYDZmW-pSbhidpv6OvINM7jxThidpn1CN7tOWnQOC7FU1slHS2-hA7-rb7K1_H_j0sIhjcZNz6q8Iv8dxNsGkjsN2mK_Q-_IqgEk3W_iV67gKqIQEJpFwpBXZPjXoS-pPfUeRFTY4_AmaMUZEnfF3QWLcADYrogpS1AtP6DAJ_h50W3BO_11xaRoYuZYdqBI0gf0p3fepzjH0Yck-uQMpT0b8Z1A"
                }
              ].map((t, i) => (
                <div key={i} className="flex flex-col gap-4 rounded-xl p-6 border border-black/10 dark:border-white/10 bg-background-light dark:bg-background-dark shadow-sm">
                  <p className="text-black/80 dark:text-white/80 italic">"{t.text}"</p>
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                    <img className="h-12 w-12 rounded-full object-cover" alt={t.name} src={t.img} />
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-sm text-black/60 dark:text-white/60">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-4 py-16 sm:py-24 container mx-auto">
        <div className="rounded-xl bg-primary/10 dark:bg-primary/10 border border-primary/20 p-10 lg:p-16 flex flex-col items-center text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to start building?</h2>
          <p className="mt-4 max-w-2xl text-lg text-black/70 dark:text-white/70">
            Create your first form today with our AI assistant. No credit card required.
          </p>
          <Link to="/create" className="mt-8 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-orange-600 text-white dark:text-black text-base font-bold transition-colors">
            <span className="truncate">Try AI Builder</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;