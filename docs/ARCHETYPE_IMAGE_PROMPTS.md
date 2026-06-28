# Archetype illustration prompts (AI image generation)

Copy-paste prompts to generate the eight career-archetype hero images for the
Compass story flow. Drop the results into `web/img/archetype-<key>.webp` (16:10,
~1600×1000). Until then the app shows on-brand generative SVG art automatically.

## Shared style (prepend or keep consistent across all eight)

> **Style:** dreamy, modern editorial illustration; soft aurora gradients and a
> subtle starfield/constellation motif; painterly light, gentle grain; cinematic,
> calm, aspirational; minimal, lots of negative space; **no text, no logos, no
> faces in sharp focus**; single clear focal subject, centred; works on both a
> dark twilight background and a soft warm background. 16:10 aspect.
>
> **Palette anchor:** deep indigo/plum night with one luminous accent colour
> (specified per archetype).

Keep characters **silhouetted or back-lit / abstracted** (no identifiable faces),
so the image feels like "anyone." Aim for *mood and metaphor*, not literal stock.

---

## creative — The Independent Creative · accent teal `#5eead4`
> A lone figure silhouetted at a window or rooftop at dusk, surrounded by floating
> brushstrokes, musical notes, and drifting light particles that swirl into a
> constellation. Teal-and-violet aurora. A sense of free, self-directed making.

## founder — The Founder · accent amber `#fbbf24`
> A small figure at the foot of a luminous rising path / unbuilt bridge of light
> stretching into a starfield, scaffolding made of golden lines assembling
> mid-air. Amber glow against deep indigo. Bold, risk-taking, building-from-nothing.

## steady — The Steady Professional · accent blue `#60a5fa`
> A calm architectural scene: ordered geometric arches and a single steady lighthouse
> beam over still water, soft blue aurora, balanced and symmetrical. A feeling of
> reliability, structure, and quiet confidence.

## helper — The Helper · accent green `#34d399`
> Two abstracted figures, one gently steadying the other, haloed by warm green light;
> soft concentric rings like ripples of care radiating outward into a starfield.
> Tender, supportive, human warmth.

## expert — The Investigator · accent sky `#38bdf8`
> A figure leaning into a glowing lattice of interconnected nodes and equations
> forming a delicate constellation; a magnifying ring of light revealing hidden
> structure. Cool sky-blue glow. Deep focus, curiosity, mastery.

## leader — The Operator · accent rose `#fb7185`
> A figure at the head of converging lines of light, orchestrating drifting
> geometric shapes into formation across a night sky; commanding but elegant.
> Rose-and-magenta accent over indigo. Influence, momentum, direction.

## changemaker — The Changemaker · accent lime `#4ade80`
> A figure raising a small lantern whose light spreads to ignite a field of distant
> lights/seedlings across a darkened landscape under an aurora; collective awakening.
> Green-gold glow. Justice, hope, ripple-of-impact.

## maker — The Maker · accent indigo `#818cf8`
> Close, tactile scene of skilled hands shaping a glowing object (clay, metal, wood,
> circuitry) with sparks and shavings turning into tiny stars; warm workshop light
> against indigo shadow. Craft, tangibility, hands-on mastery.

---

## Tips
- Generate 2–3 variants per archetype; pick the one that reads at a glance and stays
  legible behind the white/teal title text overlaid in the UI.
- Export **WebP** at ~1600×1000, quality ~80, to keep the PWA light.
- If you use PNG/JPG instead, change the extension in `web/app.js`
  (`data-src="./img/archetype-${key}.webp"`).
- Confirm the generator's licence permits your intended (incl. commercial) use.
