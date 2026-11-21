---
name: morena-design
description: The complete design system and working style for the Morena's Gowns and Barong project (Next.js, Tailwind, shadcn tokens). Use this whenever the user asks to build, restyle, refine, enhance, or "make less AI-like" any UI for this project, including the landing page, outfit/browse pages, user dashboard, and the admin dashboard and tabs (stat cards, charts, tables, cards). Also use it when they mention Morena, gowns, barong, the landing page, the outfit page, stat cards, the admin tabs, or the 70/20/10 palette, even if they never say "design system".
---

# Morena design

A warm, boutique look that avoids the generic "AI-generated UI" feel. The concept in one line: **less is more, but never bare.** Remove the filler, keep the personality through typography, spacing, layering, and a disciplined palette.

## Working agreement (do this first)

1. **Ask before building.** The user wants clarifying questions and a short plan on every prompt. Use the tappable-options tool with 2 to 4 short, mutually exclusive options, then build. When their message already answers the questions (they gave a precise instruction), a short plan plus one or two confirmations is enough.
2. **Only touch the file being worked on.** Do not convert or "fix" other files.
3. **Never change logic.** Restyle JSX and classes only: queries, hooks, handlers, data shapes, and routes stay as they are.
4. **Do not oversimplify.** Removing generic elements is not the same as stripping the design. Each section still needs hierarchy and a point of interest.
5. **Say what you assumed.** If copy, data, or a component you cannot see is involved, state the assumption in one line.
6. **Keep the user's own edits.** If they paste a file changed by another tool, diff it against yours and keep their changes.

## Palette and tokens

Use design-system tokens, not hex values: `bg-primary`, `text-primary`, `text-secondary`, `bg-accent`, `text-accent-foreground`, `bg-muted`, and so on.

| Token            | Value                                             | Role                                                         |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| primary          | `#4a342c` brown (hover `#38261f`)                 | Dominant: text, buttons, large dark sections                 |
| secondary        | `#243B53` navy (replaced the old green `#315343`) | Supporting: price cards, stat cards, selected states, labels |
| accent           | `#D6B477` gold (text on it: `#40251F`)            | Small highlights only                                        |
| foreground       | `#40251F`                                         | Body text                                                    |
| muted            | `#F3EAE0` cream                                   | Light panels and section backgrounds                         |
| muted-foreground | `#806B5C`                                         | Quiet text                                                   |
| border / input   | `#E4D8C8`                                         | Only where a real border is required                         |

**70/20/10, dark-led:** about 70% primary, 20% secondary, 10% accent. Brown carries text, buttons, and the heavy sections (About, Reviews, Footer). Navy carries price cards, stat cards, and selected states. Gold is the small highlight: CTA fill on dark backgrounds, "With AR" badges, star icons, clock icons, hover colors, attention dots.

- Gold is **never body text on a light background** (too faint). Use it as text only on brown or navy.
- Light page and section backgrounds are white or cream `bg-muted`. Never a green or brown tint.
- Cards and contained panels use a white background. Do not use gray, cream, or `bg-muted` as a card fill. Intentional dark feature cards, such as navy admin stat cards, are the exception.
- Dense admin pages use a cream `bg-muted` canvas with white group cards so separate data areas remain visible without nested containers.
- On landing and editorial pages, alternate section backgrounds so neighboring sections differ: white, cream, brown, navy.

## What to remove (the "AI-generic" list)

- Gradients: image overlays, section backgrounds, avatars. Text on images uses a **flat tint** such as `bg-primary/85`.
- Decorative divider lines and repeated row rules. Use a divider only when spacing and grouping cannot communicate a necessary relationship.
- Numbering like 01, 02, 03.
- Rows of five stars. Use one filled star plus the number.
- Icon-in-circle or icon-in-square cards, and an icon beside every label.
- Nested or repeated card borders, rings, heavy shadows, glows, and blur circles. A top-level group card may use one subtle border or one soft shadow for separation, never both.
- Tiny uppercase, letter-spaced labels and eyebrows. Count pills.
- Extra subheaders and captions that just repeat the title.
- Dashed-border empty states.

## Typography (keep identical everywhere)

Decide the scale once and reuse it. Sentence case always.

- Section title: `text-4xl font-semibold md:text-5xl`, `text-primary` on light, white on dark.
- Sub-section title: `text-3xl font-semibold md:text-4xl`.
- Admin section heading: `text-xl font-semibold md:text-2xl text-primary`.
- Subheader: `text-lg leading-relaxed md:text-xl`, `text-secondary/70` (white/70 on dark), `max-w-2xl`, one line or two.
- Body: `text-lg`, `leading-relaxed`, `text-secondary/70`.
- Card or item name: `text-lg` to `text-xl font-semibold text-primary`.
- Labels: `text-base`. Captions and hints: `text-sm`. Keep `text-xs` for stock hints only.
- Stat labels are sentence case body-style text, not uppercase.

