import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['.output/**', '.nuxt/**', 'coverage/**', 'commitlint.config.cjs'],
}, {
  files: ['app/app/routes/**/*.vue'],
  rules: {
    'vue/multi-word-component-names': 'off',
  },
})
