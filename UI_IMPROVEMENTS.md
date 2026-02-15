# Sollevia 10 — UI Improvement Proposals

## Overview

This document contains 22 prioritized UI improvement proposals based on an analysis of the current codebase, evaluated against frontend design best practices and the therapeutic/wellness context of the app.

**Current state:** The app is functional but uses generic defaults — Inter font, standard indigo/slate Tailwind palette, minimal animations, flat backgrounds, and several UX gaps.

**Goal:** Transform Sollevia into a distinctive, warm, and polished experience that feels intentionally designed for people managing chronic pain.

---

## Priority Matrix

| Priority | ID | Proposal | Impact | Complexity |
|----------|----|----------|--------|------------|
| 1 | T-1 | Distinctive font pairing | HIGH | LOW |
| 2 | UX-2 | 44px touch targets | HIGH | LOW |
| 3 | A-2 | Color contrast fixes | HIGH | LOW |
| 4 | C-1 | Warm therapeutic color palette | HIGH | MEDIUM |
| 5 | M-1 | Staggered entrance animations | HIGH | MEDIUM |
| 6 | M-2 | Smooth screen transitions | HIGH | MEDIUM |
| 7 | V-1 | Grain texture overlay | MEDIUM | LOW |
| 8 | L-2 | Generous negative space | MEDIUM | LOW |
| 9 | CR-1 | Custom confirmation dialogs | MEDIUM | LOW |
| 10 | C-2 | Gradient accents | MEDIUM | LOW |
| 11 | V-2 | Layered card shadows | MEDIUM | LOW |
| 12 | T-2 | Typographic scale tokens | MEDIUM | LOW |
| 13 | CR-2 | Illustrated empty states | MEDIUM | LOW |
| 14 | V-3 | Module detail gradient mesh | MEDIUM | LOW |
| 15 | UX-1 | Consistent screen headers | MEDIUM | LOW |
| 16 | UX-3 | Scroll position indicators | MEDIUM | LOW |
| 17 | M-3 | Habit completion celebration | MEDIUM | MEDIUM |
| 18 | CR-3 | Toast notification system | MEDIUM | MEDIUM |
| 19 | A-1 | ARIA labels and roles | HIGH | MEDIUM |
| 20 | CR-4 | Skeleton loading screens | MEDIUM | MEDIUM |
| 21 | M-4 | Scroll-triggered content reveals | MEDIUM | MEDIUM |
| 22 | L-1 | Asymmetric HomeScreen layout | HIGH | HIGH |

### Recommended batches
1. **Transformation** (1–6): Biggest visual uplift for reasonable effort
2. **Polish** (7–16): Refinement and consistency
3. **Delight** (17–22): Interaction quality and advanced features

---

## 1. Typography

### T-1: Distinctive font pairing

**What:** Replace the single Inter font with a two-font system:
- **Display** (headings, app name, module titles): a warm serif like **DM Serif Display** or **Fraunces**
- **Body** (paragraphs, labels, UI text): a humanist sans-serif like **DM Sans** or **Source Sans 3**

**Where:** `index.html` (Google Fonts link + `<style>` block)

**Why:** Inter is the most common default font in AI-generated and template-based UIs. For a text-heavy educational app about chronic pain, typography is the largest visual surface area. A warm serif display font paired with a clean body font creates an editorial, premium feel that signals care and trustworthiness. Every screen transforms with this single change.

**Impact:** HIGH | **Complexity:** LOW

---

### T-2: Typographic scale with CSS custom properties

**What:** Define a formal type scale using CSS variables (`--text-xs` through `--text-4xl`) with corresponding `line-height` and `letter-spacing` values. Replace ad-hoc sizes like `text-[15px]`, `text-[10px]`, `text-[16px]` found throughout the codebase.

**Where:** `index.html` (CSS variables), then update classes in `HomeScreen.tsx`, `ChatInterface.tsx`, `ChatHistoryScreen.tsx`

