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
                    lightbrown: "#e6ccb2",
                    brown: "#b08968",
                    darkbrown: "#7f5539",
                },
            },
            width: {
                128: "512px",
            },
            maxWidth: {
                192: "768px",
            },
        },
    },

    plugins: [],
};
