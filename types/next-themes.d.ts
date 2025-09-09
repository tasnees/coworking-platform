declare module 'next-themes' {
  import * as React from 'react';

  type Theme = 'light' | 'dark' | 'system';

  interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
    disableTransitionOnChange?: boolean;
    enableSystem?: boolean;
    enableColorScheme?: boolean;
    themes?: string[];
    attribute?: string | 'class';
    value?: {
      [key: string]: string;
    };
  }

  interface ThemeContextProps {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    themes: string[];
    resolvedTheme: string | undefined;
    systemTheme: 'light' | 'dark' | undefined;
  }

  export const ThemeProvider: React.FC<ThemeProviderProps>;
  export const useTheme: () => ThemeContextProps;
  export const useThemeWithProps: <T extends { theme?: string }>(
    props: T
  ) => T & { theme: string };

  export const Theme: {
    light: 'light';
    dark: 'dark';
    system: 'system';
  };

  export default ThemeProvider;
}
