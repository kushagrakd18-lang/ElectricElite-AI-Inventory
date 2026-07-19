import { useState, useEffect } from 'react';

const THEMES = ['light', 'dark', 'cyberpunk', 'forest'];

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('electric_elite_theme');
    if (savedTheme && THEMES.includes(savedTheme)) {
      return savedTheme;
    }
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove all theme classes first
    root.classList.remove('dark', 'cyberpunk', 'forest');
    
    if (theme !== 'light') {
      root.classList.add(theme);
    }
    localStorage.setItem('electric_elite_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const currentIndex = THEMES.indexOf(prevTheme);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      return THEMES[nextIndex];
    });
  };

  return { 
    theme, 
    setTheme,
    toggleTheme, 
    isDark: theme !== 'light' 
  };
}
