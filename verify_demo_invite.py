import time
from playwright.sync_api import sync_playwright, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to demo dashboard to trigger initial token setup in local storage
        print("Navigating to demo dashboard...")
        page.goto("http://localhost:3008/demo/dashboard", wait_until='networkidle')
        page.wait_for_timeout(5000) # Wait for mock data

        # Click the first 'Preview' button to get to an invite page
        print("Finding preview button...")
        preview_links = page.locator("a:has-text('Preview')")

        if preview_links.count() > 0:
            preview_url = preview_links.first.get_attribute("href")
            full_url = f"http://localhost:3008{preview_url}"
            print(f"Navigating to invite page: {full_url}")

            # Go to the specific invite page
            page.goto(full_url, wait_until='networkidle')
            page.wait_for_timeout(10000) # Wait for page load

            # Find the 'RSVP Now' button and focus it
            print("Focusing RSVP Now button...")
            rsvp_now_btn = page.locator("button:has-text('RSVP Now')")
            if rsvp_now_btn.count() > 0:
                rsvp_now_btn.first.focus()
                # Take screenshot of focused RSVP Now button
                page.screenshot(path="rsvp_now_focused.png")
                print("Captured rsvp_now_focused.png")

                # Click it to reveal the form
                rsvp_now_btn.first.click()
                page.wait_for_timeout(1000)

                # Focus one of the selection buttons (e.g. Yes)
                print("Focusing Yes button...")
                yes_btn = page.locator("button:has-text('Yes, I\\'ll be there!')")
                if yes_btn.count() > 0:
                    yes_btn.first.focus()
                    page.screenshot(path="rsvp_yes_focused.png")
                    print("Captured rsvp_yes_focused.png")

                # Focus Cancel button
                print("Focusing Cancel button...")
                cancel_btn = page.locator("button:has-text('Cancel')")
                if cancel_btn.count() > 0:
                    cancel_btn.first.focus()
                    page.screenshot(path="cancel_focused.png")
                    print("Captured cancel_focused.png")

                # Focus Submit RSVP button
                print("Focusing Submit RSVP button...")
                submit_btn = page.locator("button:has-text('Submit RSVP')")
                if submit_btn.count() > 0:
                    submit_btn.first.focus()
                    page.screenshot(path="submit_rsvp_focused.png")
                    print("Captured submit_rsvp_focused.png")
            else:
                print("Could not find RSVP Now button. The page might already be showing the form.")
                # Check if form is visible and click yes button
                yes_btn = page.locator("button:has-text('Yes, I\\'ll be there!')")
                if yes_btn.count() > 0:
                    print("Found Yes button instead...")
                    yes_btn.first.focus()
                    page.screenshot(path="rsvp_yes_focused.png")
                    print("Captured rsvp_yes_focused.png")

                    # Focus Cancel button
                    print("Focusing Cancel button...")
                    cancel_btn = page.locator("button:has-text('Cancel')")
                    if cancel_btn.count() > 0:
                        cancel_btn.first.focus()
                        page.screenshot(path="cancel_focused.png")
                        print("Captured cancel_focused.png")

                    # Focus Submit RSVP button
                    print("Focusing Submit RSVP button...")
                    submit_btn = page.locator("button:has-text('Submit RSVP')")
                    if submit_btn.count() > 0:
                        submit_btn.first.focus()
                        page.screenshot(path="submit_rsvp_focused.png")
                        print("Captured submit_rsvp_focused.png")
                else:
                    print("Could not find any buttons.")
                    page.screenshot(path="dashboard_error.png")
        else:
            print("No preview links found on dashboard. Cannot verify.")
            page.screenshot(path="dashboard_error.png")

        browser.close()

if __name__ == "__main__":
    main()
