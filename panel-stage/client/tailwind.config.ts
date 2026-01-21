import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /(bg|text|border|ring)-(primary|secondary|background|foreground|card|muted|accent|destructive|border|input)/,
      variants: ['hover', 'focus', 'active', 'dark'],
    },
    {
      pattern: /from-(primary|secondary)/,
    },
    {
      pattern: /to-(primary|secondary)/,
    },
    {
      pattern: /via-(background)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        'primary-hover': 'var(--primary-hover)',
        'primary-light': 'var(--primary-light)',
        secondary: '#527575',
        'secondary-foreground': 'var(--secondary-foreground)',
        'secondary-hover': '#4a6a6a',
        'secondary-light': '#e8f0f0',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        'muted-hover': 'var(--muted-hover)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        'destructive-hover': 'var(--destructive-hover)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      ringColor: {
        DEFAULT: 'var(--ring)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      letterSpacing: {
        normal: 'var(--tracking-normal)',
      },
    },
  },
  plugins: [],
}
export default config
