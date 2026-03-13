from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:3008/demo/dashboard', wait_until='networkidle')
    page.wait_for_timeout(5000)
    page.screenshot(path='screenshot.png')
    browser.close()
