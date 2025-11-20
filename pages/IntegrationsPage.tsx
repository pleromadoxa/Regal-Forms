
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface IntegrationConfig {
  enabled: boolean;
  settings: Record<string, string>;
}

interface IntegrationTool {
  id: string;
  name: string;
  desc: string;
  icon: string;
  fields: { key: string; label: string; type: string; placeholder?: string }[];
}

const TOOLS: IntegrationTool[] = [
  { 
    id: 'google_sheets', 
    name: "Google Sheets", 
    desc: "Sync form responses to a Google Sheet in real-time.", 
    icon: "table_chart",
    fields: [
      { key: 'spreadsheetUrl', label: 'Spreadsheet URL', type: 'url', placeholder: 'https://docs.google.com/spreadsheets/d/...' },
      { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1' }
    ]
  },
  { 
    id: 'slack', 
    name: "Slack", 
    desc: "Receive instant notifications in a Slack channel.", 
    icon: "chat",
    fields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' },
      { key: 'channel', label: 'Channel Name (Optional)', type: 'text', placeholder: '#general' }
    ]
  },
  { 
    id: 'mailchimp', 
    name: "Mailchimp", 
    desc: "Add new leads directly to your Mailchimp lists.", 
    icon: "mark_email_read",
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Mailchimp API Key' },
      { key: 'audienceId', label: 'Audience ID', type: 'text', placeholder: 'List ID' }
    ]
  },
  { 
    id: 'zapier', 
    name: "Zapier", 
    desc: "Connect your forms to 5,000+ other apps via Zapier.", 
    icon: "bolt",
    fields: [
      { key: 'webhookUrl', label: 'Zapier Webhook URL', type: 'url', placeholder: 'https://hooks.zapier.com/...' }
    ]
  },
  { 
    id: 'notion', 
    name: "Notion", 
    desc: "Create database items in Notion for every response.", 
    icon: "dataset",
    fields: [
      { key: 'apiKey', label: 'Integration Token', type: 'password', placeholder: 'secret_...' },
      { key: 'databaseId', label: 'Database ID', type: 'text', placeholder: 'Enter Database ID' }
    ]
  },
  { 
    id: 'hubspot', 
    name: "HubSpot", 
    desc: "Sync contacts and deals directly to your HubSpot CRM.", 
    icon: "hub",
    fields: [
      { key: 'accessToken', label: 'Private App Access Token', type: 'password', placeholder: 'pat-...' }
    ]
  },
];

const IntegrationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [userIntegrations, setUserIntegrations] = useState<Record<string, IntegrationConfig>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<IntegrationTool | null>(null);
  const [tempSettings, setTempSettings] = useState<Record<string, string>>({});

  // Fetch Integrations on Mount
  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'user_integrations', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserIntegrations(docSnap.data() as Record<string, IntegrationConfig>);
        }
      } catch (error) {
        console.error("Error fetching integrations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIntegrations();
  }, [currentUser]);

  const saveIntegrationState = async (newData: Record<string, IntegrationConfig>) => {
      if (!currentUser) return;
      try {
          await setDoc(doc(db, 'user_integrations', currentUser.uid), newData, { merge: true });
          setUserIntegrations(newData);
      } catch (error) {
          console.error("Error saving integration:", error);
          alert("Failed to save changes. Please try again.");
      }
  };

  const toggleIntegration = async (toolId: string) => {
      const currentConfig = userIntegrations[toolId] || { enabled: false, settings: {} };
      const newState = !currentConfig.enabled;
      
      // If enabling and no settings exist for tools that require fields, open modal
      const tool = TOOLS.find(t => t.id === toolId);
      if (newState && tool && tool.fields.length > 0 && Object.keys(currentConfig.settings).length === 0) {
          openConfigModal(tool);
          return;
      }

      const updatedData = {
          ...userIntegrations,
          [toolId]: { ...currentConfig, enabled: newState }
      };
      
      // Optimistic update and save
      setUserIntegrations(updatedData);
      await saveIntegrationState(updatedData);
  };

  const openConfigModal = (tool: IntegrationTool) => {
      setActiveTool(tool);
      // Load existing settings or empty
      const currentSettings = userIntegrations[tool.id]?.settings || {};
      setTempSettings(currentSettings);
      setModalOpen(true);
  };

  const handleSettingChange = (key: string, value: string) => {
      setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleConfigSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser || !activeTool) return;
      
      setSavingId(activeTool.id);
      try {
          const updatedData = {
              ...userIntegrations,
              [activeTool.id]: { 
                  enabled: true, // Auto-enable on save config
                  settings: tempSettings 
              }
          };
          await saveIntegrationState(updatedData);
          setModalOpen(false);
      } finally {
          setSavingId(null);
      }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center h-screen w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-10 gap-8">
       <div className="flex flex-col gap-2 border-b border-black/10 dark:border-white/10 pb-8">
        <h1 className="text-3xl font-black tracking-tight">Integrations</h1>
        <p className="text-black/70 dark:text-white/70">Supercharge your forms by connecting them to your favorite tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLS.map((tool) => {
            const isConnected = userIntegrations[tool.id]?.enabled || false;
            const hasSettings = Object.keys(userIntegrations[tool.id]?.settings || {}).length > 0;
            
            return (
                <div key={tool.id} className={`flex flex-col p-6 rounded-xl border shadow-sm transition-all ${isConnected ? 'bg-white dark:bg-background-dark border-primary/50' : 'bg-white dark:bg-background-dark border-black/10 dark:border-white/10'}`}>
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${isConnected ? 'bg-primary text-white' : 'bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50'}`}>
                            <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">{tool.name}</h3>
                                <button 
                                    onClick={() => toggleIntegration(tool.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isConnected ? 'bg-primary' : 'bg-gray-200 dark:bg-white/20'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isConnected ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <p className="text-sm text-black/60 dark:text-white/60 leading-snug">{tool.desc}</p>
                        </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                         <div className="flex items-center gap-2">
                             {isConnected ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                    <span className="size-2 rounded-full bg-green-600 animate-pulse"></span>
                                    Active
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                                    Inactive
                                </span>
                             )}
                         </div>
                         <button 
                            onClick={() => openConfigModal(tool)}
                            className={`text-sm font-bold hover:underline flex items-center gap-1 ${isConnected ? 'text-primary' : 'text-black/50 dark:text-white/50'}`}
                         >
                             <span className="material-symbols-outlined text-base">settings</span>
                             {hasSettings ? 'Configure' : 'Setup'}
                         </button>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Configuration Modal */}
      {modalOpen && activeTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10">
                  <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             <span className="material-symbols-outlined">{activeTool.icon}</span>
                          </div>
                          <div>
                             <h3 className="text-lg font-bold">{activeTool.name} Configuration</h3>
                             <p className="text-xs text-black/50 dark:text-white/50">Enter your connection details below.</p>
                          </div>
                      </div>
                      <button onClick={() => setModalOpen(false)} className="hover:text-primary text-black/50 dark:text-white/50 transition-colors">
                          <span className="material-symbols-outlined">close</span>
                      </button>
                  </div>
                  
                  <form onSubmit={handleConfigSave} className="p-6 flex flex-col gap-6">
                      {activeTool.fields.map((field) => (
                          <div key={field.key} className="flex flex-col gap-2">
                              <label className="text-sm font-bold text-black/70 dark:text-white/70">
                                  {field.label}
                              </label>
                              <input 
                                  type={field.type} 
                                  value={tempSettings[field.key] || ''}
                                  onChange={(e) => handleSettingChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full p-3 rounded-lg bg-background-light dark:bg-black/20 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium"
                                  required
                              />
                          </div>
                      ))}

                      <div className="flex gap-3 mt-2 pt-4 border-t border-black/5 dark:border-white/5">
                          <button 
                             type="button"
                             onClick={() => setModalOpen(false)}
                             className="flex-1 py-3 rounded-lg font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm"
                          >
                              Cancel
                          </button>
                          <button 
                             type="submit"
                             disabled={savingId === activeTool.id}
                             className="flex-1 py-3 rounded-lg font-bold bg-primary text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                          >
                              {savingId === activeTool.id && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                              Save & Connect
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
