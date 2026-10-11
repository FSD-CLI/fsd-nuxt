# FSD Nuxt Starter

Nuxt 4 starter powered by
[Feature-Sliced Design](https://feature-sliced.design/).

This repository is the Nuxt template used by
[`create-fsd-architecture`](https://www.npmjs.com/package/create-fsd-architecture).

## Validation scope

This repository is a starter. Its quality checks cover the template's
architecture, lint, types and build; application-specific security, backend
integration, authentication and deployment require separate validation.
Passing template checks does not certify production deployment. See the
[current CLI release status](https://github.com/FSD-CLI/cli/blob/main/docs/RELEASE-STATUS.md)
for tested combinations and unresolved security findings.

## Create a project

```bash
npx create-fsd-architecture@latest my-app --framework nuxt
```

## Stack

- Nuxt 4 and Vue 3
- TypeScript and server-side rendering
- Pinia through the official Nuxt module
- TanStack Vue Query with SSR hydration
- VeeValidate and Zod through the Nuxt module
- Axios or Nuxt-native `$fetch`
- Tailwind CSS
- Steiger architecture checks
- Nuxt ESLint, Husky, and Commitlint

## Architecture

```text
app/
├── app/       # bootstrap, route wrappers, and global styles
├── pages/     # FSD page slices
├── widgets/
├── features/
├── entities/
└── shared/
```

Nuxt file-based route wrappers live in `app/app/routes`, keeping the FSD
`pages` layer free from accidental nested routes. The dependency direction is
`app → pages → widgets → features → entities → shared`.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run fsd:check
npm run lint
npm run typecheck
npm run build
npm run ci
```

## Generate slices

```bash
npx create-fsd-architecture --generate feature auth
npx create-fsd-architecture --generate entity product
npx create-fsd-architecture --generate widget navigation
npx create-fsd-architecture --generate page checkout
```

## License

MIT

## Support FSD CLI

If this project helps you, you can optionally support its development:

- [GitHub Sponsors](https://github.com/sponsors/ashrafmo-1?frequency=one-time&sponsor=ashrafmo-1)
- [Buy Me a Coffee](https://buymeacoffee.com/ashrafqopiah)
- **InstaPay (Egypt):** `ashrafmo-1`

For InstaPay, use the username exactly as shown and verify the recipient details
in the app before confirming a transfer. Donations are optional.
