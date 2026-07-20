# User Manual UI system

Status: Goal 2 source of truth

The UI system separates portable decisions from web rendering:

- `packages/theme/src/system.ts` owns named type, control, layout, motion, and layer values. These names are the future React Native mapping contract.
- `packages/theme/src/theme.ts` owns semantic theme colors, fonts, radii, spacing, and textures.
- `apps/web/src/themes/ThemeProvider.tsx` translates both contracts into scoped CSS custom properties.
- `apps/web/src/components/ui/System.tsx` and `System.module.css` own the web primitives.
- `/ui-lab` renders every supported primitive and meaningful state. It is intentionally unlinked and marked `noindex`.

## Component boundary

Use a shared primitive when the element repeats across multiple routes or owns a cross-cutting contract such as focus, disabled, error, loading, overflow, or reduced motion. Keep expressive, product-specific combinations as molecules. `CloudButton` is a molecule: it consumes shared tokens and accessibility rules, but its cloud choreography should not be flattened into a generic card.

Current primitives:

- layout: `Stack`, `Cluster`
- type: `Eyebrow`, `Heading`, `Text`
- action: `Button`, `ButtonLink`, `IconButton`, `Chip`, `ChipButton`, `ChipRail`
- structure: `Divider`, `Surface`
- feedback: `Notice`, `EmptyState`, `Skeleton`
- forms: `TextField`, `Checkbox`
- iconography: `SystemIcon` is the single rounded-stroke family for actions and states
- completion: `CompletionBadge` is the canonical scalloped completion action; incomplete is an outlined seal with a check, complete fills that same seal with the active accent and reverses the check to white. Both states announce themselves on hover or keyboard focus.
- progression: `ProgressionStatus` owns free, paid, locked, in-progress, completed, and coming-soon labels plus their top-positioned hover/focus explanations.
- purchase: `PurchaseFrame` is the canonical $144 lifetime-companion frame. It owns the displayed price, paid-only benefit list, purchase-versus-progression caveat, responsive geometry, and owned state; purchase surfaces compose their own server-safe actions into its action slot.
- purchase disclosure: `PurchaseDisclosure` is the responsive glass lifetime offer on the roadmap. It is a wide sticky bar on desktop and an internally scrollable bottom sheet on mobile, consumes the same price and benefit contract, and preserves a local collapsed/expanded state without duplicating checkout logic. Its pearl texture is decorative; the warm translucent surface and backdrop blur provide the readable material layer.
- library navigation: `LibraryModeSwitcher` owns the Tutorial, Practice, FAQs, and Downloads mode slider. It uses tab semantics and arrow-key navigation; the Practice mode exposes the shared horizontally scrollable filter rail for audio, breathwork, flexibility, Hatha yoga, and meditation.

## Typography roles

Themes assign four semantic roles rather than one global font: display, heading, body, and label. Deeper Slower Easier uses the User Manual display face only for poster-scale display copy, Fredoka for headings and subheadings, and Livvic for body, small copy, and eyebrows.

Practice-world adapters preserve their own visual language while sharing geometry and behavior:

- Wake the F*ck Up: Pacifico headings, Alegreya Sans body
- Prāna Fusion: Amaranth headings and Nexa body; the branded macron is composed so the unsupported glyph cannot silently fall back to another face
- Yoga Reset: regular-weight Lexend Exa headings, Lexend Deca body
- Gravity Yoga: Quicksand throughout
- Here to There: Bubblebody Neue, then Nexa, then the deterministic Lexend Exa fallback

Do not add a font file to the repository without a licensed webfont asset. Local system fonts are useful for review but are not a production delivery mechanism.

## Required states

Every new interactive component must be reviewed in the UI Lab for default, hover, keyboard focus, pressed, disabled, narrow-screen, long-label, and reduced-motion behavior. Components that represent content access must also cover free, paid, locked, in-progress, completed, and coming-soon language where relevant.

## Geometry rules

- Touch controls are at least 44px high unless they are non-interactive labels.
- Completion badges and icon buttons use the same 44px square control geometry.
- Buttons use the shared small, medium, or large control heights.
- Contextual controls may scroll inside their own rail; the document itself must never overflow horizontally.
- Focus indicators are visible and are not communicated by color alone.
- Motion may explain a transition but must never be required to understand or operate a control.
- `prefers-reduced-motion: reduce` disables ambient and ornamental animation.
- Body and feedback copy that benefits from even line lengths uses balanced wrapping with a deliberate maximum measure.
- Hover elevation and focus treatments derive from the active theme accent; practice-world controls must not inherit the Deeper Slower Easier blue.
- Hover shadows stay close to the control: shared buttons, icons, and completion badges use a 3px/8px shadow rather than a broad glow.
- Subheadings use the body family at a heavier weight rather than repeating the title face.
- Icon buttons expose their accessible name as a visible hover/focus tooltip.
- Filter chips sit in a non-wrapping horizontal rail and lift three pixels on hover.
- Cloud drift runs on a deliberately quiet 78–116 second cycle.

## Progress feedback

Completing a level returns to the roadmap with a completion notice that names the next level and any newly available practice world. Paid entitlement changes whether that practice world is ready to open or presented as part of the lifetime companion. Level 6 intentionally has no practice-world unlock yet.

## Purchase copy

`apps/web/src/lib/purchaseContract.ts` is the cross-runtime display contract for the $144 price and included benefits. The free account, Levels 1–6, lesson copy, footnotes, FAQs, and core videos must never be presented as purchase benefits. `PurchaseFrame` may be personalized with the feature that led a member to it, but the price and canonical benefit list remain shared.

The sticky offer renders only on the home roadmap for a signed-in member who does not own the lifetime companion. Purchased members and logged-out visitors never receive the offer. The CTA continues to use `/paid?feature=full-tutorial`, where the existing server checkout action and entitlement checks remain authoritative.

## Adoption rule

Do not mechanically rewrite visually expressive pages. Adopt primitives when a repeated foundation is touched, and compare the page before and after at desktop and mobile widths. The welcome gate and paid companion route are the first representative consumers.

## Verification

Run from `user-manual/`:

```sh
corepack pnpm typecheck
corepack pnpm build:verify
corepack pnpm verify:ui
corepack pnpm test:visual
```

The UI verifier checks token plumbing, component/state coverage, accessibility contracts, reduced motion, representative route adoption, and accidental raw-hex regression on the adopted pages. Visual acceptance additionally requires browser review at 390px and 1440px.