**Why:** Inconsistent font sizing (mix of bracket notation and Tailwind presets) makes the type system feel random. A formal scale creates visual rhythm and hierarchy, which makes dense educational content easier to scan — important for users with reduced cognitive bandwidth due to chronic pain.

**Impact:** MEDIUM | **Complexity:** LOW

---

## 2. Color System

### C-1: Warm therapeutic color palette with CSS variables

**What:** Replace the indigo-600/slate palette with a warm, healing-oriented palette:
- **Primary:** Warm teal/sage (e.g., `#2D8A7B`) — calming, associated with healing
- **Accent:** Warm amber/coral (e.g., `#E8A87C`) — for CTAs and active states
- **Neutrals:** Warm grays with slight yellow undertone (instead of cool slate)
- **Background:** Warm off-white (e.g., `#FAF8F5`) instead of slate-50
- **Success:** Slightly warmer emerald

Define as CSS variables (`--color-primary`, `--color-accent`, `--color-bg`, etc.) for future theming/dark mode.

**Where:** `index.html` (variable definitions). Then update `indigo-*` and `slate-*` classes across all component files (~30+ occurrences of `indigo-600` alone).

**Why:** Indigo-600 is the default starter template color and carries no emotional weight. Color psychology research supports warm tones (teal, sage, amber) as calming and trustworthy for health contexts. CSS variables enable future dark mode and accessibility themes.

**Impact:** HIGH | **Complexity:** MEDIUM

---

### C-2: Gradient accents on key UI surfaces

**What:** Apply subtle warm gradients to high-visibility elements:
- Check-in card on HomeScreen (currently flat white)
- "Start Module" button on ModuleDetailScreen
- "Add Habit" button on HomeScreen
- Bottom navigation active indicator
- Chat send button

Example: `bg-gradient-to-br from-teal-500 to-teal-700` for buttons.

**Where:** `HomeScreen.tsx`, `ModuleDetailScreen.tsx`, `ChatInterface.tsx`, `Layout.tsx`

**Why:** Flat single-color surfaces read as generic. Subtle gradients add depth and warmth without being distracting — important in a wellness context where visual stress should be minimized.

**Impact:** MEDIUM | **Complexity:** LOW

---

## 3. Motion & Animation

### M-1: Staggered page-load entrance animations

**What:** When each screen mounts, child elements animate in with staggered delays using a `fadeInUp` keyframe:
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Apply to:
- HomeScreen sections (check-in, habits, modules) with 100ms stagger
- Learn screen module cards with 50ms stagger per card
- Practice screen habit list with 50ms stagger
- Chat history entries with 50ms stagger

**Where:** `index.html` (keyframe definition), then add animation classes + inline `animation-delay` styles in each screen component.

**Why:** The app currently has no entrance animations (the referenced `animate-fade-in` class has no defined keyframe). Staggered reveals guide the eye through content hierarchy and make every screen transition feel polished. For chronic pain users, gentle motion communicates responsiveness and life, reducing the feeling of a static clinical tool.

**Impact:** HIGH | **Complexity:** MEDIUM

---

### M-2: Smooth screen transitions

**What:** The current `renderScreen()` in `App.tsx` hard-cuts between screens. Add a transition wrapper that applies a subtle fade (200ms opacity + translateY) when `navState.current` changes. Implement using a CSS transition triggered by a React key change.

**Where:** `App.tsx`

**Why:** Hard cuts feel jarring. For a therapeutic app, graceful transitions create a sense of flow and calm. This affects every navigation action the user takes.

**Impact:** HIGH | **Complexity:** MEDIUM

---

### M-3: Celebratory micro-interaction on habit completion

**What:** When a user taps the habit completion checkmark, add a brief animation: the check circle scales up with a bounce, emits a ring pulse outward, and the completed row gently transitions to its "done" state. Currently the transition is instantaneous.

