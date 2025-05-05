import type { Config } from "tailwindcss"

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
				// Added colors for sports emissions landing page
				emerald: {
					"50": "#ecfdf5",
					"100": "#d1fae5",
					"200": "#a7f3d0",
					"300": "#6ee7b7",
					"400": "#34d399",
					"500": "#10b981",
					"600": "#059669",
					"700": "#047857",
					"800": "#065f46",
					"900": "#064e3b",
					"950": "#022c22",
				},
				blue: {
					"50": "#eff6ff",
					"100": "#dbeafe",
					"200": "#bfdbfe",
					"300": "#93c5fd",
					"400": "#60a5fa",
					"500": "#3b82f6",
					"600": "#2563eb",
					"700": "#1d4ed8",
					"800": "#1e40af",
					"900": "#1e3a8a",
					"950": "#172554",
				},
				purple: {
					"50": "#faf5ff",
					"100": "#f3e8ff",
					"200": "#e9d5ff",
					"300": "#d8b4fe",
					"400": "#c084fc",
					"500": "#a855f7",
					"600": "#9333ea",
					"700": "#7e22ce",
					"800": "#6b21a8",
					"900": "#581c87",
					"950": "#3b0764",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				// Added keyframes for sports emissions landing page
				bounce: {
					"0%, 100%": {
						transform: "translateY(-25%)",
						animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
					},
					"50%": {
						transform: "translateY(0)",
						animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
					},
				},
				float: {
					"0%, 100%": {
						transform: "translateY(0)",
					},
					"50%": {
						transform: "translateY(-10px)",
					},
				},
				pulse: {
					"0%, 100%": {
						opacity: 1,
					},
					"50%": {
						opacity: 0.5,
					},
				},
				fadeIn: {
					"0%": {
						opacity: 0,
					},
					"100%": {
						opacity: 1,
					},
				},
				fadeInUp: {
					"0%": {
						opacity: 0,
						transform: "translateY(20px)",
					},
					"100%": {
						opacity: 1,
						transform: "translateY(0)",
					},
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				bounce: "bounce 1s infinite",
				float: "float 3s ease-in-out infinite",
				pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				fadeIn: "fadeIn 0.5s ease-out forwards",
				fadeInUp: "fadeInUp 0.5s ease-out forwards",
			},
			transitionProperty: {
				height: "height",
				spacing: "margin, padding",
				width: "width",
				transform: "transform",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
export default config
