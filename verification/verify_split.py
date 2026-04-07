
from playwright.sync_api import sync_playwright

def verify_code_splitting():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the main page
        page.goto("http://localhost:4173/playground/")

        # Wait for the main page to load
        page.wait_for_selector("text=Start", timeout=10000)

        # Take a screenshot of the landing page
        page.screenshot(path="verification/landing_page.png")
        print("Landing page screenshot taken.")

        # Navigate to a lazy loaded route (e.g. login which is separate now)
        # Note: /admin/login is the route
        page.goto("http://localhost:4173/playground/admin/login")

        # Wait for login page content
        # Looking for email input or login button
        page.wait_for_selector("text=Login", timeout=10000)

        # Take a screenshot of the login page
        page.screenshot(path="verification/login_page.png")
        print("Login page screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_code_splitting()
