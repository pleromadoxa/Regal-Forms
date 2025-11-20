import React, { useState } from 'react';

const IntegrationsPage: React.FC = () => {
  // Mock state for toggles
  const [connected, setConnected] = useState<Record<string, boolean>>({
    'Google Sheets': true,
    'Slack': false,
    'Mailchimp': false,
    'Zapier': true,
    'Notion': false,
    'HubSpot': false
  });

  const toggleConnection = (name: string) => {
    setConnected(prev => ({...prev, [name]: !prev[name]}));
  };

  const integrations = [
    { name: "Google Sheets", desc: "Automatically sync form responses to a Google Sheet in real-time.", icon: "table_chart" },
    { name: "Slack", desc: "Receive instant notifications in a Slack channel for every new submission.", icon: "chat" },
    { name: "Mailchimp", desc: "Add new leads directly to your Mailchimp email marketing lists.", icon: "mark_email_read" },
    { name: "Zapier", desc: "Connect your forms to 5,000+ other apps via Zapier automation.", icon: "bolt" },
    { name: "Notion", desc: "Create database items in Notion for every form response.", icon: "dataset" },
    { name: "HubSpot", desc: "Sync contacts and deals directly to your HubSpot CRM.", icon: "hub" },
  ];

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-10 gap-8">
       <div className="flex flex-col gap-2 border-b border-black/10 dark:border-white/10 pb-8">
        <h1 className="text-3xl font-black tracking-tight">Integrations</h1>
        <p className="text-black/70 dark:text-white/70">Supercharge your forms by connecting them to your favorite tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((tool, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-xl bg-white dark:bg-background-dark border border-black/10 dark:border-white/10 shadow-sm">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
                </div>
                <div className="flex flex-col flex-1 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{tool.name}</h3>
                        <button 
                            onClick={() => toggleConnection(tool.name)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${connected[tool.name] ? 'bg-primary' : 'bg-gray-200 dark:bg-white/20'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${connected[tool.name] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <p className="text-sm text-black/60 dark:text-white/60">{tool.desc}</p>
                    <div className="mt-2">
                        {connected[tool.name] ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                <span className="size-2 rounded-full bg-green-600"></span>
                                Connected
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                                Disconnected
                            </span>
                        )}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsPage;