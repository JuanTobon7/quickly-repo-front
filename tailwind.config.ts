/** @type {import('tailwindcss').Config} */
const config = {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Inter"', 'system-ui', 'sans-serif'],
				display: ['"DM Sans"', 'system-ui', 'sans-serif'],
			},
			colors: {
				background: '#f3f4f6',
				surface: '#ffffff',
				primary: '#2563eb',
				secondary: '#0f172a',
				accent: '#10b981',
				warning: '#facc15',
				danger: '#ef4444',
				border: '#e2e8f0',
				muted: '#0f172a',
				'muted-foreground': '#0f172a',
			},
			boxShadow: {
				soft: '0 10px 30px -20px rgba(15, 23, 42, 0.35)',
			},
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem',
			},
		},
	},
	plugins: [],
};

export default config;
