# Secundo ERP — Brand Guidelines v1.0

> Last updated: 2026-03-20
> Status: Active

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | Gold/Yellow `oklch(0.75 0.18 85)` ~ `#C4962C` |
| Sidebar Color | Dark Navy `oklch(0.18 0.03 260)` ~ `#1B1F2E` |
| Primary Font (body) | Inter |
| Heading Font | Playfair Display |
| Monospace Font | SF Mono / Consolas |
| Voice | Professionnel, Fiable, Chaleureux |
| Language | French (FR-BE) |
| Border Radius | 20px (base), rounded-2xl |

---

## 1. Color Palette

### Primary Colors

| Name | Value | Hex approx. | Usage |
|------|-------|-------------|-------|
| Gold Primary | `oklch(0.75 0.18 85)` | #C4962C | CTAs, active states, brand accent, links |
| Gold Hover | `oklch(0.65 0.18 85)` | #A67D24 | Hover states, emphasis |
| Gold Light | `oklch(0.75 0.18 85) / 10%` | — | Badges background, subtle tints |

### Sidebar (Dark)

| Name | Value | Hex approx. | Usage |
|------|-------|-------------|-------|
| Sidebar BG | `oklch(0.18 0.03 260)` | #1B1F2E | Main sidebar background |
| Sidebar Dark | `oklch(0.14 0.03 260)` | #141723 | Dark mode sidebar |
| Sidebar Accent | `oklch(0.24 0.025 260)` | #282D3E | Active nav item highlight |
| Sidebar Border | `oklch(0.26 0.02 260)` | #2E3344 | Nav separators |

### Neutral Palette (Light Mode — Stone base)

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#fafaf9` | Page background |
| Card | `#ffffff` | Cards, elevated surfaces |
| Foreground | `#0c0a09` | Primary text |
| Secondary | `#f5f5f4` | Secondary backgrounds, muted areas |
| Muted Foreground | `#78716c` | Captions, placeholders, labels |
| Border | `#e7e5e4` | Dividers, card borders, input borders |
| Input | `#e7e5e4` | Form input borders |

### Neutral Palette (Dark Mode)

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0c0a09` | Page background |
| Card | `#1c1917` | Cards, elevated surfaces |
| Foreground | `#fafaf9` | Primary text |
| Secondary | `#292524` | Secondary backgrounds |
| Muted Foreground | `#a8a29e` | Captions, placeholders |
| Border | `#292524` | Dividers, card borders |

### Chart Colors

| Token | Value | Usage |
|-------|-------|-------|
| Chart 1 | `oklch(0.75 0.18 85)` | Primary data series (Gold) |
| Chart 2 | `oklch(0.6 0.15 160)` | Secondary series (Teal) |
| Chart 3 | `oklch(0.55 0.15 250)` | Tertiary series (Blue) |
| Chart 4 | `oklch(0.65 0.18 35)` | Quaternary series (Orange) |
| Chart 5 | `oklch(0.7 0.15 320)` | Quinary series (Pink) |

### Semantic Colors

| State | Value | Usage |
|-------|-------|-------|
| Destructive | `oklch(0.55 0.2 27)` | Errors, destructive actions, alerts |
| Success | `#22c55e` | Positive states, validations |
| Warning | `#f59e0b` | Cautions, pending items |
| Info | `#3b82f6` | Informational messages |

### Accessibility

- Text on light background: 12.6:1 contrast ratio (AAA)
- Gold primary on white: 3.1:1 — always used with bold/large text or as decorative accent
- All interactive elements meet WCAG 2.1 AA standards
- Dark mode maintains equivalent contrast ratios

---

## 2. Typography

### Font Stack

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-heading: "Playfair Display", Georgia, "Times New Roman", serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

### Type Scale

