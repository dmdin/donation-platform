module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'), require("@tailwindcss/typography")],
  daisyui: {
    themes: ['winter', 'night'],
  }
};
