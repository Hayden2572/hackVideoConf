/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#E6F2FF',
                    100: '#CCE4FF',
                    200: '#99CAFF',
                    300: '#66AFFF',
                    400: '#3395FF',
                    500: '#0066CC',
                    600: '#0052A3',
                    700: '#003D7A',
                    800: '#002952',
                    900: '#001429',
                },
                secondary: {
                    500: '#003366',
                    600: '#002952',
                    700: '#001F3F',
                    800: '#001529',
                    900: '#000C19',
                }
            }
        },
    },
    plugins: [],
}