/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body:     ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        serif:    ['"Newsreader"', 'Georgia', 'serif'],
        label:    ['"Manrope"', 'system-ui', 'sans-serif'],
        sans:     ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Light theme */
        surface: {
          DEFAULT: '#f5f6ff',
          low:     '#edf0ff',
          mid:     '#e0e8ff',
          high:    '#d8e2ff',
          top:     '#ffffff',
          dim:     '#c3d4ff',
        },
        primary: {
          DEFAULT:   '#005da4',
          container: '#4fa4ff',
          dim:       '#3996f3',
          on:        '#edf3ff',
        },
        secondary: {
          DEFAULT:   '#00694d',
          container: '#60fcc6',
          dim:       '#4eeeb9',
          on:        '#ffffff',
        },
        tertiary: {
          DEFAULT:   '#6e5900',
          container: '#fcd43e',
          dim:       '#edc62f',
        },
        academic: {
          text:    '#1c2e51',
          muted:   '#4a5b80',
          outline: '#65779d',
          border:  '#9badd7',
        },
        error: {
          DEFAULT:   '#b31b25',
          container: '#fb5151',
        },
        /* Dark theme (login) */
        dark: {
          bg:      '#031425',
          surface: '#0f2131',
          high:    '#1a2b3c',
          top:     '#253648',
          primary: '#b7c8de',
          text:    '#d2e4fb',
          muted:   '#c4c6cd',
        },
      },
      borderRadius: {
        'sm':  '0.375rem',  /* 6px  — chips, small badges */
        'DEFAULT': '1rem',  /* 16px — standard cards */
        'lg':  '2rem',      /* 32px — large containers */
        'xl':  '3rem',      /* 48px — sheets, hero */
        '2xl': '4rem',
        'full': '9999px',
      },
      boxShadow: {
        'academic': '0 8px 32px rgba(28,46,81,0.06)',
        'academic-lg': '0 20px 40px rgba(0,15,31,0.12)',
        'float': '0 -8px 32px rgba(28,46,81,0.06)',
        'card': '0 2px 12px rgba(0,93,164,0.08)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