| Element | Size (Desktop) | Size (Mobile) | Weight | Line Height | Font |
|---------|----------------|---------------|--------|-------------|------|
| H1 | 36px (2.25rem) | 28px | 700 | 1.2 | Playfair Display |
| H2 | 30px (1.875rem) | 24px | 600 | 1.25 | Playfair Display |
| H3 | 24px (1.5rem) | 20px | 600 | 1.3 | Inter |
| H4 | 20px (1.25rem) | 18px | 600 | 1.35 | Inter |
| Body | 14px (0.875rem) | 14px | 400 | 1.5 | Inter |
| Body Large | 16px (1rem) | 16px | 400 | 1.6 | Inter |
| Small / Label | 12px (0.75rem) | 12px | 500 | 1.4 | Inter |
| Caption | 10px (0.625rem) | 10px | 400 | 1.4 | Inter |

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
```

---

## 3. Logo Usage

### Variants

| Variant | File | Use Case |
|---------|------|----------|
| Light (white text) | `public/logo-light.svg` | Dark sidebar, dark backgrounds |
| Dark (dark text) | `public/logo-dark.svg` | Light backgrounds |
| GringoAI avatar | `public/gringo-ai-logo.png` | AI assistant, chat bubbles |

### Logo Anatomy

- "Secundo" wordmark in white/dark text
- Yellow/gold roof shape above the "S" (brand mark)
- Combined as horizontal lockup

### Clear Space

Minimum clear space = height of the roof mark

### Minimum Size

| Context | Minimum Width |
|---------|---------------|
| Digital — Full Logo | 120px |
| Digital — Icon only | 24px |
| Sidebar | 140px width |

### Don'ts

- Don't rotate or skew the logo
- Don't change the gold/yellow roof color
- Don't place on busy backgrounds without contrast
- Don't add shadows or effects to the logo
- Don't use the light logo on light backgrounds

---

## 4. Voice & Tone

### Brand Personality

| Trait | Description |
|-------|-------------|
| **Professionnel** | Expertise immobilier, connaissances solides du marche espagnol |
| **Fiable** | Inspire confiance, donnees precises, transparence |
| **Chaleureux** | Approche humaine, accompagnement personnalise |
| **Efficace** | Resultats concrets, pas de jargon inutile |

### Voice Chart

| Trait | We Are | We Are Not |
|-------|--------|------------|
| Professionnel | Expert, structure | Froid, distant |
| Fiable | Transparent, rigoureux | Bureaucratique |
| Chaleureux | Accueillant, humain | Familier, desinvolte |
| Efficace | Direct, actionnable | Expeditif, superficiel |

### Tone by Context (French)

| Context | Tone | Example |
|---------|------|---------|
| Dashboard | Factuel, clair | "12 biens disponibles ce mois-ci" |
| Formulaires | Guide, instructif | "Renseignez les informations du client" |
| Erreurs | Calme, solutionnel | "Verifiez les champs obligatoires" |
| Succes | Bref, positif | "Client enregistre avec succes !" |
| Notifications | Concis, actionnable | "Nouvelle tache assignee — Voir" |
| GringoAI | Sympathique, precis | "Il y a **12 villas** vendues au total." |

### Language

- **Interface language**: French (FR-BE)
- **Currency format**: Belgian (250 000 EUR, separator: space, decimal: virgule)
- **Date format**: DD/MM/YYYY (fr-BE locale)
- **Multilingual content**: FR (primary), NL, EN for property descriptions

---

## 5. Imagery Guidelines

### Photography Style

- **Subject matter**: Spanish properties, Mediterranean architecture, sunny landscapes
- **Lighting**: Natural, warm Mediterranean light
- **Color treatment**: Warm tones, enhanced gold/amber highlights
- **Composition**: Clean, inviting, real estate standard angles

### Icons

- **Library**: Lucide React
- **Style**: Outlined, 1.5px stroke
- **Base size**: 16px (size-4), scale to 20px (size-5) for actions
- **Color**: Inherit from text or use `text-muted-foreground`

### GringoAI Avatar

- Robot with mustache logo (grey/white)
- Used as 28px circle in chat bubbles
- Used as 32px circle in dialog headers
- Always displayed as rounded-full

---

## 6. Design Components

### Buttons

| Type | Background | Text | Radius | Usage |
|------|------------|------|--------|-------|
| Primary | Gold `oklch(0.75 0.18 85)` | White `#fff` | `radius-md` (18px) | Main CTAs |
| Secondary | `#f5f5f4` | `#1c1917` | `radius-md` | Secondary actions |
| Ghost | Transparent | Inherit | `radius-md` | Toolbar, icon buttons |
| Destructive | `oklch(0.55 0.2 27)` | White | `radius-md` | Delete, remove |
| Outline | Transparent + border | Inherit | `radius-md` | Alternate secondary |

### Spacing Scale (Tailwind)

| Token | Value | Usage |
|-------|-------|-------|
| 1 (0.25rem) | 4px | Tight inline spacing |
| 2 (0.5rem) | 8px | Compact elements, badge padding |
| 3 (0.75rem) | 12px | Input padding, small gaps |
| 4 (1rem) | 16px | Standard component spacing |
| 6 (1.5rem) | 24px | Card padding, section gaps |
| 8 (2rem) | 32px | Large section margins |
| 12 (3rem) | 48px | Page-level section dividers |

### Border Radius

