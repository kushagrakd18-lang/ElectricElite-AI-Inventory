import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, IndianRupee, AlertTriangle, ArrowRight, Plus, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import useInventory from '../hooks/useInventory';

export default function Dashboard() {
  const navigate = useNavigate();
  const { products, getInventoryStats, resetInventory } = useInventory();
  const { totalProducts, totalStockValue, lowStockAlerts } = getInventoryStats();

  // Helper to format currency in INR
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Mock Activity List matching the project workflow
  const activities = [
    {
      id: 1,
      type: 'stock_alert',
      message: 'Stock level for "Smart 3-Channel Wi-Fi Switch" is low (12 remaining).',
      time: '10 minutes ago',
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 2,
      type: 'ai_generation',
      message: 'AI Copywriter generated Amazon listing for "9W Premium LED Bulb".',
      time: '1 hour ago',
      badgeColor: 'text-brand-500 bg-brand-500/10 border-brand-500/20'
    },
    {
      id: 3,
      type: 'stock_update',
      message: 'Stock level for "4-Way Smart Surge Protector" updated to 65.',
      time: '3 hours ago',
      badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 4,
      type: 'product_added',
      message: 'New product "Smart Touch Dimmer Switch" was registered to inventory catalog.',
      time: 'Yesterday',
      badgeColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-primary/60 bg-bg-card p-8">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
            Welcome back, <span className="gradient-text">Elite Manager</span>
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            Monitor product metrics, review stock alerts, and convert raw product specs into high-converting, SEO-optimized e-commerce copy instantly using Gemini AI.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI: Total Products */}
        <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200 group">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Products</span>
            <div className="text-3xl font-bold text-text-primary tracking-tight">{totalProducts}</div>
            <div className="text-xs text-text-muted flex items-center gap-1">
              Active unique SKUs in catalog
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center transition-all group-hover:bg-brand-500 group-hover:text-white">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Total Stock Value */}
        <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200 group">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Stock Value</span>
            <div className="text-3xl font-bold text-text-primary tracking-tight">
              {formatCurrency(totalStockValue)}
            </div>
            <div className="text-xs text-text-muted flex items-center gap-1">
              Sum of (price * current stock)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-all group-hover:bg-emerald-500 group-hover:text-white">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Low Stock Alerts */}
        <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200 group">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Low Stock Alerts</span>
            <div className="text-3xl font-bold text-text-primary tracking-tight">
              {lowStockAlerts}
            </div>
            <div className="text-xs text-text-muted flex items-center gap-1">
              Items with stock &lt; 15 units
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            lowStockAlerts > 0 
              ? 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-text-muted'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Navigation Shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              {/* Add New SKU */}
              <button 
                onClick={() => navigate('/inventory')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border-primary/60 bg-bg-primary/50 text-left text-sm hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
              >
                <div className="flex items-center gap-3 text-text-primary">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block">Register New SKU</span>
                    <span className="text-[10px] text-text-muted">Add specs and price details</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* AI Intake */}
              <button 
                onClick={() => navigate('/ai-tools')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border-primary/60 bg-bg-primary/50 text-left text-sm hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
              >
                <div className="flex items-center gap-3 text-text-primary">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block">Vision Data Fill</span>
                    <span className="text-[10px] text-text-muted">Image-to-spec extractor</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Generate Listing */}
              <button 
                onClick={() => navigate('/ai-tools')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border-primary/60 bg-bg-primary/50 text-left text-sm hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
              >
                <div className="flex items-center gap-3 text-text-primary">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block">AI E-commerce Copy</span>
                    <span className="text-[10px] text-text-muted">Amazon, Flipkart & Social copy</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline Monitoring */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Recent Activity Timeline</h3>
              <button 
                onClick={resetInventory}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-500 transition-colors"
                title="Reset mock local storage data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Data
              </button>
            </div>

            <div className="relative pl-6 border-l border-border-primary/80 space-y-6">
              {activities.map((act) => (
                <div key={act.id} className="relative group">
                  {/* Timeline Dot Indicator */}
                  <span className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-brand-500 ring-4 ring-bg-card" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${act.badgeColor} uppercase tracking-wider`}>
                        {act.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-text-muted">{act.time}</span>
                    </div>
                    <p className="text-sm text-text-secondary pr-4 font-medium">
                      {act.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
