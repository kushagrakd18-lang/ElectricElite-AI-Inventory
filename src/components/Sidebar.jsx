import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Sparkles, BarChart3, Settings as SettingsIcon, Sun, Moon, Zap, FolderInput } from 'lucide-react';
import useTheme from '../hooks/useTheme';

export default function Sidebar() {
  const { theme, toggleTheme, isDark } = useTheme();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/ai-tools', label: 'AI Copywriter', icon: Sparkles },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/data-manager', label: 'Data Manager', icon: FolderInput },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-border-primary bg-bg-secondary flex flex-col justify-between z-30 transition-all duration-300">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-border-primary/60 gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-primary m-0 p-0 leading-none">
              Electric<span className="text-brand-500">Elite</span>
            </h1>
            <span className="text-[10px] font-semibold text-text-muted tracking-wider uppercase">AI Inventory</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-border-secondary'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle Footer */}
      <div className="p-4 border-t border-border-primary/60">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-border-secondary border border-border-primary/50 transition-all duration-200"
          title="Toggle light/dark theme"
        >
          <div className="flex items-center gap-3">
            {isDark ? (
              <>
                <Moon className="w-4 h-4 text-brand-400 fill-brand-400/20" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                <span>Light Mode</span>
              </>
            )}
          </div>
          <div className="w-8 h-4 rounded-full bg-border-primary relative p-0.5 transition-colors">
            <div
              className={`w-3 h-3 rounded-full bg-brand-500 transition-all duration-300 absolute ${
                isDark ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </div>
        </button>
      </div>
    </aside>
  );
}
