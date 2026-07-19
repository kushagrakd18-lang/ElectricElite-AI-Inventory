import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Sparkles, BarChart3, Settings as SettingsIcon, Zap, FolderInput, X, Palette, Sun, Moon, Check } from 'lucide-react';
import useTheme from '../hooks/useTheme';

const THEMES = [
  {
    id: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Clean & bright',
    preview: {
      bg: '#f8fafc',
      sidebar: '#ffffff',
      accent: '#8b5cf6',
      text: '#0f172a',
    },
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Deep space',
    preview: {
      bg: '#090d16',
      sidebar: '#0f1524',
      accent: '#6366f1',
      text: '#f8fafc',
    },
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    icon: Zap,
    description: 'Neon futuristic',
    preview: {
      bg: '#05050d',
      sidebar: '#0a0818',
      accent: '#fbbf24',
      text: '#e2e8f0',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    icon: Sparkles,
    description: 'Emerald dark',
    preview: {
      bg: '#020d07',
      sidebar: '#051a0e',
      accent: '#10b981',
      text: '#ecfdf5',
    },
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { theme, setTheme } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/ai-tools', label: 'AI Copywriter', icon: Sparkles },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/data-manager', label: 'Data Manager', icon: FolderInput },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const activeTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const ActiveIcon = activeTheme.icon;

  return (
    <aside
      className={`w-64 h-screen fixed left-0 top-0 border-r border-border-primary bg-bg-secondary flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ borderRightColor: 'var(--border-primary)' }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border-primary/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-primary m-0 p-0 leading-none">
              Electric<span style={{ color: 'var(--brand-500)' }}>Elite</span>
            </h1>
            <span className="text-[10px] font-semibold text-text-muted tracking-wider uppercase">AI Inventory</span>
          </div>
        </div>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="md:hidden p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-border-secondary transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Navigation */}
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary hover:bg-border-secondary'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: 'var(--brand-500)', boxShadow: '0 4px 12px color-mix(in srgb, var(--brand-500) 30%, transparent)' } : {}
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Section Footer */}
      <div className="p-4 border-t shrink-0" style={{ borderTopColor: 'var(--border-primary)' }}>

        {/* Theme Picker Panel (opens upward) */}
        {showThemePicker && (
          <div
            className="mb-3 p-3 rounded-xl border space-y-2"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Theme</span>
              <button
                onClick={() => setShowThemePicker(false)}
                className="p-0.5 rounded text-text-muted hover:text-text-primary transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {THEMES.map((t) => {
              const TIcon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg transition-all group cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${t.preview.accent}18` : 'transparent',
                    border: `1.5px solid ${isActive ? t.preview.accent : 'transparent'}`,
                  }}
                  title={t.description}
                >
                  {/* Mini color swatch */}
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden border"
                    style={{ backgroundColor: t.preview.sidebar, borderColor: `${t.preview.accent}60` }}
                  >
                    {/* Accent stripe */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2"
                      style={{ backgroundColor: t.preview.accent }}
                    />
                    <TIcon className="w-3.5 h-3.5 relative z-10" style={{ color: t.preview.text }} />
                  </div>

                  <div className="flex-1 text-left">
                    <div
                      className="text-xs font-bold leading-none"
                      style={{ color: isActive ? t.preview.accent : 'var(--text-primary)' }}
                    >
                      {t.label}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">{t.description}</div>
                  </div>

                  {isActive && (
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: t.preview.accent }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Trigger button — shows active theme */}
        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer"
          style={{
            color: showThemePicker ? 'var(--brand-500)' : 'var(--text-secondary)',
            borderColor: showThemePicker ? 'var(--brand-500)' : 'var(--border-primary)',
            backgroundColor: showThemePicker ? `color-mix(in srgb, var(--brand-500) 8%, transparent)` : 'transparent',
          }}
          title="Switch app theme"
        >
          <div className="flex items-center gap-3">
            {/* Live mini-swatch of current theme */}
            <div
              className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
              style={{ backgroundColor: activeTheme.preview.sidebar, borderColor: `${activeTheme.preview.accent}80` }}
            >
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: activeTheme.preview.accent }} />
            </div>
            <span style={{ color: 'var(--text-primary)' }}>{activeTheme.label} Theme</span>
          </div>

          <Palette
            className="w-4 h-4 shrink-0 transition-transform duration-200"
            style={{
              color: 'var(--brand-500)',
              transform: showThemePicker ? 'rotate(30deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </div>
    </aside>
  );
}
