# UI & UX Style Guide

## 1. Design System & Aesthetics
*   **Theme:** Premium SaaS look. Clean layouts, generous whitespace, sharp layouts with subtle rounded corners (`rounded-xl` to `rounded-2xl`).
*   **Glassmorphism:** Use background blurs (`backdrop-blur-md`) combined with transparent white overlays for modal elements and dropzones.
*   **Shadows:** Soft, subtle drop shadows (`shadow-sm` for cards, `shadow-lg` for active modals) to create depth.
*   **Transitions:** Smooth hover transitions (`transition-all duration-200 ease-in-out`) on all buttons, sidebar links, and data tables.

## 2. Typography Hierarchy
*   **Font Family:** Inter or system sans-serif (clean, professional).
*   **Titles:** Bold, high-contrast text (`text-2xl` to `text-3xl font-bold`).
*   **Subheadings:** Medium weight, subtle mute styling (`text-sm font-medium text-slate-500`).
*   **Data Labels:** Fixed sizing, high scannability (`text-xs font-semibold tracking-wider uppercase`).

## 3. Screen Components Layout
*   **Navigation Sidebar:** Left-aligned, fixed position. Includes branding header (`ElectricElite`), menu links with explicit text/icons, and Theme Toggle at the bottom.
*   **Main Container:** Scrolling flex viewport containing section-specific headers, dynamic filters/search bars, and primary data layout surfaces.
*   **Modal Interventions:** Centered screen overlays with clear title bars, action confirmation states, validation warnings, and absolute cancel/close handles.