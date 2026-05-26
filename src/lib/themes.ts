export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
    success: string;
    warning: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      background: '#0f172a',
      foreground: '#f8fafc',
      card: '#1e293b',
      cardForeground: '#f8fafc',
      primary: '#3b82f6',
      primaryForeground: '#ffffff',
      secondary: '#334155',
      secondaryForeground: '#f8fafc',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      accent: '#334155',
      accentForeground: '#f8fafc',
      destructive: '#ef4444',
      border: '#334155',
      input: '#334155',
      ring: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Dark',
    colors: {
      background: '#022c22',
      foreground: '#f0fdf4',
      card: '#064e3b',
      cardForeground: '#f0fdf4',
      primary: '#10b981',
      primaryForeground: '#ffffff',
      secondary: '#065f46',
      secondaryForeground: '#ecfdf5',
      muted: '#064e3b',
      mutedForeground: '#6ee7b7',
      accent: '#065f46',
      accentForeground: '#ecfdf5',
      destructive: '#f87171',
      border: '#065f46',
      input: '#065f46',
      ring: '#10b981',
      success: '#34d399',
      warning: '#fbbf24',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    colors: {
      background: '#1a0533',
      foreground: '#faf5ff',
      card: '#2e1065',
      cardForeground: '#faf5ff',
      primary: '#a855f7',
      primaryForeground: '#ffffff',
      secondary: '#3b0764',
      secondaryForeground: '#f5f3ff',
      muted: '#2e1065',
      mutedForeground: '#c4b5fd',
      accent: '#3b0764',
      accentForeground: '#f5f3ff',
      destructive: '#f87171',
      border: '#3b0764',
      input: '#3b0764',
      ring: '#a855f7',
      success: '#4ade80',
      warning: '#fbbf24',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    colors: {
      background: '#1c1917',
      foreground: '#fafaf9',
      card: '#292524',
      cardForeground: '#fafaf9',
      primary: '#f97316',
      primaryForeground: '#ffffff',
      secondary: '#44403c',
      secondaryForeground: '#fafaf9',
      muted: '#292524',
      mutedForeground: '#a8a29e',
      accent: '#44403c',
      accentForeground: '#fafaf9',
      destructive: '#ef4444',
      border: '#44403c',
      input: '#44403c',
      ring: '#f97316',
      success: '#22c55e',
      warning: '#eab308',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Teal',
    colors: {
      background: '#042f2e',
      foreground: '#f0fdfa',
      card: '#134e4a',
      cardForeground: '#f0fdfa',
      primary: '#14b8a6',
      primaryForeground: '#ffffff',
      secondary: '#115e59',
      secondaryForeground: '#ccfbf1',
      muted: '#134e4a',
      mutedForeground: '#5eead4',
      accent: '#115e59',
      accentForeground: '#ccfbf1',
      destructive: '#fb7185',
      border: '#115e59',
      input: '#115e59',
      ring: '#14b8a6',
      success: '#34d399',
      warning: '#fbbf24',
    },
  },
  {
    id: 'light',
    name: 'Clean Light',
    colors: {
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#f8fafc',
      cardForeground: '#0f172a',
      primary: '#2563eb',
      primaryForeground: '#ffffff',
      secondary: '#f1f5f9',
      secondaryForeground: '#0f172a',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      accent: '#f1f5f9',
      accentForeground: '#0f172a',
      destructive: '#dc2626',
      border: '#e2e8f0',
      input: '#e2e8f0',
      ring: '#2563eb',
      success: '#16a34a',
      warning: '#d97706',
    },
  },
];

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
}
