import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ['./app/{app,pages,widgets,features,entities,shared}/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./app/widgets/**'],
    rules: {
      'fsd/repetitive-naming': 'off',
    },
  },
  {
    files: ['./app/app/routes/**', './app/shared/assets/**', './app/shared/types/**'],
    rules: {
      'fsd/segments-by-purpose': 'off',
    },
  },
])
