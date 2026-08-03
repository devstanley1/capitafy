# Design System: Capitafy CRM

**Project ID:** capitafy-crm-instagram

## 1. Visual Theme & Atmosphere
The design system of **Capitafy** is built upon a high-fidelity **Cyberpunk Glassmorphism** visual style. It aims to deliver an immersive, premium command-center dashboard experience. It is dense, futuristic, and responsive.

Key aesthetic characteristics:
*   **Translucent Surfaces:** UI containers utilize deep translucent backgrounds with high-blur backdrops, providing layered visual depth.
*   **Neon Accents:** Subtle, glowing primary actions and borders mimicking glowing neon lights.
*   **Micro-interactions:** Interactive elements feature smooth hover transformations (subtle scaling, glowing drop-shadows, responsive background shifts).

## 2. Color Palette & Roles
We use a curated HSL color palette designed for high contrast and modern dark mode visuals:
*   **Deep Cosmic Black (`#030712` / `rgb(3, 7, 18)`):** Base application background.
*   **Dark Glass Container (`rgba(15, 23, 42, 0.45)`):** Used for panel bodies, cards, and sidebar containers.
*   **Glass Border Overlay (`rgba(255, 255, 255, 0.08)`):** Default divider and border strokes.
*   **Neon Purple / Amethyst Accent (`#8b5cf6` / `rgb(139, 92, 246)`):** Brand primary indicator, selection actions, active toggles, and hover glows.
*   **Emerald Mint Success (`#10b981` / `rgb(16, 185, 129)`):** Used for successful DMs, running extraction, and positive indicators.
*   **Gold Horizon Pending (`#f59e0b` / `rgb(245, 158, 11)`):** Used for queue status, logs streaming status, and standby modes.
*   **Crimson Core Danger (`#ef4444` / `rgb(239, 68, 68)`):** Emergency Kill Switch, error status, process stops, and warnings.
*   **Bright Muted text (`#f3f4f6`):** Primary text color.
*   **Ghost Muted text (`#9ca3af`):** Muted metadata text.

## 3. Typography Rules
*   **Primary Font:** `Inter` (or fallback Sans-Serif).
*   **Headers:** Semi-bold to Extra-bold (600–800) with tight letter spacing (`tracking-tight`).
*   **Body:** Regular (400) weight with relaxed leading for optimal readability.
*   **Code/Terminal:** Monospace font for the SSE log console, allowing instant, clean line alignment.

## 4. Component Stylings
*   **Buttons:** Generously rounded (`rounded-xl` or `rounded-lg`). Primary buttons feature a soft violet glow (`shadow-purple-500/20`). Toggles use responsive slider animations.
*   **Cards/Containers:** Medium rounded corners (`rounded-2xl` / `rounded-xl`). Backed by `backdrop-blur-xl` and 1px borders of `white/8`.
*   **Inputs/Forms:** Dark translucent input boxes with responsive purple outline highlights on focus state.
*   **Tables:** Striped glass style with highlighted header, hoverable rows, and glowing status tags (`Badge`).
*   **Terminal Logs Console:** Absolute black container fixed at the bottom with neon green monospace fonts.

## 5. Layout Principles
*   **Desktop Layout:** Fixed sidebar navigation on the left, main interactive screen view on the right, and a collapsible logs drawer anchored at the footer.
*   **Spacing Strategy:** Responsive layout gaps (`gap-4` to `gap-6`) with spacious padding (`p-6`). Responsive grid structures (`grid-cols-1 md:grid-cols-4`) for stats.