**Where:** `HomeScreen.tsx` (habit completion checkmark handler)

**Why:** Habit completion is the most frequent user action and the core engagement loop. Celebrating it with motion creates positive reinforcement — a well-documented technique for habit formation. Small moments of delight counter the heaviness of managing a chronic condition.

**Impact:** MEDIUM | **Complexity:** MEDIUM

---

### M-4: Scroll-triggered content reveals in ModuleContentScreen

**What:** In long-form educational content, paragraphs/sections fade in as the user scrolls using an Intersection Observer. The scroll detection mechanism already exists for completion tracking — extend it to trigger reveal animations.

**Where:** `ModuleContentScreen.tsx`

**Why:** Progressive reveals maintain engagement and reduce cognitive overwhelm for text-heavy content. Particularly important for chronic pain users who often report difficulty concentrating.

**Impact:** MEDIUM | **Complexity:** MEDIUM

---

## 4. Layout & Composition

### L-1: Asymmetric HomeScreen layout

**What:** Break the uniform vertical card stack on HomeScreen:
- Larger, more prominent check-in area with an organic card shape
- Integrate the mic button into the check-in card
- Habit cards in a horizontal scroll strip or compact 2-column grid
- "Continue My Journey" modules in a horizontal carousel with peek-ahead

**Where:** `HomeScreen.tsx` (significant JSX restructuring)

**Why:** Identically-styled stacked cards is the most common "cookie-cutter" layout pattern. Varied visual weights and spatial rhythms make the home screen feel curated. The home screen is the first thing users see and return to most often.

**Impact:** HIGH | **Complexity:** HIGH

---

### L-2: Generous negative space and section dividers

**What:** Increase vertical spacing between major sections (from current `mb-10` to `mb-16` or `mb-20`). Add subtle visual dividers — a faint rule, decorative dot, or gradient line — between Check-in, Today, and Continue sections.

**Where:** All screen components, primarily `HomeScreen.tsx`

**Why:** For chronic pain users, dense layouts increase cognitive fatigue. Breathing room between sections reduces visual stress and improves scannability.

**Impact:** MEDIUM | **Complexity:** LOW

---

## 5. Visual Depth & Texture

### V-1: Grain/noise texture overlay

**What:** Apply a subtle CSS grain texture at ~3% opacity as a fixed overlay on the app background. Implement via a pseudo-element in `Layout.tsx` with an inline SVG noise filter.

**Where:** `Layout.tsx` (one CSS class on root container), `index.html` (CSS definition)

**Why:** Flat solid backgrounds are the hallmark of generic apps. A nearly-invisible grain adds organic warmth and tactile quality that subconsciously signals craft. It affects the perceived quality of every screen without changing any component.

**Impact:** MEDIUM | **Complexity:** LOW

---

### V-2: Multi-layer card shadows with accent borders

**What:** Replace default `shadow-sm` / `shadow-lg` with a custom shadow system using multiple layers at low opacity:
```css
--shadow-card: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04);
--shadow-card-hover: 0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06);
```

Also add a subtle colored `border-left` or `border-top` accent (in the primary teal) to key cards like check-in and habit items.

**Where:** `index.html` (CSS variables), all component files (replace shadow classes)

**Why:** Standard Tailwind shadows are the most common default. Multi-layer shadows create more natural, organic depth. A colored accent border injects brand identity into the card-heavy UI.

**Impact:** MEDIUM | **Complexity:** LOW

---

### V-3: Richer gradient on module detail hero

**What:** Replace the current simple `bg-gradient-to-b from-transparent via-slate-50/60 to-slate-50` overlay on the module detail hero image with a multi-stop gradient incorporating the primary palette color as a tint.

**Where:** `ModuleDetailScreen.tsx`

**Why:** The module detail page is the most visually ambitious screen. A richer gradient treatment makes it feel cinematic and immersive — the user is deciding to invest time in a module, so this is a high-attention moment.