## Layout and spacing

- Sections: `py-16 md:py-24`, container `mx-auto max-w-7xl px-4 md:px-6`, gap between header and content `mt-12`.
- Header pattern: a centered title with one subheader above the content, **or** the headline in the first column (Contact, AR). Keep each section's existing column structure unless the user asks otherwise.
- Keep `SmokeCircles` on sections that have it: section `relative overflow-hidden`, content `relative z-10`.
- Corners stay `rounded-xl` on the landing and outfit pages. The admin stat card and panels use `rounded-lg`.
- Use spacing and background contrast first. On dense admin pages, a single restrained card edge may separate major data groups when contrast alone is insufficient.

## Component patterns

**Buttons**

- Landing CTA: `h-14 px-8 text-base` with an arrow icon, one clear CTA per section. On dark backgrounds use the gold fill with `accent-foreground` text.
- Outside the landing page (outfit page, dashboards) buttons stay standard `lg`, not oversized.

**Cards**

- Use one white `bg-background` card for each meaningful information group. A card may have either `border border-border/50` or a soft `shadow-sm`, never both.
- Do not nest card-styled containers. Content inside a group card stays flat and uses headings, columns, spacing, or a light tonal row to organize related values.
- Do not turn every field into a tile. Group fields by task or meaning, and give the group one clear heading and surface.
- "Pinned note" feel for reviews and photo pairs: alternating vertical offsets (use margin, not `translate`, so `overflow-x` does not clip) and a 0.5 to 1 degree tilt.
- Empty states: faded placeholder cards plus one short message and a CTA. Keep loading skeletons separate from empty states.

**Carousels**

- Straight, aligned row, four across on desktop, swipe and drag. No arrows unless asked.
- Cards carry `shadow-lg shadow-primary/20`, lift on hover (`-translate-y-1.5`), photo zoom `scale-105`. Give the track extra padding with matching negative margin so shadows are not clipped.
- Keep the skeleton.

**Photos**

- Separate white-background photos from a white page with a shadow, a `bg-muted` backdrop (`p-3`), and a gentle hover zoom.
- Text over an image sits on a flat `bg-primary/85` bar.

**Pickers (color, size)**

- Row layout: label on the left, choices on the right. Large clear headings ("Pick a color", "Pick a size").
- Larger swatches with the selected name shown; size tiles with a stock hint ("In stock", "Only 3 left", "Sold out"); selected state in secondary.
- A soft pulsing ring in the accent color until something is chosen, disabled under `motion-reduce`.
- A sticky action bar holds the Add to Cart and AR buttons, buttons only.

**Tables**

- White `bg-background` panel with one subtle outer border or soft shadow, no ring, sentence-case muted header text, and soft `hover:bg-muted/40`.
- Avoid boxed cells and borders around every row. Use row spacing or an occasional divider only when the table becomes difficult to scan without it.
- Separate grouped rows with extra top padding, not rules.

**Admin pages**

- Use a cream page canvas and group the page into white top-level cards based on operational meaning (Overview, Payment, Customer, Fulfillment, and so on).
- Each major data group gets its own visible surface. Keep all fields and subgroups inside that surface flat; never place a complete card inside another card.
- Use headings, responsive columns, whitespace, and restrained tonal rows to separate data within a card. Avoid presenting the whole page as one uninterrupted section.
- Stat cards stay navy with a one-line context caption; the headline card is larger. Attention is a pulsing gold dot, plus a gold strip above the cards that only appears when something needs action.
- Chart panels stay white with a small palette-colored dot beside the title and an optional key figure.
- Status badges use solid palette colors: destructive for out, gold for low, navy for healthy.

## Motion

Subtle and purposeful: 200 to 500 ms transitions, small lifts, soft pulses. Always respect `prefers-reduced-motion`. Keep focus rings.

## Copy

Shorten descriptions but keep the meaning. Drop headings and captions that restate the obvious. Prefer one clear line over two.

## Before you deliver

- Tokens used, no stray hex, no leftover `a87353` or old green.
- Dense admin pages have a contrasting canvas and clearly separated top-level data groups.
- Cards and contained panels are white unless they are an intentional dark feature card.
- No nested cards, repeated border boxes, gradients, decorative dividers, numbering, star rows, uppercase tracked labels, or rings.
- Type scale matches the rest of the project.
- Logic untouched and the file list is exactly what was asked for.
- Assumptions about hidden components or data are stated in the reply.
