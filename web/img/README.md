# Archetype illustrations (AI image slots)

The story results screen shows one hero image per career archetype. Each archetype
loads an optional raster illustration from this folder:

```
web/img/archetype-<key>.webp
```

…where `<key>` is the archetype key from `engine/careerArchetypes.js`:

| key | archetype |
|---|---|
| `creative`    | The Independent Creative |
| `founder`     | The Founder |
| `steady`      | The Steady Professional |
| `helper`      | The Helper |
| `expert`      | The Investigator |
| `leader`      | The Operator |
| `changemaker` | The Changemaker |
| `maker`       | The Maker |

## Graceful fallback

If a file is missing, the app falls back to the **generative SVG art** in
`web/archetypeArt.js` (on-brand, themed by the archetype accent colour). So the
experience looks complete with zero images; each `.webp` you add simply upgrades
one slot. No code change is needed to "turn images on" — just drop the files in.

## Specs

- Format: **WebP** (or PNG/JPG — update the `data-src` extension in `app.js` if not webp).
- Aspect ratio: **16:10** (the hero box is `aspect-ratio: 16/10`), e.g. **1600×1000**.
- Keep the focal subject centred; edges may be cropped on narrow screens.
- Two palettes (dark "Twilight" / light "Bloom") share one image — keep it legible on both.

## Generating them

See `docs/ARCHETYPE_IMAGE_PROMPTS.md` for art-directed, copy-paste prompts (one per
archetype) tuned to the Compass aesthetic.