| Element | Radius | Tailwind |
|---------|--------|----------|
| Buttons | 18px | `rounded-[calc(var(--radius)-2px)]` |
| Cards | 20px | `rounded-2xl` |
| Inputs | 18px | `rounded-[calc(var(--radius)-2px)]` |
| Dialogs/Modals | 20px | `rounded-2xl` |
| Pills/Tags | 9999px | `rounded-full` |
| Sidebar items | 16px | `rounded-xl` |
| Avatars | 9999px | `rounded-full` |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)` | Default card |
| `--shadow-card-hover` | `0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)` | Card hover |
| `--shadow-elevated` | `0 4px 16px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.06)` | Dialogs, popovers |

### Card Pattern

```css
.card-premium {
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--card);
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
  transition: box-shadow 200ms;
}
.card-premium:hover {
  box-shadow: var(--shadow-card-hover);
}
```

---

## 7. Layout

### Page Structure

```
+--[ Sidebar (272px, dark) ]--+--[ Main Content ]--+
|  Logo (140x41)              |  Header (h-16)     |
|  Navigation                 |  Page content      |
|  (collapsible on mobile)    |  (max-w-full)      |
+---------+-------------------+--------------------+
```

### Sidebar

- Width: 272px (`w-[17rem]`)
- Background: `oklch(0.18 0.03 260)` (dark navy)
- Text: `#f5f5f4` (stone-100)
- Active item: gold left border + `oklch(0.24 0.025 260)` background
- Mobile: Sheet overlay from left, same styling

### Header

- Height: 64px (`h-16`)
- Background: `bg-background`
- Border bottom: `border-border/60`
- Shadow: `0 1px 3px rgba(0,0,0,0.03)`
- Contains: mobile menu, GringoAI trigger (Cmd+K), notifications, theme toggle, user menu

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 768px | Sidebar hidden (Sheet), stacked layouts |
| Tablet | 768-1024px | Sidebar visible, 2-col grids |
| Desktop | > 1024px | Full layout, sidebar + content |

---

## 8. Data Tables

### Style

- Full width, border-collapse
- Header: `text-muted-foreground`, `text-xs`, uppercase tracking
- Rows: `border-b border-border`, hover `bg-muted/50`
- Cells: `py-3 px-4`, `text-sm`
- Status badges: `rounded-full`, colored by status

### Status Badge Colors

| Status | Background | Text |
|--------|------------|------|
| Disponible / Actif | `bg-green-500/10` | `text-green-600` |
| Reserve / En cours | `bg-amber-500/10` | `text-amber-600` |
| Vendu / Termine | `bg-blue-500/10` | `text-blue-600` |
| Retire / Inactif | `bg-gray-500/10` | `text-gray-600` |
| Prospect | `bg-purple-500/10` | `text-purple-600` |
| Urgent | `bg-red-500/10` | `text-red-600` |

---

## 9. Forms

### Input Style

- Height: `h-10` (40px)
- Padding: `px-3 py-2`
- Border: `border border-input` (`#e7e5e4`)
- Focus: `ring-2 ring-ring` (gold)
- Background: `bg-background` (light) / `bg-input/30` (dark)
- Radius: `rounded-md` (18px)
- Font: `text-sm`

### Labels

- Font: `text-sm font-medium`
- Color: foreground
- Spacing: `mb-2` above input

### Validation

- Error border: `border-destructive`
- Error text: `text-destructive text-sm mt-1`
- Required indicator: `*` in red after label

---

## 10. GringoAI Component

### Dialog Layout

```
+---------------------------------------+
| [Logo 32px] GringoAI      [Nouvelle]  |
|             Ask Gringo...              |
+---------------------------------------+
|                                        |
|  (suggestions if empty)               |
|                                        |
|  [User bubble - primary bg]  [Avatar] |
|  [Logo] [Assistant bubble - muted bg] |
|                                        |
+---------------------------------------+
| [Textarea]                    [Send]   |
| Enter envoyer / Shift+Enter newline    |
+---------------------------------------+
```

### Bubbles

| Role | Background | Text | Avatar |
|------|------------|------|--------|
| User | `bg-primary` (gold) | `text-primary-foreground` (white) | User icon in `bg-primary/10` |
| Assistant | `bg-muted` | Inherit | GringoAI logo 28px rounded |
| Loading | `bg-muted` | `text-muted-foreground` | GringoAI logo + Loader2 spinner |

### Suggestions

- `rounded-full border border-border bg-card`
- Hover: `bg-accent text-accent-foreground`
- Font: `text-xs`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-20 | Initial guidelines from existing ERP codebase |