**Impact:** MEDIUM | **Complexity:** LOW

---

## 6. Component Redesigns

### CR-1: Custom confirmation dialogs

**What:** Replace `window.confirm()` calls with themed modal dialogs matching the existing modal pattern. Currently used in:
- `ChatHistoryDetailScreen.tsx` (delete history record)
- `HomeScreen.tsx` (remove habit)

Create a reusable `ConfirmationDialog` component following the modal pattern already in `ModuleContentScreen.tsx`.

**Where:** New shared component, then update `ChatHistoryDetailScreen.tsx` and `HomeScreen.tsx`

**Why:** Native browser dialogs break visual continuity, feel jarring, and cannot be styled. For a therapeutic app, destructive actions should be handled with care. A near-identical modal pattern already exists in the codebase.

**Impact:** MEDIUM | **Complexity:** LOW

---

### CR-2: Illustrated empty states

**What:** Replace text-only empty states with compositions of: a large icon (60–80px), a warm heading, a supportive sub-message, and a clear CTA button. Locations:
- Chat history: "No journal entries yet..."
- HomeScreen: "No habits scheduled for today."
- Practice techniques: minimal icon + text

Example for empty chat history:
> [Large journal icon at 60px]
> "Your reflection journal"
> "After your first check-in, your insights will appear here."
> [Button: "Start a Check-in"]

**Where:** `ChatHistoryScreen.tsx`, `HomeScreen.tsx`

**Why:** Empty states are often a user's first encounter with a feature. For chronic pain users starting their journey with uncertainty, a warm and encouraging empty state reduces abandonment and provides a clear next step.

**Impact:** MEDIUM | **Complexity:** LOW

---

### CR-3: Toast notification system

**What:** Add a lightweight toast component that slides in from the bottom with messages like "Habit saved", "Added to favorites", "Entry deleted". Position above the bottom nav in `Layout.tsx`. Implement via a simple React context provider.

Currently missing feedback after: saving a habit, toggling a favorite, completing a habit, deleting a history record.

**Where:** New `ToastProvider` component in `Layout.tsx`, integration in `HomeScreen.tsx`, `ChatHistoryDetailScreen.tsx`, `ModuleContentScreen.tsx`

**Why:** Users with chronic pain may have reduced attentiveness. Without feedback, they cannot be sure their action registered. Toast notifications provide confidence and closure for every interaction.

**Impact:** MEDIUM | **Complexity:** MEDIUM

---

### CR-4: Skeleton loading screens

**What:** For async operations (chat summary generation, history fetching), replace spinners with skeleton placeholders — gray pulsing rectangles matching the shape of the final content.

**Where:** `ChatInterface.tsx` (summary generation screen), `ChatHistoryScreen.tsx` (loading state)

**Why:** Skeleton screens reduce perceived wait time by 30–40% compared to spinners (Nielsen Norman Group research). For a pain management app, waiting increases frustration, and frustration amplifies pain perception.

**Impact:** MEDIUM | **Complexity:** MEDIUM

---

## 7. UX Improvements

### UX-1: Consistent screen headers

**What:** Standardize all full-screen view headers with a shared component: left-aligned back arrow, centered title, optional right-side actions. Currently inconsistent:
- ModuleDetailScreen: back arrow
- ModuleContentScreen: X button only
- ChatHistoryDetailScreen: X button only
- SettingsScreen: "Back" text link
- ChatInterface: X button only

Use back arrow for hierarchical navigation, X only for dismissing overlays.

**Where:** Extract shared `ScreenHeader` component, update all full-screen views

**Why:** Inconsistent navigation patterns increase cognitive load. For chronic pain users often experiencing brain fog, predictable navigation is essential.

**Impact:** MEDIUM | **Complexity:** LOW

---

### UX-2: 44px minimum touch targets

