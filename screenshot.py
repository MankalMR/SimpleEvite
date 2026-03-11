import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Use full window size to see the bottom
        page = await browser.new_page(viewport={"width": 1280, "height": 3000})
        # Wait a bit for the server to fully start
        await asyncio.sleep(5)
        await page.goto("http://localhost:3008/demo/create", wait_until="networkidle")

        await asyncio.sleep(2)

        # Focus on "Upload Custom" tab button
        try:
           await page.locator("button", has_text="Upload Custom").first.focus()
           await asyncio.sleep(0.5)
           await page.screenshot(path="focus-tab.png")
        except Exception as e:
           print("Failed to focus Upload Custom", e)

        # Focus on the bottom cancel button
        try:
           # There might be multiple cancel buttons. Let's find all buttons and focus the last one which is usually at the bottom.
           cancel_buttons = await page.locator("button", has_text="Cancel").all()
           if len(cancel_buttons) > 0:
               await cancel_buttons[-1].focus()
               await asyncio.sleep(0.5)
               await page.screenshot(path="focus-cancel.png")
        except Exception as e:
           print("Failed to focus Cancel", e)

        try:
           await page.locator("button", has_text="Create Invitation").first.focus()
           await asyncio.sleep(0.5)
           await page.screenshot(path="focus-create.png")
        except Exception as e:
           print("Failed to focus Create Invitation", e)

        # And the range input
        try:
           await page.locator("input[type='range']").first.focus()
           await asyncio.sleep(0.5)
           await page.screenshot(path="focus-range.png")
        except Exception as e:
           print("Failed to focus range", e)

        await browser.close()

asyncio.run(main())
