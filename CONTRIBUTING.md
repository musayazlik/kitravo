# Contributing to Kitravo

1. Create a branch for your change.
2. Keep route files thin and implement screens under `src/features/<area>`.
3. Add interface strings to all five language dictionaries and preserve logical RTL styles.
4. Use the shared design tokens and honor reduced-motion preferences.
5. Run `pnpm check` and `pnpm build` before submitting a pull request. Describe the behavior change and relevant validation.

Never commit `.env.local`, `.data`, real account records, credentials, or debug captures. Content-provider integrations should enforce server-side permissions before accessing data. See the authentication and deployment documents in `docs/`.
