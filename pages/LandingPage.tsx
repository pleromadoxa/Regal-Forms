
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative w-full bg-background-light dark:bg-background-dark pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px] dark:bg-primary/10"></div>
            <div className="absolute right-[-10%] bottom-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-purple-500/20 opacity-20 blur-[120px] dark:bg-purple-900/20"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="flex flex-col gap-8 text-center lg:text-left lg:w-1/2 animate-fade-in">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide w-fit mx-auto lg:mx-0 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New: AI Form Generation
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-black dark:text-white">
                Build forms <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 dark:to-orange-200">
                  faster than ever.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-black/60 dark:text-white/60 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                The AI-powered form builder that turns your ideas into published forms in seconds. Drag, drop, and analyze with zero coding.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
                <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center h-14 px-8 bg-primary hover:bg-orange-600 text-white dark:text-black text-base font-bold rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Start Building Free
                </Link>
                <Link to="/preview" className="w-full sm:w-auto flex items-center justify-center h-14 px-8 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black dark:text-white text-base font-bold rounded-xl transition-all">
                  <span className="material-symbols-outlined mr-2 text-xl">play_circle</span>
                  View Demo
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-black/50 dark:text-white/50 font-medium pt-4">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-background-dark" />
                    ))}
                </div>
                <p>Loved by 10,000+ creators</p>
              </div>
            </div>

            {/* Right Visual (CSS Mockup) */}
            <div className="w-full lg:w-1/2 perspective-1000 animate-slide-in delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="relative w-full aspect-[4/3] rounded-2xl bg-white dark:bg-[#1e1e1e] border border-black/10 dark:border-white/10 shadow-2xl shadow-primary/10 overflow-hidden transform rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-700 ease-out">
                    {/* Mockup Header */}
                    <div className="h-10 border-b border-black/5 dark:border-white/5 flex items-center px-4 gap-2 bg-black/5 dark:bg-white/5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    
                    <div className="flex h-full">
                        {/* Mockup Sidebar */}
                        <div className="w-16 border-r border-black/5 dark:border-white/5 flex flex-col items-center py-4 gap-4 bg-black/[0.02] dark:bg-white/[0.02]">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-md bg-black/10 dark:bg-white/10"></div>
                            ))}
                        </div>
                        
                        {/* Mockup Canvas */}
                        <div className="flex-1 p-6 bg-background-light dark:bg-[#121212] relative">
                            <div className="w-3/4 h-8 bg-black/10 dark:bg-white/10 rounded mb-6"></div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-[#1e1e1e] shadow-sm">
                                    <div className="w-1/3 h-4 bg-black/10 dark:bg-white/10 rounded mb-3"></div>
                                    <div className="w-full h-10 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/5"></div>
                                </div>
                                <div className="p-4 rounded-lg border border-primary ring-2 ring-primary/20 bg-white dark:bg-[#1e1e1e] shadow-lg scale-[1.02] transition-transform">
                                    <div className="flex justify-between mb-3">
                                        <div className="w-1/4 h-4 bg-black/10 dark:bg-white/10 rounded"></div>
                                        <div className="w-4 h-4 bg-primary rounded-full"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-full h-10 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/5"></div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-[#1e1e1e] shadow-sm opacity-50">
                                    <div className="w-1/2 h-4 bg-black/10 dark:bg-white/10 rounded mb-3"></div>
                                    <div className="flex gap-2">
                                        <div className="w-4 h-4 rounded bg-black/10 dark:bg-white/10"></div>
                                        <div className="w-20 h-4 rounded bg-black/10 dark:bg-white/10"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute bottom-12 right-8 bg-white dark:bg-[#2a2a2a] p-3 rounded-lg shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 p-2 rounded-full">
                                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-black/50 dark:text-white/50">AI Status</div>
                                    <div className="text-sm font-bold">Form Generated</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
              { icon: "drag_indicator", title: "Drag-and-Drop Builder", desc: "Easily create any type of form with our user-friendly visual editor. No coding required.", link: "/create" },
              { icon: "analytics", title: "Smart Analytics", desc: "Gain valuable insights with powerful, real-time analytics and reporting dashboards.", link: "/analytics" },
              { icon: "dashboard_customize", title: "Customizable Templates", desc: "Start quickly with a wide range of professionally designed, fully customizable templates.", link: "/templates" },
              { icon: "hub", title: "Seamless Integrations", desc: "Connect your forms to the tools you already use, including CRMs, email marketing, and more.", link: "/integrations" },
            ].map((feature, i) => (
              <Link to={feature.link} key={i} className="flex flex-1 gap-4 rounded-xl border border-black/10 dark:border-white/10 bg-background-light dark:bg-background-dark p-6 flex-col hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-lg group">
                <div className="text-primary group-hover:scale-110 transition-transform duration-300 origin-left">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{feature.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-black/70 dark:text-white/70 text-sm font-normal leading-normal">{feature.desc}</p>
                </div>
              </Link>
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
                Use our drag-and-drop builder or start with a template to design the perfect form for your needs.
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
                Watch the results come in and use our built-in analytics to understand your data and make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-4 py-16 sm:py-24 container mx-auto">
        <div className="rounded-xl bg-primary/10 dark:bg-primary/10 p-10 lg:p-16 flex flex-col items-center text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">Ready to start building?</h2>
          <p className="mt-4 max-w-2xl text-lg text-black/70 dark:text-white/70">
            Create your first form today and see how easy data collection can be. No credit card required.
          </p>
          <Link to="/signup" className="mt-8 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-orange-600 text-white dark:text-black text-base font-bold transition-colors">
            <span className="truncate">Sign Up Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
