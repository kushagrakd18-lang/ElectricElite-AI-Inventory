import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, RefreshCw, Sun, Moon, CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import useInventory from '../hooks/useInventory';

export default function Settings() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { resetInventory } = useInventory();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [threshold, setThreshold] = useState(15);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('electric_elite_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);

  const handleReset = () => {
    resetInventory();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
    }, 3000);
  };

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    if (val.trim()) {
      localStorage.setItem('electric_elite_gemini_key', val.trim());
    } else {
      localStorage.removeItem('electric_elite_gemini_key');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Settings Header Block */}
      <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary m-0">Settings Dashboard</h2>
            <p className="text-text-secondary text-xs mt-0.5">Manage dashboard preferences, theme controls, and local storage data sets.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Theme & Display Options */}
        <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border-primary/60">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Display Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-text-primary block">Active Theme Mode</span>
                <span className="text-xs text-text-muted">Toggle between high-contrast light and deep space dark layouts</span>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-primary text-xs font-semibold text-text-primary hover:bg-border-secondary transition-all"
              >
                {isDark ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-brand-400 fill-brand-400/20" />
                    <span>Dark Theme</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                    <span>Light Theme</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-secondary">
              <div>
                <span className="text-sm font-semibold text-text-primary block">Low Stock Threshold</span>
                <span className="text-xs text-text-muted">Set target minimum units for inventory warnings</span>
              </div>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-16 px-2.5 py-1 text-center text-sm font-semibold bg-bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-text-primary"
                min="5"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Demo Data Control */}
        <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border-primary/60">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">System & Storage Data</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-text-primary block">Reset Catalog Data</span>
                <span className="text-xs text-text-muted">Wipes custom edits and loads original 6 mock catalog SKUs</span>
              </div>
              <button
                onClick={handleReset}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  resetSuccess 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                }`}
              >
                {resetSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Inventory Reset!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Factory Reset</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border-primary/60 pt-4 border-t">
              <Shield className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-text-primary block">Browser Storage Notice</span>
                <span className="text-[10px] text-text-muted leading-relaxed block mt-0.5">
                  All active parameters are saved inside local keys `electric_elite_products` and `electric_elite_theme` on this device. Clearing cookies/cache will reset the environment.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Gemini AI Settings */}
      <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border-primary/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Google Gemini API Key</h3>
          </div>
          <div>
            {apiKey ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                Live AI Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                Demo Mode (Mock active)
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-text-secondary text-xs leading-relaxed max-w-2xl">
            Input your Google Gemini API key to enable live Image-to-Data parameter extraction and product copywriting generation.
            If left blank, the system automatically uses highly realistic mock workflows for prototype demonstrations.
          </p>

          <div className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter Gemini API key (AIzaSy...)"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="w-full pl-3 pr-10 py-2.5 text-sm bg-bg-primary border border-border-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-text-primary font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
