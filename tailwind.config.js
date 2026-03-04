/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "neon-purple": "#A855F7",
                "neon-pink": "#EC4899",
                "neon-cyan": "#06B6D4",
                "dark-bg": "#0A0A1A",
                "dark-card": "#12122A",
                "dark-border": "#2D1B69",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                glow: "glow 2s ease-in-out infinite alternate",
                "spin-slow": "spin 3s linear infinite",
                shake: "shake 0.5s ease-in-out",
            },
            keyframes: {
                glow: {
                    "0%": { boxShadow: "0 0 5px #A855F7, 0 0 10px #A855F7" },
                    "100%": {
                        boxShadow:
                            "0 0 20px #A855F7, 0 0 40px #A855F7, 0 0 60px #A855F7",
                    },
                },
                shake: {
                    "0%, 100%": { transform: "translateX(0)" },
                    "25%": { transform: "translateX(-4px)" },
                    "75%": { transform: "translateX(4px)" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "neon-gradient": "linear-gradient(135deg, #A855F7, #EC4899)",
            },
        },
    },
    plugins: [],
};
