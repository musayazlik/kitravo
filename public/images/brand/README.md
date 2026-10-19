# Kitravo logo

The canonical artwork is [`public/logo.png`](../../logo.png), the supplied
1254 × 1254 transparent blue K monogram. Keep this source image unchanged.

- `src/config/brand.ts` defines the brand name and logo path/dimensions.
- The shared `LogoMark` component renders `/logo.png` with Next.js Image in the
  public navigation, footer, workspace, previews, mail and sign-in illustration.
- `src/app/[lang]/icon.png` (256 × 256) and `src/app/favicon.ico` (16/32/48)
  are resized from the same artwork. The icon crops trim transparent padding
  and fit the mark inside a square with a 6% inset on each side.
- The primary `ink` token in `src/app/globals.css` matches the logo's blue
  (`#1147db`); chart colours are mirrored in `src/lib/chart-colors.ts`.

If the canonical artwork changes, regenerate both app icons from it as well.
