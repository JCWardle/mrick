import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				dark: '#553C9A',
  				light: '#8B5CF6',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			lavender: {
  				DEFAULT: '#C4B5FD',
  				light: '#E9D5FF'
  			},
  			coral: {
  				DEFAULT: '#FF6B6B',
  				light: '#FFB3BA'
  			},
  			yummy: {
  				DEFAULT: '#10B981',
  				light: '#6EE7B7'
  			},
  			ick: {
  				DEFAULT: '#EF4444',
  				light: '#FCA5A5'
  			},
  			maybe: {
  				DEFAULT: '#F59E0B',
  				light: '#FCD34D'
  			},
  			text: {
  				primary: '#1F2937',
  				secondary: '#6B7280',
  				tertiary: '#9CA3AF'
  			},
  			background: 'hsl(var(--background))',
  			border: 'hsl(var(--border))',
  			success: '#10B981',
  			error: '#EF4444',
  			warning: '#F59E0B',
  			info: '#3B82F6',
  			bg: 'var(--background)',
  			fg: 'var(--foreground)',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI"',
  				'Roboto',
  				'Helvetica Neue"',
  				'Arial',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			h1: [
  				'32px',
  				{
  					lineHeight: '1.2',
  					fontWeight: '700'
  				}
  			],
  			h2: [
  				'24px',
  				{
  					lineHeight: '1.3',
  					fontWeight: '500'
  				}
  			],
  			body: [
  				'18px',
  				{
  					lineHeight: '1.6',
  					fontWeight: '400'
  				}
  			],
  			small: [
  				'14px',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			],
  			button: [
  				'18px',
  				{
  					lineHeight: '1.5',
  					fontWeight: '600'
  				}
  			]
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '24px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

