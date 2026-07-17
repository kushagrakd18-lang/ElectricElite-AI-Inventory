import React from 'react';
import { Bell, Search, User, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  
  // Dynamic page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Overview';
      case '/inventory':
        return 'Inventory Catalog';
      case '/ai-tools':
        return 'AI Copywriting Assistant';
      case '/analytics':
        return 'Inventory Analytics';
      case '/settings':
        return 'System Settings';
      default:
        return 'ElectricElite';
    }
  };

  return (
    <header className="h-16 border-b border-border-primary/60 bg-bg-secondary/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-8 z-20">
      {/* Page Title / Section context */}
      <div>
        <h2 className="text-lg font-bold text-text-primary m-0 flex items-center gap-2">
          {getPageTitle()}
          {location.pathname === '/' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <Sparkles className="w-3 h-3" /> Live Monitor
            </span>
          )}
        </h2>
      </div>

      {/* Global search & Action icons */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative w-64 max-md:hidden">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKUs, products, brands..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-bg-primary border border-border-primary/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-text-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-border-secondary rounded-xl transition-all relative border border-border-primary/30">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-bg-secondary" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-border-primary/60">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              EE
            </div>
            <div className="text-left max-md:hidden">
              <div className="text-xs font-semibold text-text-primary leading-none">Elite Manager</div>
              <div className="text-[10px] text-text-muted mt-0.5">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
