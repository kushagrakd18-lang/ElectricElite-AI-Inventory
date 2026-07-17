import React, { useState } from 'react';
import { Zap, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const CORRECT_PASSWORD = 'Electric2026';
const SESSION_KEY = 'electric_elite_auth';

export default function LoginModal({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onAuthenticated();
    } else {
      setError('Incorrect password. Please try again.');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary">
      {/* Subtle radial glow behind card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      <div
        className={`relative w-full max-w-sm mx-4 glass-panel p-8 rounded-2xl border border-border-primary/60 shadow-2xl transition-transform ${
          shaking ? 'animate-[shake_0.4s_ease]' : ''
        }`}
        style={
          shaking
            ? { animation: 'shake 0.4s ease' }
            : {}
        }
      >
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap className="w-7 h-7 fill-white text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-text-primary leading-none">
              Electric<span className="text-brand-500">Elite</span>
            </h1>
            <p className="text-[11px] text-text-muted mt-1 uppercase tracking-widest font-semibold">
              AI Inventory — Secure Access
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="ee-password"
              className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider"
            >
              Access Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ee-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
                autoFocus
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-bg-primary border border-border-primary/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-text-primary placeholder:text-text-muted transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-[11px] text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            Unlock Dashboard
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-[10px] text-text-muted mt-6 leading-relaxed">
          This is a private demo. Unauthorized access is prohibited.
        </p>
      </div>

      {/* Shake keyframe injected inline for portability */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
