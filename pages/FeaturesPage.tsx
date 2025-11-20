import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="bg-black/5 dark:bg-white/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Features that empower your data collection
          </h1>
          <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
            Regal Forms is built for speed, design, and intelligence. Explore the tools that will help you build better forms.
          </p>
        </div>
      </div>

      {/* Feature Blocks */}
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col gap-24">
        
        {/* Builder */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">drag_indicator</span>
            </div>
            <h2 className="text-3xl font-bold">Intuitive Drag-and-Drop Builder</h2>
            <p className="text-lg text-black/70 dark:text-white/70 leading-relaxed">
              Create complex forms in minutes without writing a single line of code. Our visual editor allows you to drag fields, rearrange sections, and customize logic effortlessly.
            </p>
            <ul className="space-y-3 mt-2">
              {['Real-time preview', 'Conditional logic', 'Multi-page forms', 'Custom branding'].map(item => (
                <li key={item} className="flex items-center gap-3 font-medium">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-background-light dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
             {/* Mockup of builder UI */}
             <div className="flex flex-col gap-4 opacity-80">
                <div className="h-8 w-3/4 bg-black/10 dark:bg-white/20 rounded"></div>
                <div className="h-4 w-1/2 bg-black/10 dark:bg-white/20 rounded"></div>
                <div className="h-32 w-full bg-black/5 dark:bg-white/10 rounded border-2 border-dashed border-black/10 dark:border-white/20 flex items-center justify-center">
                    <span className="text-sm font-bold uppercase tracking-widest">Drop Area</span>
                </div>
             </div>
          </div>
        </div>

        {/* AI */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
            <h2 className="text-3xl font-bold">AI-Powered Generation</h2>
            <p className="text-lg text-black/70 dark:text-white/70 leading-relaxed">
              Stuck on what to ask? Let our Gemini-powered AI assistant generate the perfect questions for your specific needs in seconds.
            </p>
            <ul className="space-y-3 mt-2">
              {['Context-aware suggestions', 'Automatic field type selection', 'Optimized for conversion', 'Instant generation'].map(item => (
                <li key={item} className="flex items-center gap-3 font-medium">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-background-light dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl relative overflow-hidden">
             <div className="absolute -right-10 -top-10 size-40 bg-purple-500/20 blur-3xl rounded-full"></div>
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-black/40 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-purple-500">auto_awesome</span>
                    <span className="text-sm font-medium">"Create a feedback form for a coffee shop"</span>
                </div>
                <div className="pl-8 flex flex-col gap-2">
                    <div className="p-3 bg-primary/10 text-primary text-sm rounded-lg inline-block w-fit">Generating fields...</div>
                    <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded overflow-hidden">
                        <div className="h-full w-2/3 bg-primary"></div>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined text-3xl">analytics</span>
            </div>
            <h2 className="text-3xl font-bold">Deep Analytics & Insights</h2>
            <p className="text-lg text-black/70 dark:text-white/70 leading-relaxed">
              Don't just collect data, understand it. Our built-in analytics dashboard gives you real-time views on completion rates, drop-off points, and audience demographics.
            </p>
            <Link to="/analytics" className="text-primary font-bold hover:underline flex items-center gap-1">
              View Analytics Dashboard <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="flex-1 bg-background-light dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
             <div className="flex items-end justify-between h-32 gap-2">
                {[40, 70, 45, 90, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500 rounded-t-md opacity-80" style={{ height: `${h}%` }}></div>
                ))}
             </div>
             <div className="flex justify-between mt-4 border-t border-black/10 dark:border-white/10 pt-4">
                <div className="text-center">
                    <div className="text-xs text-black/50 dark:text-white/50">Views</div>
                    <div className="font-bold">1.2k</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-black/50 dark:text-white/50">Starts</div>
                    <div className="font-bold">850</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-black/50 dark:text-white/50">Completed</div>
                    <div className="font-bold text-green-500">620</div>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="bg-primary/5 dark:bg-white/5 py-20 px-4 text-center mt-10">
        <h2 className="text-3xl font-bold mb-6">Ready to experience these features?</h2>
        <Link to="/create" className="inline-flex items-center justify-center h-12 px-8 bg-primary hover:bg-orange-600 text-white dark:text-black font-bold rounded-lg shadow-lg shadow-primary/20 transition-all">
            Start Building Now
        </Link>
      </div>
    </div>
  );
};

export default FeaturesPage;
