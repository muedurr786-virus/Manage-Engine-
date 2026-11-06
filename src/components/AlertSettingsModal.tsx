import React, { useState } from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Mail,
  Webhook,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import { playAlertChime } from '../utils/soundAlert';

export const AlertSettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settings,
    updateSettings,
    resetToDefaults,
  } = useInventoryEngine();

  const [soundEnabled, setSoundEnabled] = useState(settings.soundAlertsEnabled);
  const [webhookUrl, setWebhookUrl] = useState(settings.notificationWebhook);
  const [emailAlerts, setEmailAlerts] = useState(settings.defaultEmailAlerts);
  const [leadMultiplier, setLeadMultiplier] = useState(settings.leadTimeMultiplier);
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isSettingsModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      soundAlertsEnabled: soundEnabled,
      notificationWebhook: webhookUrl,
      defaultEmailAlerts: emailAlerts,
      leadTimeMultiplier: Number(leadMultiplier),
    });
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      setIsSettingsModalOpen(false);
    }, 700);
  };

  const testChime = () => {
    playAlertChime('critical');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSettingsModalOpen(false)}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden text-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-semibold text-white font-display">
                  Automated Alert Engine Settings
                </h3>
                <p className="text-slate-400 text-xs">
                  Configure alert triggers, audio notifications, and telemetry
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="pt-4 space-y-4">
            {/* Audio Alerts */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <span className="text-slate-200 font-medium block">
                      Real-Time Audio Alerts
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Play acoustic chime when stock drops below safety threshold
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4"
                />
              </div>

              {soundEnabled && (
                <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                  <button
                    type="button"
                    onClick={testChime}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Test Alert Chime
                  </button>
                </div>
              )}
            </div>

            {/* Email notification */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-slate-200 font-medium block">
                    Automated Procurement Email Dispatch
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Notify inventory lead on emergency buffer breach
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4"
              />
            </div>

            {/* Webhook endpoint */}
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Webhook className="w-3.5 h-3.5 text-cyan-400" />
                <span>Alert Webhook Target URL</span>
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono-data text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Fires JSON payload when any SKU stock crosses the critical limit
              </span>
            </div>

            {/* Lead Time Safety Buffer Multiplier */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Lead Time Safety Margin Multiplier
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="2.5"
                  value={leadMultiplier}
                  onChange={(e) => setLeadMultiplier(parseFloat(e.target.value) || 1.0)}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono-data text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <span className="text-slate-400 text-[11px]">
                  Extends estimated replenishment buffer during supply chain delays
                </span>
              </div>
            </div>

            {/* Reset Factory Database */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset hardware inventory to default pre-seeded state?')) {
                    resetToDefaults();
                    setIsSettingsModalOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Catalog</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  {savedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save Settings</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
