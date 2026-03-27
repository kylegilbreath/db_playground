# Rules for Cursor to follow

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

**Remember**: The goal is rapid, successful prototyping. Coding standards are followed automatically - focus communication on the design goals and outcomes.

## File Structure Guidelines

### Global Components (`components/`)
The `components/` folder should **ONLY** contain components that are:
- Shared across multiple routes/areas of the app
- Used in the root layout or navigation
- Reusable UI components used throughout the application

**Examples:**
- `components/Layout/MainLayout.tsx` - Used in root layout
- `components/Navigation/Sidebar.tsx` - Used across all pages
- `components/Navigation/TopNav.tsx` - Used across all pages
- `components/Providers/DesignSystemProvider.tsx` - Global context provider

### Route-Specific Components (`app/[route]/components/`)
Components specific to a particular route should live in that route's `components/` folder:

**Examples:**
- `app/notebook/components/LeftPanel.tsx` - Only used in notebook page
- `app/notebook/components/RightPanel.tsx` - Only used in notebook page
- `app/compute/components/` - Components only used in compute page
- `app/jobs/components/` - Components only used in jobs page
- `app/data/components/` - Components only used in data page
- `app/sql-editor/components/` - Components only used in sql-editor page

### Decision Tree

When adding a new component:

1. **Is this component used in multiple routes?**
   - ✅ **Yes** → Place in `components/`
   - ❌ **No** → Continue to step 2

2. **Is this component used in the route (even if only in one page)?**
   - ✅ **Yes** → Place in `app/[route]/components/`
   - ❌ **No** → This shouldn't happen - all components should be in either `components/` or `app/[route]/components/`

### Import Path Conventions

- **Global components**: Use `@/components/[ComponentName]` or `@/components/[Folder]/[ComponentName]`
- **Route-specific components**: Use relative paths `./components/[ComponentName]` or `../components/[ComponentName]`

### Refactoring Guidelines

- When a route-specific component becomes shared across routes, move it to `components/`
- When a global component is only used in one route, move it to `app/[route]/components/`
- Always update import paths when moving components
- Update this rules file if the structure changes

### Proactive Cleanup Guidelines

**Always proactively identify and clean up files that violate these rules:**

1. **Unused Global Components**: If a component in `components/` is not imported or used anywhere, it should be removed
2. **Misplaced Components**: If a component is in the wrong location (e.g., route-specific component in `components/`), move it to the correct location
3. **Broken Imports**: If a component has broken imports (e.g., references deleted files), either fix the imports or remove the component
4. **Empty Folders**: Remove empty component folders after moving or deleting components
5. **Orphaned Files**: Remove files that are no longer referenced or used

**When to Clean Up:**
- After refactoring components
- When adding new components (check if old ones should be moved/removed)
- When removing features or routes
- When fixing import errors
- As part of regular code maintenance

**How to Identify Violations:**
- Search for imports of components to verify they're actually used
- Check if components in `components/` are only used in one route
- Verify all imports resolve correctly
- Look for empty folders or unused files

## Design System Usage

### Default to Dubois Tokens — Colors, Spacing, and Components
**This is the single most important rule for this codebase.** Always default to the Databricks design system (Dubois) before hardcoding or creating custom implementations.

**Priority order for every style decision:**
1. **Dubois token** — `theme.colors.*`, `theme.spacing.*`, `theme.borders.*`, `theme.typography.*`
2. **Dubois component** — `Button`, `Tag`, `Typography`, `Tooltip`, `Modal`, etc. from `@databricks/design-system`
3. **Dubois icon** — Import from `@databricks/design-system` or `@/lib/icons`
4. **Custom implementation** — Only when Dubois doesn't provide what's needed, and only after confirming with the user

**Colors:** Use `theme.colors.*` tokens. Never hardcode a hex/rgba value if a matching token exists (e.g., use `theme.colors.textPrimary` not `'#1b1f23'`, use `theme.colors.backgroundSecondary` not `'#f7f7f7'`).

**Spacing:** Use `theme.spacing.*` tokens for padding, margin, and gap values. Never hardcode `8px`, `16px`, etc. when `theme.spacing.sm`, `theme.spacing.md`, etc. exist.