**What:** Increase all interactive elements to minimum 44x44px (WCAG 2.5.5). Currently undersized:
- Habit completion checkmarks: 32px (`h-8 w-8`)
- Menu button: ~34px (`p-2` on 18px icon)
- Day-of-week selector: 40px (`w-10 h-10`)
- Chat close button: ~32px (`p-1` on 24px icon)

Fix by increasing padding — the visual icon can remain small.

**Where:** `HomeScreen.tsx`, `ChatInterface.tsx`, `Layout.tsx`

**Why:** Chronic pain users often have reduced fine motor control. Under-sized targets cause frustration and accidental taps, particularly problematic for the primary engagement action (habit completion) and destructive actions (delete).

**Impact:** HIGH | **Complexity:** LOW

---

### UX-3: Scroll position indicators

**What:** The app hides all scrollbars via `.no-scrollbar`. Add a subtle bottom-fade gradient at the bottom of scroll containers when more content exists below. This signals scrollability without a visible scrollbar.

**Where:** `Layout.tsx`, `ModuleContentScreen.tsx` (CSS-only addition)

**Why:** Without any scroll indicator, users may miss content below the fold. For educational modules, missing content means missing critical material. A bottom fade is the least intrusive solution — used by Apple Health, Calm, and Headspace.

**Impact:** MEDIUM | **Complexity:** LOW

---

## 8. Accessibility

### A-1: ARIA labels, roles, and keyboard support

**What:** Add proper accessibility attributes to all interactive elements:
- Bottom nav buttons: `aria-label` (Layout.tsx)
- Check-in card: `role="button"`, `tabIndex={0}` (HomeScreen.tsx)
- Module cards: `role="button"`, keyboard handlers (HomeScreen.tsx)
- Habit checkmarks: `aria-label` (HomeScreen.tsx)
- Notification toggle: `role="switch"`, `aria-checked` (HomeScreen.tsx)

Add `onKeyDown` handlers for Enter/Space to all clickable non-button elements.

**Where:** All component files (~8 files)

**Why:** Screen reader users currently cannot navigate the app. Chronic pain users may rely on assistive technologies (voice control, switch access). WCAG 2.1 AA compliance is both a legal consideration and an ethical imperative for a health app.

**Impact:** HIGH | **Complexity:** MEDIUM

---

### A-2: Color contrast ratios

**What:** Fix text/background combinations that fail WCAG AA:
- `text-slate-400` on white/slate-50 backgrounds (~3.0:1, needs 4.5:1) → darken to `text-slate-500` or `text-slate-600`
- `text-[10px]` pill badges → increase to minimum 11px
- Verify all new colors from C-1 meet contrast requirements

**Where:** All component files (secondary text and badge classes)

**Why:** WCAG 2.1 AA requires 4.5:1 for normal text. Chronic pain users often experience visual fatigue; insufficient contrast makes reading harder. This is especially important for educational content that users need to absorb.

**Impact:** HIGH | **Complexity:** LOW

---

## Critical Files

| File | Proposals Affected |
|------|-------------------|
| `index.html` | T-1, T-2, C-1, M-1, V-1, V-2 |
| `screens/HomeScreen.tsx` | C-1, C-2, M-1, M-3, L-1, L-2, CR-1, CR-2, UX-2, A-1, A-2 |
| `components/Layout.tsx` | C-2, V-1, CR-3, UX-3, A-1 |
| `screens/ModuleContentScreen.tsx` | C-1, M-4, UX-1, UX-3 |
| `screens/ModuleDetailScreen.tsx` | C-1, C-2, V-3, UX-1 |
| `components/ChatInterface.tsx` | C-1, C-2, CR-4, UX-1, UX-2 |
| `screens/ChatHistoryDetailScreen.tsx` | CR-1, UX-1 |
| `screens/ChatHistoryScreen.tsx` | CR-2, CR-4, A-2 |
| `screens/SettingsScreen.tsx` | C-1, UX-1 |
| `App.tsx` | M-2 |

---

*Document generated from codebase analysis — February 2026*
