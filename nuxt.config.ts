// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {enabled: true},
  modules: ['@pinia/nuxt', '@nuxt/eslint'],

  components: [{path: '~/components', pathPrefix: false, extensions: ['.vue']}],

  imports: {
    dirs: ['~/composables/**/index.ts'],
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },
});
