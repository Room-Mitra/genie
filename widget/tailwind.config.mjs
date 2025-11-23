// tailwind.config.mjs
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx,md,mdx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: { extend: {} },
  plugins: [typography],
};
