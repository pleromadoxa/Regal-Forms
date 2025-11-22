
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="w-full overflow-hidden">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slide-in {
            animation: slideInRight 0.8s ease-out forwards;
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        .perspective-1000 {
            perspective: 1000px;
        }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>

      {/* Hero Section */}
      <div className="relative w-full bg-background-light dark:bg-background-dark pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-secondary/20 opacity-30 blur-[100px]"></div>
            <div className="absolute right-[-10%] bottom-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-primary/20 opacity-20 blur-[120px]"></div>
            <div className="absolute left-[-5%] bottom-[20%] -z-10 h-[200px] w-[200px] rounded-full bg-secondary/10 opacity-40 blur-[80px]"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="flex flex-col gap-8 text-center lg:text-left lg:w-1/2 animate-fade-in">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wide w-fit mx-auto lg:mx-0 border border-secondary/20 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                New: AI Form Generation
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-black dark:text-white">
                Build forms <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-blue-400">
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
                <Link to="/preview" className="w-full sm:w-auto flex items-center justify-center h-14 px-8 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black dark:text-white text-base font-bold rounded-xl transition-all backdrop-blur-md">
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

            {/* Right Visual (Vector Form Illustration) */}
            <div className="w-full lg:w-1/2 perspective-1000 animate-slide-in delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center animate-float">
                    
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-10">
                        {/* Vector Form Card */}
                        <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden transform rotate-[-6deg] hover:rotate-0 transition-all duration-700 ease-out group">
                            
                            {/* Form Header */}
                            <div className="h-14 bg-white dark:bg-[#222] border-b border-black/5 dark:border-white/5 flex items-center px-6 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                                </div>
                                <div className="flex-1 flex justify-center">
                                     <div className="h-2 w-24 bg-black/5 dark:bg-white/10 rounded-full"></div>
                                </div>
                            </div>

                            {/* Form Body */}
                            <div className="p-8 flex flex-col gap-6 bg-gradient-to-b from-white to-gray-50 dark:from-[#1a1a1a] dark:to-[#151515]">
                                
                                {/* Field 1 */}
                                <div className="space-y-2">
                                    <div className="h-2.5 w-20 bg-black/10 dark:bg-white/10 rounded-full"></div>
                                    <div className="h-10 w-full bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-lg shadow-sm"></div>
                                </div>

                                 {/* Field 2 */}
                                <div className="space-y-2">
                                    <div className="h-2.5 w-32 bg-black/10 dark:bg-white/10 rounded-full"></div>
                                     <div className="flex gap-2">
                                         <div className="h-10 flex-1 bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-lg shadow-sm"></div>
                                         <div className="h-10 flex-1 bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-lg shadow-sm"></div>
                                     </div>
                                </div>

                                {/* Field 3 (Checkboxes) */}
                                <div className="space-y-3">
                                    <div className="h-2.5 w-24 bg-black/10 dark:bg-white/10 rounded-full"></div>
                                    <div className="flex items-center gap-3">
                                         <div className="w-5 h-5 rounded border border-primary bg-primary/10 flex items-center justify-center text-primary">
                                             <span className="material-symbols-outlined text-sm font-bold">check</span>
                                         </div>
                                         <div className="h-2 w-40 bg-black/5 dark:bg-white/5 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                         <div className="w-5 h-5 rounded border border-black/10 dark:border-white/10"></div>
                                         <div className="h-2 w-32 bg-black/5 dark:bg-white/5 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <div className="h-12 w-full bg-primary rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center transform group-hover:scale-[1.02] transition-transform">
                                         <div className="h-2.5 w-24 bg-white/90 rounded-full"></div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Floating Badge: AI Gen */}
                        <div className="absolute top-20 -right-2 sm:right-0 md:-right-6 bg-white dark:bg-[#252525] p-3 sm:p-4 rounded-xl shadow-xl border border-white/20 animate-bounce z-20 backdrop-blur-md" style={{ animationDuration: '3.5s' }}>
                            <div className="flex items-center gap-3">
                                 <div className="size-10 rounded-full bg-gradient-to-br from-secondary to-purple-600 flex items-center justify-center text-white shadow-lg">
                                     <span className="material-symbols-outlined">auto_awesome</span>
                                 </div>
                                 <div>
                                     <div className="h-2 w-16 bg-black/20 dark:bg-white/20 rounded-full mb-1.5"></div>
                                     <div className="h-2 w-8 bg-secondary/50 rounded-full"></div>
                                 </div>
                            </div>
                        </div>

                         {/* Floating Badge: Analytics */}
                         <div className="absolute bottom-20 -left-2 sm:left-0 md:-left-6 bg-white dark:bg-[#252525] p-3 sm:p-4 rounded-xl shadow-xl border border-white/20 animate-bounce z-20 backdrop-blur-md" style={{ animationDuration: '4.5s', animationDelay: '1s' }}>
                            <div className="flex flex-col gap-2">
                                 <div className="flex items-center gap-2 mb-1">
                                     <div className="size-6 rounded bg-green-100 dark:bg-green-900/30 text-green-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm font-bold">trending_up</span>
                                     </div>
                                     <div className="h-2 w-20 bg-black/20 dark:bg-white/20 rounded-full"></div>
                                 </div>
                                 <div className="flex items-end gap-1 h-8 pl-1">
                                     <div className="w-2 bg-green-500/30 h-3 rounded-t"></div>
                                     <div className="w-2 bg-green-500/50 h-5 rounded-t"></div>
                                     <div className="w-2 bg-green-500/70 h-4 rounded-t"></div>
                                     <div className="w-2 bg-green-500 h-8 rounded-t"></div>
                                 </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative Background Blurs */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full blur-[80px] -z-10 opacity-60 scale-90"></div>
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
              <Link to={feature.link} key={i} className="flex flex-1 gap-4 rounded-xl border border-black/10 dark:border-white/10 bg-background-light dark:bg-background-dark p-6 flex-col hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-lg group hover:border-secondary/50">
                <div className="text-primary group-hover:text-secondary group-hover:scale-110 transition-all duration-300 origin-left">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{feature.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold leading-tight group-hover:text-secondary transition-colors">{feature.title}</h3>
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
              <div className="bg-secondary/10 rounded-full p-2 text-secondary flex items-center justify-center size-10 ring-1 ring-secondary/20">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <div className="w-[2px] bg-gradient-to-b from-secondary/50 to-transparent h-full min-h-[40px]"></div>
            </div>
            <div className="flex flex-1 flex-col pb-12">
              <p className="text-lg font-bold leading-normal text-secondary">1. Create Your Form</p>
              <p className="text-black/70 dark:text-white/70 text-base font-normal leading-normal mt-1">
                Use our drag-and-drop builder or start with a template to design the perfect form for your needs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="bg-primary/10 rounded-full p-2 text-primary flex items-center justify-center size-10 ring-1 ring-primary/20">
                <span className="material-symbols-outlined">share</span>
              </div>
              <div className="w-[2px] bg-gradient-to-b from-primary/50 to-transparent h-full min-h-[40px]"></div>
            </div>
            <div className="flex flex-1 flex-col pb-12">
              <p className="text-lg font-bold leading-normal text-primary">2. Share & Collect</p>
              <p className="text-black/70 dark:text-white/70 text-base font-normal leading-normal mt-1">
                Embed your form on your website or share a direct link to start collecting responses immediately.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="bg-blue-500/10 rounded-full p-2 text-blue-500 flex items-center justify-center size-10 ring-1 ring-blue-500/20">
                <span className="material-symbols-outlined">query_stats</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col pb-4">
              <p className="text-lg font-bold leading-normal text-blue-500">3. Analyze Results</p>
              <p className="text-black/70 dark:text-white/70 text-base font-normal leading-normal mt-1">
                Watch the results come in and use our built-in analytics to understand your data and make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-4 py-16 sm:py-24 container mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-10 lg:p-16 flex flex-col items-center text-center border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-blue-500"></div>
          <h2 className="text-3xl font-extrabold tracking-tight text-black dark:text-white z-10">Ready to start building?</h2>
          <p className="mt-4 max-w-2xl text-lg text-black/70 dark:text-white/70 z-10">
            Create your first form today and see how easy data collection can be. No credit card required.
          </p>
          <Link to="/signup" className="mt-8 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-base font-bold transition-colors z-10 shadow-xl">
            <span className="truncate">Sign Up Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
