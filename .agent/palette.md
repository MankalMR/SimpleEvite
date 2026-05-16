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

## 2025-03-27 - [Accessible Grid Cards]
**Learning:** In complex form components (like template or design selectors), interactive `div` elements used as selection cards completely break keyboard navigation and screen reader support, leaving keyboard users unable to select an option.
**Action:** Always use semantic `<button type="button">` elements for custom clickable cards in a grid layout, ensuring to add `aria-pressed` for selection state and `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500` for clear visual focus rings.
## 2025-02-28 - Adding Focus Indicators to Navigation
**Learning:** Custom interactive elements (like the mobile user menu dropdown and the "Sign In" button in `Navbar`) often miss the default focus indicators when styled with Tailwind CSS without explicit `focus:` variants.
**Action:** When creating or reviewing components with interactive elements, especially custom buttons and dropdown toggles, always ensure `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` (or equivalent) is applied to maintain keyboard navigation accessibility.

## 2026-04-18 - Keyboard Accessibility for Hover Dropdowns
**Learning:** Dropdown menus that appear on `group-hover` are completely inaccessible to keyboard users unless explicitly styled for focus. When a user tabs into the trigger, and then tabs into the dropdown items, the focus moves but the menu remains invisible, causing extreme confusion.
**Action:** For hover-based dropdowns, always combine `group-hover:opacity-100 group-hover:visible` with `group-focus-within:opacity-100 group-focus-within:visible`. This ensures the dropdown becomes visible when any of its internal links receive keyboard focus. Additionally, add `aria-haspopup="true"` to the trigger button.
## 2026-04-18 - Missing label association for template filters
**Learning:** React select dropdowns used as custom filters (like Occasion and Theme in the template selector) often have visually descriptive text placed near them via `<label>` tags but they often lack the explicit `htmlFor` property tying them to the `id` of the `<select>`. This makes them inaccessible to screen readers which require the association.
**Action:** When creating or editing forms and filter components, explicitly use `<label htmlFor="unique-id">` and ensure the target input/select has `id="unique-id"`.
## 2024-05-01 - Missing ARIA labels on Icon-only actions
**Learning:** Found that multiple icon-only interactive elements in the `invitation/[id]` route, such as 'Edit', 'Preview', and 'Remove RSVP' actions, lacked `aria-label`s and only relied on `title` attributes, making them inaccessible to screen readers without visual hover. Using template literals for dynamic ARIA labels (e.g. `aria-label={"Remove RSVP from ${rsvp.name}"}`) provides highly effective context.
**Action:** When auditing or implementing icon-only buttons or links across the application, ensure `aria-label` is always present and consider using dynamic string interpolation to provide specific context when operating on mapped lists.

## 2024-05-18 - Mobile Sidebar Accessibility Insights
**Learning:** Decorative background overlay divs (like mobile menu dark backdrops) can accidentally trap screen readers or cause confusion if they are clickable but lack semantic meaning. Additionally, hamburger menus toggling state need `aria-expanded` attributes, and closing mechanisms must have explicit, accessible buttons rather than relying solely on clicking outside.
**Action:** When creating modals, sidebars, or dropdown menus, ensure backdrops always have `aria-hidden="true"`, toggle buttons include `aria-expanded`, and an explicit "Close" button with a clear `aria-label` is provided inside the component.