**Components:** Always search `@databricks/design-system` for an existing component before building custom. Ask for confirmation before creating custom components.

### Global Rules for Design System Styles

**Avoid Fallback Operators:**
- **Do NOT use fallback operators (`||`, `??`)** when accessing design system theme values
- Design system theme values are guaranteed to exist - use them directly
- If a value might not exist, hardcode a default value instead of using fallback operators
- **Exception**: Only use fallback operators when explicitly needed for backward compatibility or when the design system documentation indicates a value may be undefined
- **CRITICAL**: Before finalizing any component, verify that NO fallback operators are used for:
  - `theme.colors.*` (all color properties)
  - `theme.spacing.*` (all spacing properties)
  - `theme.borders.*` (all border properties)
  - `theme.typography.*` (all typography properties)
  - Any other design system theme values
- **Verification Checklist**: After creating or modifying components, check for:
  - `theme.colors.* ||` or `theme.colors.* ??`
  - `theme.spacing?.` with fallbacks
  - `theme.borders?.` with fallbacks
  - Any pattern like `theme.* || 'default'` or `theme.* ?? 'default'`

**Hardcoding Colors:**
- **Prefer design system color tokens** from `theme.colors` whenever possible
- **Hardcoding is allowed** when:
  - A specific color doesn't exist in the design system
  - A color override is needed for a specific design requirement
  - Prototyping requires a temporary color that will later be added to the design system
- When hardcoding, use hex values or CSS color names (e.g., `#2272b4`, `rgba(34, 114, 180, 0.08)`)
- Document hardcoded colors with comments when they're intentional overrides

