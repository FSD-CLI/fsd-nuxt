import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  telemetry: false,
  devtools: { enabled: true },
  dir: {
    pages: 'app/routes',
  },
  pages: true,
  css: ['~/app/styles/index.css'],
  modules: [
    '@nuxt/eslint',
    // fsd-cli:modules:start
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    // fsd-cli:modules:end
  ],
  runtimeConfig: {
    public: {
      apiBase: '/api',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    strict: true,
  },
})
