# Landing page visual assets

Generated using the built-in Imagegen tool (not the API/CLI fallback). The original PNGs and optimized WebP versions are saved here. The modular illustration retains its alpha channel.

- `possibility-landscape.png` / `possibility-landscape.webp`: hero and closing section background.
- `modular-blocks.png` / `modular-blocks.webp`: transparent modular feature illustration and media preview.

## Landscape prompt

```text
Use case: stylized-concept
Asset type: wide landscape background behind a floating software dashboard on the Kitravo starter-kit landing page.
Primary request: an elevated, dreamlike architectural landscape suggesting a fresh start and possibility.
Scene/backdrop: endless pale lavender-blue sky, hazy distant alpine peaks, soft white clouds. Sculptural smooth ivory terraces and a large minimalist circular portal on the right edge, a few tiny natural alpine rocks, soft lavender ground. Center remains relatively uncluttered to place a product dashboard over it.
Style/medium: premium photorealistic 3D editorial art, sophisticated architectural render, natural material detail, no cartoon look.
Composition/framing: panoramic 16:9 landscape, quiet top third, beautiful depth, architectural elements on outer edges, pale luminous center.
Lighting/mood: diffuse morning sunlight, optimistic and serene, subtle shadows.
Color palette: chalk white, misty blue, pale lavender with restrained deep indigo accents; consistent with an indigo and white software brand.
Constraints: no people, no text, no logos, no UI, no watermark. Full bleed opaque background.
```

## Modular illustration prompt

```text
Use case: stylized-concept
Asset type: transparent cutout illustration for Kitravo software starter kit feature card.
Primary request: a beautifully crafted sculptural modular assembly: three stacked rounded-square porcelain tiles slightly separated vertically, with one vivid indigo glass cube fitting into a precise square socket in the top tile. A visual metaphor for modular building blocks.
Style/medium: premium tactile 3D product illustration, soft ivory ceramic, translucent indigo glass, precise beveled edges, subtle ambient shadow.
Composition/framing: isolated single object, three-quarter isometric view, centered, generous transparent padding, square composition, nothing cropped.
Lighting/mood: soft studio lighting, elegant, playful but restrained.
Color palette: chalk white and deep indigo matching the existing Kitravo brand.
Constraints: genuinely transparent background with alpha, no floor or backdrop, no letters, text, logos, watermark, extra objects or interface.
```

## Interaction references

Local implementations adapt the cursor spotlight, perspective, and bento layout patterns to existing Motion and theme tokens. No additional runtime package was added.

- [Magic UI Magic Card](https://magicui.design/docs/components/magic-card)
- [Magic UI Bento Grid](https://magicui.design/docs/components/bento-grid)
- [Aceternity UI 3D Card](https://ui.aceternity.com/components/3d-card-effect)

All animations respond to pointer, scroll or click. Reduced motion is honored. The AI workflow is a local illustrative demo, not an API integration.

