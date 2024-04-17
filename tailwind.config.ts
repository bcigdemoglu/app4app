import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      screens: {
        print: { raw: 'print' },
        screen: { raw: 'screen' },
      },
      animation: {
        'pulse-slow': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'hue-background': 'hue 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        hue: {
          '0%, 100%': { backgroundColor: colors.blue[500] },
          '50%': { backgroundColor: colors.green[500] },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
