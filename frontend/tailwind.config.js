/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        screens: {
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
        },
        extend: {
            colors: {
                palette: {
                    green: "#ccd5ae",
                    lightgreen: "#e9edc9",
                    beige: "#fefae0",
                    skin: "#faedcd",
                    brown: "#d4a373",
                },
            },
            width: {
                128: "512px",
            },
        },
    },

    plugins: [],
};
