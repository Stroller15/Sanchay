# BizLink-Inspired UI Redesign

**Date:** 2026-03-29
**Scope:** All pages — dashboard, sign-in, sign-up, settings, landing
**Approach:** Option B — Tokens + component refresh (keep existing layout/functionality, update visual style)

---

## Inspiration

BizLink dashboard (https://ronasit.com). Key characteristics:

- Warm off-white background (not pure white)
- Clean white cards with subtle shadows and medium border radius
- Dark/black primary CTA buttons (no blue accent)
- Geometric sans-serif typography (Inter)
- Very generous whitespace
- Neutral-only color palette — no colored accents except danger/success
- Subtle borders throughout

---

## 1. Typography

**Font:** Switch from Geist Sans → **Inter** via `next/font/google`

- Headings: `font-semibold` or `font-bold`, `--color-text-primary`
- Body: `font-normal`, `--color-text-primary`
- Secondary labels: `--color-text-secondary`
- Tertiary/muted: `--color-text-tertiary`

---

## 2. Design Tokens

### Light Mode

| Token                    | Value     | Usage                            |
| ------------------------ | --------- | -------------------------------- |
| `--color-bg`             | `#F5F4F0` | Page background (warm off-white) |
| `--color-surface`        | `#FFFFFF` | Cards, sidebar, header           |
| `--color-border`         | `#E8E6E1` | All borders                      |
| `--color-text-primary`   | `#111110` | Headings, body text              |
| `--color-text-secondary` | `#6B6965` | Labels, descriptions             |
| `--color-text-tertiary`  | `#9B9895` | Placeholders, muted text         |
| `--color-accent`         | `#111110` | Primary button bg                |
| `--color-accent-fg`      | `#FFFFFF` | Primary button text              |
| `--color-danger`         | `#DC2626` | Destructive actions              |
| `--color-success`        | `#16A34A` | Success states                   |

### Dark Mode

| Token                    | Value     |
| ------------------------ | --------- |
| `--color-bg`             | `#0F0E0D` |
| `--color-surface`        | `#1C1B1A` |
| `--color-border`         | `#2C2A28` |
| `--color-text-primary`   | `#F5F4F0` |
| `--color-text-secondary` | `#A09D99` |
| `--color-text-tertiary`  | `#6B6965` |
| `--color-accent`         | `#F5F4F0` |
| `--color-accent-fg`      | `#111110` |

**Removed:** Blue accent (`#2563eb`) — entirely replaced by neutral black/white.

---

## 3. Shared Component Patterns

### Primary Button

- Background: `--color-accent`, text: `--color-accent-fg`
- Border radius: `10px`
- Padding: `px-4 py-2`, `text-sm font-medium`
- No shadow

### Ghost Button

- Background: transparent, border: `--color-border`
- Text: `--color-text-secondary`
- Hover: `--color-bg` background

### Input Fields

- Background: `--color-bg`
- Border: 1px `--color-border`, radius `8px`
- Placeholder: `--color-text-tertiary`
- Focus: border darkens to `--color-text-secondary`

### Pill/Badge

- Background: `#F0EFEB` (light) / `#252321` (dark)
- Text: `--color-text-secondary`
- Border radius: `9999px`
- No colored variants (all neutral)

---

## 4. Sidebar

- Background: `--color-surface`, right border: `--color-border`
- App name: `font-bold text-lg`, `--color-text-primary`
- Nav items: icon + label, hover bg `--color-bg`, radius `8px`
- Active item: `--color-bg` bg, `font-medium`
- Collection rows: emoji + name + neutral count badge
- "New collection" button: dashed border, ghost style
- Section dividers: `--color-border`

---

## 5. Dashboard Header & Toolbar

- Background: `--color-surface`, bottom border: `--color-border`
- Search bar: pill-shaped, `--color-bg` fill, search icon left
- Theme toggle: icon-only ghost button
- Settings / avatar / sign out: icon-only ghost buttons
- Paste bar: `--color-surface` bg input + dark primary "Save" button

---

## 6. Resource Cards

- Background: `--color-surface`
- Border: 1px `--color-border`, radius `12px`
- Shadow: `0 1px 3px rgba(0,0,0,0.06)`
- Hover: shadow lifts to `0 4px 12px rgba(0,0,0,0.08)`
- Favicon: `20px`, slightly rounded
- Title: `font-medium`, `--color-text-primary`
- Hostname: `text-xs`, `--color-text-tertiary`
- Type badge: neutral pill
- Tags: neutral pills
- Edit/Delete: icon-only, appear on hover, `--color-text-secondary`
- Loading skeleton: warm gray shimmer (`--color-bg`)
- Empty state: centered muted text, no heavy illustration

---

## 7. Sign-in & Sign-up Pages

- Page background: `--color-bg`
- Card: `--color-surface`, `--color-border` border, radius `12px`, subtle shadow
- App name: `font-bold text-2xl`, `--color-text-primary`
- Subtitle: `--color-text-secondary text-sm`
- Google button: outlined (`--color-border` border, white bg, Google icon)
- Dev banner: keep yellow warning (functional)
- Dev email input: standard input style
- Dev sign-in button: primary dark button style

---

## 8. Settings Page

- Page background: `--color-bg`
- Page title: `font-bold text-xl`
- Section cards: `--color-surface`, `--color-border` border, radius `12px`, subtle shadow
- API key rows: name + masked value + copy (ghost) + delete (ghost, danger on hover)
- "Create API key" button: primary dark button
- Inputs: standard input style
- Empty state: muted centered text

---

## Implementation Notes

- Update `globals.css` — replace all color tokens
- Update `app/layout.tsx` — swap Geist for Inter
- Update `components/ui/button.tsx` — remove blue variants, update primary/ghost styles
- Update each dashboard component and page to use new token classes
- Remove all hardcoded `blue-*` Tailwind classes; replace with neutral equivalents
