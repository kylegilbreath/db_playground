# Rules for Claude and Cursor to follow

## Response and Focus Guidelines

### Target Persona
You are working with a **product designer** who has **little to no frontend knowledge**. They are using this codebase to:
- Prototype designs from Figma
- Test new features and user flows
- Validate design concepts with customers
- Create lightweight mockups for user testing

### How to Respond

**Primary Goal**: Help designers prototype quickly and successfully without overburdening with technical details.

1. **Ask Clarifying Questions About Goals**: Before implementing, ask about:
   - What is the primary goal or user flow being tested?
   - What interactions or behaviors are most important?
   - Are there specific edge cases or states to consider?
   - What level of functionality is needed (static mockup vs. interactive prototype)?

2. **Recommend Incremental Planning**: For complex tasks, suggest:
   - Breaking down the work into smaller, incremental steps
   - Using a planning approach to tackle one piece at a time
   - Starting with the core functionality and building outward
   - Example: "This looks like it might involve multiple components. Should we break this down into smaller steps? I can help plan the incremental approach."

3. **Keep Changes Small**:
   - Make minimal, focused changes
   - One logical change per response when possible
   - Build incrementally rather than large refactors
   - If a change requires multiple files, notify clearly (see #4)

4. **Notify for Large Changes**: When making changes that affect multiple files or significant refactoring:
   ```
   # BIG CHANGE - PLEASE REVIEW

   [Brief description of what's changing and why]

   Files affected:
   - file1.tsx
   - file2.tsx
   - etc.
   ```

5. **Follow Coding Standards Behind the Scenes**:
   - Apply best practices automatically without explaining every detail
   - Use proper component structure, state management, and patterns
   - Only explain technical decisions if they impact the design or functionality
   - Keep explanations focused on what matters for prototyping

6. **Structure Responses Simply**:
   - Brief summary of what's being implemented
   - Focus on the outcome, not the implementation details
   - Use clear, non-technical language
   - Only dive into technical details if the designer asks

**Remember**: The goal is rapid, successful prototyping. Coding standards are followed automatically — focus communication on the design goals and outcomes.

---

## File Structure Guidelines

### Global Components (`components/`)
The `components/` folder should **ONLY** contain components that are:
- Shared across multiple routes/areas of the app
- Used in the root layout or navigation
- Reusable UI components used throughout the application

### Route-Specific Components (`app/[route]/components/`)
Components specific to a particular route should live in that route's `components/` folder.

### Decision Tree

When adding a new component:

1. **Is this component used in multiple routes?**
   - ✅ **Yes** → Place in `components/`
   - ❌ **No** → Place in `app/[route]/components/`

### Import Path Conventions

- **Global components**: `@/components/[ComponentName]`
- **Route-specific components**: `./components/[ComponentName]`

### Proactive Cleanup Guidelines

1. **Unused Global Components**: If a component in `components/` is not imported anywhere, remove it
2. **Misplaced Components**: Move route-specific components out of `components/` and vice versa
3. **Broken Imports**: Fix or remove components with broken imports
4. **Empty Folders**: Remove empty folders after moving/deleting components
5. **Orphaned Files**: Remove files that are no longer referenced

---

## Design System

This project uses **Tailwind CSS** with a custom semantic token system defined in `tailwind.config.ts` and `app/globals.css`. There is **no external design system package** — do not reference `@databricks/design-system` or any npm design system.

### Priority Order for Every Style Decision

1. **Semantic Tailwind token** — use the named classes below
2. **Primitive color/spacing scale** — Tailwind scale values (e.g. `blue-600`, `neutral-500`)
3. **Hardcoded value** — only when no token exists; use hex (e.g. `#2272b4`)

---

### Typography

| Class | Size | Line Height | Use for |
|---|---|---|---|
| `text-paragraph` | 13px | 20px | Default body text |
| `text-hint` | 12px | 16px | Labels, captions, metadata |
| `text-title1` | 32px | 40px | Page titles |
| `text-title2` | 22px | 28px | Section headings |
| `text-title3` | 18px | 24px | Sub-headings |
| `text-title4` | 13px | 20px | Small labels |
| `text-code` | 13px | 20px | Code content |

Font weight: use `font-medium` (500) or `font-semibold` (600). Avoid hardcoding weights.

**Examples:**
- ✅ `<p className="text-paragraph text-text-primary">`
- ✅ `<h2 className="text-title2 font-semibold text-text-primary">`
- ❌ `style={{ fontSize: '13px', lineHeight: '20px' }}`

---

### Spacing

| Token | Value | Example classes |
|---|---|---|
| `xs` | 4px | `p-xs`, `gap-xs`, `m-xs` |
| `sm` | 8px | `p-sm`, `gap-sm` |
| `mid` | 12px | `p-mid`, `gap-mid` |
| `md` | 16px | `p-md`, `gap-md` |
| `lg` | 24px | `p-lg`, `gap-lg` |

**Examples:**
- ✅ `className="flex gap-sm px-md py-xs"`
- ❌ `style={{ gap: '8px', padding: '16px' }}`

---

### Border Radius

| Token | Value | Class |
|---|---|---|
| `sm` | 4px | `rounded-sm` |
| `md` | 8px | `rounded-md` |
| `lg` | 12px | `rounded-lg` |
| `full` | 999px | `rounded-full` |

---

### Colors

Always prefer semantic tokens over primitives.

#### Text
| Class | Use |
|---|---|
| `text-text-primary` | Primary body text |
| `text-text-secondary` | Muted/supporting text |
| `text-text-placeholder` | Input placeholder text |
| `text-text-validation-danger` | Error messages |
| `text-text-validation-warning` | Warning messages |
| `text-text-validation-success` | Success messages |

#### Backgrounds
| Class | Use |
|---|---|
| `bg-background-primary` | Main surface (white) |
| `bg-background-secondary` | Subtle fill (light grey) |
| `bg-background-tertiary` | Pressed/active fill |
| `bg-background-shell` | App chrome/sidebar |
| `bg-background-warning` | Warning surface |
| `bg-background-danger` | Error surface |
| `bg-background-success` | Success surface |

#### Borders
| Class | Use |
|---|---|
| `border-border` | Default border |
| `border-border-accessible` | High-contrast border |
| `border-border-danger` | Error border |
| `border-border-warning` | Warning border |
| `border-border-success` | Success border |

#### Action — Default (most interactive elements)
| Class | Use |
|---|---|
| `text-action-default-text-default` | Default text |
| `text-action-default-text-hover` | Hover text (blue) |
| `bg-action-default-background-hover` | Hover fill (blue 8%) |
| `bg-action-default-background-press` | Press fill (blue 16%) |
| `border-action-default-border-default` | Default border |
| `border-action-default-border-hover` | Hover border |
| `border-action-default-border-focus` | Focus ring |

#### Action — Primary (filled blue buttons)
| Class | Use |
|---|---|
| `bg-action-primary-background-default` | Primary button bg |
| `bg-action-primary-background-hover` | Primary button hover |
| `text-action-primary-text-default` | Primary button text (white) |

#### Action — Tertiary (ghost/link style)
| Class | Use |
|---|---|
| `text-action-tertiary-text-default` | Tertiary text (blue) |
| `bg-action-tertiary-background-hover` | Tertiary hover fill |

#### Action — Danger
| Class | Use |
|---|---|
| `text-action-danger-default-text-default` | Danger text (red) |
| `bg-action-danger-default-background-hover` | Danger hover fill |
| `border-action-danger-default-border-default` | Danger border |

#### Primitive Scale (use when no semantic token fits)
- `blue-{100–800}`, `red-{100–800}`, `green-{100–800}`, `yellow-{100–800}`
- `neutral-{50–800}`, `grey-{50–800}`

**Examples:**
- ✅ `className="bg-background-primary border border-border text-text-primary"`
- ✅ `className="hover:bg-action-default-background-hover"`
- ✅ `className="text-green-600"` (when no semantic token exists)
- ❌ `style={{ backgroundColor: '#f7f7f7' }}` — use `bg-background-secondary`
- ❌ `style={{ color: '#6f6f6f' }}` — use `text-text-secondary`

---

### Icons

Icons live in `public/icons/*.svg` and are rendered via the `<Icon>` component.

**Usage:**
```tsx
import { Icon } from "@/components/icons";
<Icon name="searchIcon" size={16} />
```

**Resolution order:**
1. Check existing icons in `public/icons/` — search by semantic name
2. If not found, ask the user — do not create custom inline SVGs without confirmation
3. New icons must use `fill="currentColor"` for CSS mask compatibility
4. After adding a new icon, register it in `components/icons/index.tsx` and add it to `app/component-gallery.tsx`

---

### Key Reusable Components

Before creating a new component, check if one of these covers the need:

| Component | Import | Use |
|---|---|---|
| `DefaultButton` | `@/components/DefaultButton` | Secondary/default button |
| `PrimaryButton` | `@/components/PrimaryButton` | Primary filled button |
| `TertiaryButton` | `@/components/TertiaryButton` | Ghost/link-style button |
| `IconButton` | `@/components/IconButton` | Icon-only button |
| `TextInput` | `@/components/TextInput` | Text input field |
| `Icon` | `@/components/icons` | Icon renderer |
| `Section` | `@/components/Section` | Page section wrapper |
| `Table` / `TableRow` / `TableCell` | `@/components/Table` | Data tables |

**Always prefer editing an existing component over creating a new one.**
