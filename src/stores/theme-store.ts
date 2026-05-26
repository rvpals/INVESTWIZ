import { create } from 'zustand';
import { themes, applyTheme, type Theme } from '@/lib/themes';

interface ThemeState {
  themeId: string;
  currentTheme: Theme;
  setTheme: (id: string) => void;
}

function loadSavedThemeId(): string {
  try {
    return localStorage.getItem('investwiz-theme') || 'midnight';
  } catch {
    return 'midnight';
  }
}

const savedId = loadSavedThemeId();
const initialTheme = themes.find((t) => t.id === savedId) || themes[0]!;

export const useThemeStore = create<ThemeState>((set) => ({
  themeId: initialTheme.id,
  currentTheme: initialTheme,
  setTheme: (id) => {
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;
    applyTheme(theme);
    localStorage.setItem('investwiz-theme', id);
    set({ themeId: id, currentTheme: theme });
  },
}));

applyTheme(initialTheme);
