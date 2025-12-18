/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#2b8cee",
                "primary-dark": "#1a6bb8",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                "surface-light": "#ffffff",
                "surface-dark": "#1c2a36",
                "text-main": "#0d141b",
                "text-secondary": "#4c739a",
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
