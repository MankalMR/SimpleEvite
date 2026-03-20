## 2026-03-07 - Inline Feedback States for Copy Actions\n**Learning:** Relying on browser `alert()` for micro-interactions like copying a link disrupts the user flow, blocks the UI thread, and provides a jarring experience. Inline feedback (e.g., button text changing to 'Copied!' temporarily) offers a significantly smoother and more accessible UX.\n**Action:** Use localized state (e.g., `copySuccess`) to manage inline success feedback for clipboard operations instead of using global utilities that trigger browser alerts. Ensure ARIA labels are updated to reflect the success state.
## 2024-05-19 - Standardized Interactive Element Focus States
**Learning:** This Next.js app's existing utility buttons ("Copy Link", "Edit", "Preview", etc.) had hover states but frequently lacked visible keyboard focus states (`focus:ring`), making keyboard navigation difficult for users with accessibility needs.
**Action:** Added `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1` across dashboard buttons, invitation preview buttons, and RSVP selection buttons. Moving forward, ensure all custom interactive elements in this app use these ring utility classes by default.

## 2026-03-12 - Custom Radio Button Group Accessibility
**Learning:** Custom interactive elements that function as radio buttons (like the mutually exclusive RSVP selection: Yes/No/Maybe) often lack inherent semantic meaning, presenting them simply as disconnected buttons to screen readers. This breaks expectations for how users navigate choices.
**Action:** When building custom single-choice selections, always group them semantically. Apply `role="radiogroup"` to the container with `aria-labelledby` pointing to the group's label. Apply `role="radio"` and the appropriate `aria-checked` boolean state to each individual button. This correctly communicates the grouping and active state to assistive technologies.

## 2026-03-20 - Keyboard Navigation for RSVP Forms
**Learning:** Interactive forms like RSVP selection and submission forms often lack explicit focus indicators, making it very difficult to navigate them using a keyboard. The default focus styling on active elements is often insufficient or entirely absent in some Tailwind configurations.
**Action:** Consistently apply explicit focus states using `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1` across all form elements (buttons, inputs) to ensure keyboard navigation remains accessible.
## 2024-05-18 - Accessibility: Conditionally Rendered Forms

**Learning:** When forms are conditionally rendered below existing content (e.g., clicking 'RSVP Now' reveals the RSVP form), keyboard users and screen readers are not automatically directed to the new content, causing friction. Although `autoFocus` can sometimes cause unexpected scrolling on page load, it is highly beneficial for *conditionally* revealed inputs like the first field of an expanding RSVP form.

**Action:** Always add `autoFocus` to the first primary input of conditionally rendered forms to immediately shift focus and improve accessibility for keyboard and screen reader users.
## 2025-03-20 - Demo Banner Feedback
**Learning:** Utility banners (like the Demo Mode warning) often neglect basic interactive states because they are "temporary" UI. Missing focus rings and loading states make them feel broken to keyboard users and during slow network requests.
**Action:** Always apply the standard application focus styles (`focus:ring-2`) and loading feedback (`Spinner`) even to development/demo-specific UI elements to maintain a consistent standard of quality.