**Examples:**
- ✅ `color: theme.colors.textPrimary` (no fallback)
- ✅ `gap: theme.spacing.sm` (no fallback, no optional chaining)
- ✅ `borderRadius: theme.borders.borderRadiusSm` (no fallback, no optional chaining)
- ✅ `backgroundColor: '#2272b4'` (hardcoded when design system doesn't have the exact color)
- ❌ `color: theme.colors.textPrimary || '#161616'` (avoid fallback operators)
- ❌ `color: theme.colors.textPrimary ?? '#161616'` (avoid fallback operators)
- ❌ `gap: theme.spacing?.sm || 8` (avoid optional chaining with fallbacks)
- ❌ `borderRadius: theme.borders?.borderRadiusSm || '4px'` (avoid optional chaining with fallbacks)

**Code Review Checklist:**
When creating or modifying components, always verify:
1. No `||` or `??` operators after `theme.colors.*`, `theme.spacing.*`, `theme.borders.*`, or `theme.typography.*`
2. No optional chaining (`?.`) combined with fallback operators
3. Direct property access: `theme.spacing.sm` not `theme.spacing?.sm || 8`

### Component Discovery Pattern
**Before creating or using any component, always search the Dubois design system first:**

**Component Resolution Pattern (in order of priority):**
1. **First, search `@databricks/design-system`** - Look for the component by name in the design system package
   - Search in `node_modules/@databricks/design-system/src/design-system/` for component directories
   - Check component exports in the design system package
   - Look for components with similar names or functionality (e.g., `Tooltip`, `Popover`, `Modal`, `Dialog`)
   - Use semantic search to find components that match the requested functionality

2. **If component exists in design system:**
   - **Ask for confirmation** before using it: "I found `[ComponentName]` in the Dubois design system. Should I use this component?"
   - Once confirmed, import and use the design system component
   - Follow the component's API and props as defined in the design system

3. **If component does NOT exist in design system:**
   - **Ask for confirmation** before creating a new component: "I couldn't find `[ComponentName]` in the Dubois design system. Should I create a new custom component?"
   - If confirmed, create the component following the project's component structure guidelines
   - Consider if a similar design system component could be extended or customized instead

**Search Methods:**
- Use `codebase_search` to search for component names in `node_modules/@databricks/design-system/`
- Use `grep` to search for component exports in design system files
- Check design system documentation or type definitions for available components
- Look for component patterns (e.g., `Tooltip`, `Popover`, `Modal`) that might match the request

**Examples:**
- User requests: "Add a tooltip to this button"
  - ✅ Search for `Tooltip` in `@databricks/design-system`
  - ✅ If found: "I found `Tooltip` in the Dubois design system. Should I use this component?"
  - ✅ If not found: "I couldn't find `Tooltip` in the Dubois design system. Should I create a new custom component?"

- User requests: "Add a dropdown menu"
  - ✅ Search for `Dropdown`, `Menu`, `Select`, `Popover` in `@databricks/design-system`
  - ✅ Check for similar components that could provide dropdown functionality

**Important:**
- **Always search first** - Never assume a component doesn't exist. Search `@databricks/design-system` for the component, similar components, and related patterns before writing anything custom
- **Always confirm** - Get user confirmation before creating custom components. This includes custom buttons, tabs, inputs, modals, pills, chips, toggles, and any other standard UI element
- **Never silently create custom components** - If you can't find a Dubois match, STOP and ask: "I couldn't find a matching Dubois component for [purpose]. Should I create a custom one, or is there a design system component I should use?"
- **Document findings** - If a component exists but isn't suitable, explain why and suggest alternatives

### Leverage Dubois Components
When building, **always prefer using Dubois design system components** (`@databricks/design-system`) over custom implementations:

- Use components inside the Dubois design system instead of creating custom elements
- Use design system icons (e.g., `ChevronDownIcon`, `SearchIcon`) instead of custom SVGs when available
- Use theme tokens from `useDesignSystemTheme()` for colors, spacing, borders, etc.
- Use design system components like `Tag`, `Typography`, etc. when available
- Only create custom components when the design system doesn't provide the needed functionality

**Examples:**
- ✅ Use `Button` from `@databricks/design-system` with `type="tertiary"` or `type="primary"`
- ✅ Use `useDesignSystemTheme()` to access `theme.colors`, `theme.spacing`, `theme.borders`
- ✅ Use design system icons like `ChevronDownIcon`, `SearchIcon`, `NotebookIcon`
- ❌ Don't create custom button components when `Button` is available
- ❌ Don't hardcode colors when theme tokens are available

### Default to Dubois Icons
**Always default to Dubois icons from `@databricks/design-system` when possible:**

**Icon Resolution Pattern (in order of priority):**
1. **First, check `@databricks/design-system`** - Look for the icon in the design system package
   - Search for icons by semantic meaning (e.g., `GridIcon`, `ListIcon`, `FolderIcon`)
   - Use the icon naming pattern: `[Name]Icon` (e.g., `SearchIcon`, `HomeIcon`)
   - Import from: `import { IconName } from '@databricks/design-system'`

2. **If not found, check local icons in `lib/icons/`** - Check for custom icon extensions
   - Local icons follow the same pattern as design system icons
   - Import from: `import { IconName } from '@/lib/icons'`
   - See [lib/icons/](mdc:lib/icons/) for available local icons

3. **If still not found, STOP and ask the user for the correct icon name** - Never create custom SVGs, use emoji characters, or use third-party icon libraries without explicit confirmation
   - Ask the user:
     - "I couldn't find a matching Dubois icon for [purpose]. What icon name should I use?"
   - Only after the user responds, proceed with one of:
     - Using the icon name they provide from the design system
     - Adding a new icon to the local icons folder (if confirmed)
     - Creating a custom implementation (only as last resort, with confirmation)

**When replacing custom icons:**
- Replace inline SVG icons with Dubois or local icons
- Replace emoji characters (e.g., `✦`, `☆`, `📊`, `🎁`) with Dubois icon components
- Replace icons from other libraries with Dubois/local equivalents
- Update imports to use the appropriate source

**Icon usage pattern:**
- Import icons from `@databricks/design-system` or `@/lib/icons`
- Use icons with the spread pattern: `<IconName {...({} as any)} />` when needed
- Apply consistent sizing via style props: `style={{ width: '16px', height: '16px' }}`

**Adding new local icons:**
- Create icon component in `lib/icons/` following the design system pattern
- Use the `Icon` component from `@databricks/design-system` as the base
- Export from `lib/icons/index.ts`
- Follow naming convention: `[Name]Icon.tsx` (e.g., `ListOutlinedIcon.tsx`)

**Examples:**
- ✅ `import { GridIcon, ListIcon, FolderIcon } from '@databricks/design-system'`
- ✅ `import { ListOutlinedIcon } from '@/lib/icons'`
- ✅ `<GridIcon {...({} as any)} style={{ width: '16px', height: '16px' }} />`
- ❌ Don't use inline SVG when a Dubois or local icon exists: `<svg>...</svg>`
- ❌ Don't use icons from other libraries (e.g., `react-icons`, `lucide-react`) when Dubois/local has an equivalent
- ❌ Don't create custom icon components without checking design system and local icons first

### Prototype Configuration (ProtoConfig)
ProtoConfig is the **global prototype configuration panel** — a floating dark button (bottom-left) that expands into a config panel. It renders on every page automatically.

**How it works:**
- Config state is shared via React context (`ProtoConfigProvider`)
- Pages read state with `useProtoConfig()` from `@/components/ProtoConfig`
- The `GlobalProtoConfig` in `components/Providers/ClientOnlyDesignSystem.tsx` defines baseline Flow/SubOption options

**Reading config on a page:**
```tsx
import { useProtoConfig } from '@/components/ProtoConfig'
const { selectedFlow, selectedSub } = useProtoConfig()
```

**Enabling "Start over" (resets config + navigates to start page):**
```tsx
const { setStartPath } = useProtoConfig()
useEffect(() => { setStartPath('/workspace/notebook') }, [])
```

**Rules:**
- ProtoConfig is **global only** — never add per-page instances
- Customize flows per branch by editing `GlobalProtoConfig` in `ClientOnlyDesignSystem.tsx`
- Always use `useProtoConfig()` to read config state, not local component state

### Typography Usage
**Always use design system typography tokens** (font family, sizes, weights, line heights) from `theme.typography`:

**Font Family:**
- Use `(theme.typography as any)?.fontFamily as string` from `useDesignSystemTheme()` when setting fontFamily
- The design system font is set globally via theme override: `'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'`
- For code/monospace content, use: `'"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace'`
- **Do NOT use fallback operators (`||`)** - the font is guaranteed to be in the theme

**Font Sizes:**
- Always use `theme.typography.fontSize*` tokens instead of hardcoded pixel values
- Available sizes: `fontSizeSm` (12px), `fontSizeBase` (13px), `fontSizeMd` (13px), `fontSizeLg` (18px), `fontSizeXl` (22px), `fontSizeXxl` (32px)
- Default to `fontSizeBase` (13px) for most text content

**Line Heights:**
- Always use `theme.typography.lineHeight*` tokens that correspond to font sizes
- Available line heights: `lineHeightSm` (16px), `lineHeightBase` (20px), `lineHeightMd` (20px), `lineHeightLg` (24px), `lineHeightXl` (28px), `lineHeightXxl` (40px)
- Match line heights to font sizes (e.g., `fontSizeBase` with `lineHeightBase`)

**Font Weights:**
- Use `theme.typography.typographyRegularFontWeight` (400) for regular text
- Use `theme.typography.typographyBoldFontWeight` (600) for bold text
- Avoid hardcoding font weights (400, 600, etc.)

**Examples:**
- ✅ `fontFamily: (theme.typography as any)?.fontFamily as string`
- ✅ `fontSize: theme.typography.fontSizeBase`
- ✅ `lineHeight: theme.typography.lineHeightBase`
- ✅ `fontWeight: theme.typography.typographyRegularFontWeight`
- ✅ For code: `fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace'`
- ❌ Don't hardcode: `fontSize: '13px'` - use `theme.typography.fontSizeBase`
- ❌ Don't hardcode: `lineHeight: '20px'` - use `theme.typography.lineHeightBase`
- ❌ Don't hardcode: `fontWeight: 400` - use `theme.typography.typographyRegularFontWeight`
- ❌ Don't use fallback operators: `fontFamily: theme.typography?.fontFamily || '...'`
- ❌ Don't hardcode font families, sizes, weights, or line heights - always use theme tokens