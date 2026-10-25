import { test, expect } from "@playwright/test";

test.describe("Public & Customer-Facing Functionality Smoke Tests", () => {
  test("1. Header and Footer Links, and WhatsApp Button", async ({ page, isMobile }) => {
    await page.goto("/");

    // Brand link
    const brandLink = page.getByRole("link", { name: /Sri Kubera/i }).first();
    await expect(brandLink).toBeVisible();

    // Desktop navigation links
    if (!isMobile) {
      const homeNav = page.getByRole("link", { name: "Home", exact: true }).first();
      const galleryNav = page.getByRole("link", { name: "Gallery", exact: true }).first();
      const servicesNav = page.getByRole("link", { name: "Services", exact: true }).first();
      const aboutNav = page.getByRole("link", { name: "About", exact: true }).first();
      const contactNav = page.getByRole("link", { name: "Contact", exact: true }).first();

      await expect(homeNav).toBeVisible();
      await expect(galleryNav).toBeVisible();
      await expect(servicesNav).toBeVisible();
      await expect(aboutNav).toBeVisible();
      await expect(contactNav).toBeVisible();
    }

    // Floating WhatsApp Button
    const waButton = page.locator("#whatsapp-floating-button");
    await expect(waButton).toBeVisible();
    const waHref = await waButton.getAttribute("href");
    expect(waHref).toContain("wa.me");

    // Footer Links & Socials
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByRole("link", { name: /Gallery/i }).first()).toBeVisible();
    await expect(footer.getByRole("link", { name: /Contact/i }).first()).toBeVisible();
    await expect(footer.locator('a[aria-label="Sri Kubera on Facebook"]')).toHaveAttribute(
      "href",
      "https://www.facebook.com/share/1DwDL6AmHE/"
    );
    await expect(footer.locator('a[aria-label="Sri Kubera on Instagram"]')).toHaveAttribute(
      "href",
      "https://www.instagram.com/sri_kubera_decor/"
    );
  });

  test("2. Mobile Menu Drawer Navigation", async ({ page, isMobile }) => {
    if (!isMobile) return;

    await page.goto("/");
    const menuToggle = page.locator("#mobile-menu-toggle");
    await expect(menuToggle).toBeVisible();

    // Open mobile menu drawer
    await menuToggle.click();
    const mobileNav = page.locator("nav[aria-label='Mobile navigation']");
    await expect(mobileNav).toBeVisible();
    const mobileGallery = mobileNav.getByRole("link", { name: "Gallery" });
    await expect(mobileGallery).toBeVisible();

    // Close mobile menu drawer
    await menuToggle.click();
    await expect(mobileNav).not.toBeVisible();
  });

  test("3. Home Page: Slideshow, CTAs, and Requirement Section", async ({ page }) => {
    await page.goto("/");

    // Hero slideshow section
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    // Hero Call-To-Action
    const exploreCta = page.getByRole("link", { name: /Explore All Designs/i }).first();
    await expect(exploreCta).toBeVisible();

    // Post requirement section container
    const postReqSection = page.locator("#post-requirement");
    await expect(postReqSection).toBeVisible();
  });

  test("4. Gallery Page: Filters, Search, Lightbox, Keyboard, and Detail Page", async ({ page }) => {
    await page.goto("/gallery");

    // Heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Search Input
    const searchInput = page.getByPlaceholder(/Search designs/i);
    await expect(searchInput).toBeVisible();

    // Category Filter Buttons
    const birthdayFilter = page.getByRole("button", { name: /Birthday/i }).first();
    await expect(birthdayFilter).toBeVisible();
    await birthdayFilter.click();

    // Design Cards
    const designCards = page.locator("article");
    await expect(designCards.first()).toBeVisible();

    // Click card to open Lightbox Modal
    const firstCardButton = page.locator("button[aria-label^='View ']").first();
    await firstCardButton.click();

    // Verify Lightbox Modal opened
    const closeLightboxBtn = page.getByRole("button", { name: "Close image viewer" });
    await expect(closeLightboxBtn).toBeVisible();

    // Test Keyboard shortcut: Escape to close Lightbox
    await page.keyboard.press("Escape");
    await expect(closeLightboxBtn).not.toBeVisible();

    // Direct Detail Page test
    await page.goto("/gallery/bday-01");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const bookCta = page.getByRole("link", { name: /Login to Book|Raise Portal Booking|Enquire on WhatsApp/i }).first();
    await expect(bookCta).toBeVisible();
  });

  test("5. About & Services Public Pages", async ({ page }) => {
    // /about
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // /services
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("6. Contact Form: Validation, Error States, and Mobile Keyboard", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");

    const nameInput = page.locator("#contact-name");
    const phoneInput = page.locator("#contact-phone");
    const submitBtn = page.locator("form button[type='submit']");

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Mobile Keyboard inputmode attribute
    expect(await phoneInput.getAttribute("inputmode")).toBe("tel");

    // Empty Submit -> Zod Validation Messages
    await submitBtn.click();
    await expect(page.locator("#name-error")).toBeVisible();
    await expect(page.locator("#phone-error")).toBeVisible();

    // Enter invalid phone
    await nameInput.fill("Test User");
    await phoneInput.fill("12345");
    await submitBtn.click();
    await expect(page.locator("#phone-error")).toContainText(/valid 10-digit/i);
  });

  test("7. Post Requirement Form: Validation, Upload Limits, and Controls", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const postReqSection = page.locator("#post-requirement");
    await postReqSection.scrollIntoViewIfNeeded();

    const reqName = page.locator("#req-name");
    const reqPhone = page.locator("#req-phone");
    const reqPlace = page.locator("#req-place");
    const submitBtn = page.locator("#post-requirement button[type='submit']");

    await expect(reqName).toBeVisible();
    await expect(reqPhone).toBeVisible();
    await expect(reqPlace).toBeVisible();

    // Mobile Keyboard inputmode attribute
    expect(await reqPhone.getAttribute("inputmode")).toBe("tel");

    // Empty Submit -> Zod Validation Messages
    await submitBtn.click();
    await expect(page.locator("#name-error")).toBeVisible();
    await expect(page.locator("#phone-error")).toBeVisible();
    await expect(page.locator("#place-error")).toBeVisible();

    // Photo input configuration
    const photoInput = page.locator("#req-photo");
    await expect(photoInput).toBeAttached();
    expect(await photoInput.getAttribute("accept")).toBe("image/jpeg,image/png,image/webp");
  });

  test("8. Signup Form: Client-Side Validation & Password Strength", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");

    const submitBtn = page.locator("form button[type='submit']");
    await expect(submitBtn).toBeVisible();

    // Empty Submit -> Zod Validation Messages
    await submitBtn.click();
    await expect(page.locator("#name-error")).toBeVisible();
    await expect(page.locator("#phone-error")).toBeVisible();
    await expect(page.locator("#email-error")).toBeVisible();
    await expect(page.locator("#gender-error")).toBeVisible();
    await expect(page.locator("#password-error")).toBeVisible();

    // Test Password Strength Hint appears when typing password
    const passwordInput = page.locator("#signup-password");
    await passwordInput.fill("secret");
    await expect(page.getByText("Password Strength")).toBeVisible();
    await expect(page.getByText("Very Weak")).toBeVisible();

    await passwordInput.fill("StrongPass123!");
    await expect(page.getByText("Strong")).toBeVisible();

    // Test Password Mismatch
    await page.locator("#signup-name").fill("John Doe");
    await page.locator("#signup-phone").fill("9876543210");
    await page.locator("#signup-email").fill("test@example.com");
    await page.locator("#gender-male").check();
    await page.locator("#signup-confirm").fill("DifferentPassword123!");
    await submitBtn.click();

    await expect(page.locator("#confirm-password-error")).toContainText(/passwords do not match/i);
  });

  test("9. Login Form: Validation, Wrong Password, and Forgot Password Flows", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Wait for Suspense-wrapped form to hydrate
    const emailInput = page.locator("#login-email");
    await expect(emailInput).toBeVisible();

    const submitBtn = page.locator("form button[type='submit']");
    await expect(submitBtn).toBeVisible();

    // Empty Submit -> Zod Validation
    await submitBtn.click();
    await expect(page.locator("#email-error")).toBeVisible();
    await expect(page.locator("#password-error")).toBeVisible();

    // Submit with Invalid Credentials (wrong password flow)
    await emailInput.fill("invalid.user@example.com");
    await page.locator("#login-password").fill("WrongPassword123!");
    await submitBtn.click();

    // Should display invalid login credentials alert
    const alertBox = page.locator("[role='alert']");
    await expect(alertBox).toBeVisible({ timeout: 10000 });

    // Test Forgot Password Flow
    const forgotBtn = page.getByRole("button", { name: /Forgot password\?/i });
    await expect(forgotBtn).toBeVisible();
    await forgotBtn.click();

    // Verify Forgot Password view rendered
    await expect(page.getByRole("heading", { name: /Reset your password/i })).toBeVisible();
    const resetEmailInput = page.locator("#reset-email");
    await expect(resetEmailInput).toBeVisible();

    // Empty reset submit -> validation error
    const sendResetBtn = page.getByRole("button", { name: /Send Recovery Email/i });
    await sendResetBtn.click();
    await expect(page.locator("#reset-email-error")).toBeVisible();

    // Back to Sign In button works
    const backToSignIn = page.getByRole("button", { name: /Back to Sign In/i });
    await backToSignIn.click();
    await expect(page.locator("#login-email")).toBeVisible();
  });

  test("10. Protected Route Redirection", async ({ page }) => {
    // /profile should redirect to login when unauthenticated
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);

    // /enquiries should redirect to login when unauthenticated
    await page.goto("/enquiries");
    await expect(page).toHaveURL(/\/login/);
  });

  test("11. Requirement Prompt Modal: Storage, Dismissal & Route Suppression", async ({ page }) => {
    // 1. Unauthenticated / suppressed page: should not be visible
    await page.goto("/login");
    await expect(page.locator("#req-prompt-title")).not.toBeVisible();

    await page.goto("/signup");
    await expect(page.locator("#req-prompt-title")).not.toBeVisible();

    // 2. Simulate logged-in user with timer elapsed on public page
    await page.goto("/");
    await page.evaluate(() => {
      // Simulate expired 2-minute timer for test user
      const fakeUserId = "test-user-12345";
      localStorage.setItem(`req_timer_start_${fakeUserId}`, (Date.now() - 130000).toString());
    });

    // 3. Verify dismiss key prevents display
    await page.evaluate(() => {
      localStorage.setItem("req_prompt_dismissed_test-user-12345", "true");
    });
    await page.reload();
    await expect(page.locator("#req-prompt-title")).not.toBeVisible();
  });

  test("12. Responsive Widths & Zero Horizontal Overflow (375px, 768px, 1024px, 1440px)", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ];
    const pagesToCheck = ["/", "/about", "/services", "/gallery", "/contact", "/login", "/signup"];

    for (const path of pagesToCheck) {
      await page.goto(path);
      for (const vp of viewports) {
        await page.setViewportSize(vp);
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll, `Horizontal scroll detected on ${path} at ${vp.width}px`).toBe(false);
      }
    }
  });

  test("13. Gated Gallery & Sign-up Prompt Modal Flows", async ({ page }) => {
    // 1. Unauthenticated visitor clicking "Explore All Designs" on home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const heroExploreBtn = page.locator("#hero-explore-designs-btn");
    await expect(heroExploreBtn).toBeVisible();
    await heroExploreBtn.click();

    // Verify Signup Prompt Modal opens
    const authModal = page.locator("#signup-prompt-title");
    await expect(authModal).toBeVisible({ timeout: 10000 });
    await expect(authModal).toContainText(/Sign in or sign up to view the full gallery|Welcome to Sri Kubera/i);

    // Verify buttons inside modal
    const modalLoginBtn = page.locator("#signup-prompt-login-btn");
    const modalSignupBtn = page.locator("#signup-prompt-signup-btn");
    await expect(modalLoginBtn).toBeVisible();
    await expect(modalSignupBtn).toBeVisible();
    expect(await modalLoginBtn.getAttribute("href")).toContain("/login?redirectTo=");
    expect(await modalSignupBtn.getAttribute("href")).toContain("/signup?redirectTo=");

    // Close modal via close button
    const closeBtn = page.locator("#signup-prompt-close-button");
    await closeBtn.click();
    await expect(authModal).not.toBeVisible();

    // 2. Direct access to /gallery as guest (SEO Teaser Mode)
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Guest sees teaser designs (first 6)
    const galleryArticles = page.locator("article");
    await expect(galleryArticles.first()).toBeVisible();
    const count = await galleryArticles.count();
    expect(count).toBeLessThanOrEqual(6);

    // Gated section is visible to guest with locked callouts
    const gatedSection = page.locator("#gallery-gated-section");
    await expect(gatedSection).toBeVisible();
    const unlockBtn = page.locator("#gallery-signin-unlock-btn");
    await expect(unlockBtn).toBeVisible();

    // Clicking "Sign In to Unlock Full Gallery" opens auth modal
    await unlockBtn.click();
    await expect(authModal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(authModal).not.toBeVisible();

    // 3. SEO Teaser vs Gated [id] pages:
    // Teaser item /gallery/bday-01 is accessible to guest
    await page.goto("/gallery/bday-01");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Gated item (beyond the first 6 teaser designs, e.g. /gallery/mar-01) displays in-page sign-in prompt for guest (HTTP 200, no redirect to login)
    const gatedRes = await page.goto("/gallery/mar-01");
    expect(gatedRes?.status()).toBe(200);
    expect(page.url()).toContain("/gallery/mar-01");
    await expect(page.getByRole("heading", { name: /Sign In to View This Design/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign In to Unlock/i })).toBeVisible();

    // 4. Login and signup pages respect redirect parameter
    await page.goto("/login?redirect=/gallery");
    await expect(page.locator("#login-email")).toBeVisible();

    await page.goto("/signup?redirectTo=/gallery");
    await expect(page.locator("#signup-name")).toBeVisible();
  });

  test("14. Logged-In User Experience (Zero Friction) & Logout Flow", async ({ page }) => {
    // 1. Mock authenticated response for /api/designs
    await page.route("**/api/designs*", async (route) => {
      const json = {
        designs: Array.from({ length: 36 }).map((_, i) => ({
          id: `design-${i + 1}`,
          title: `Luxury Stage Design ${i + 1}`,
          category_id: "15f8dad9-3d1d-4c37-9b5b-cbf9bfbc1c94",
          categories: { name: "Birthday" },
          image_url: "/assets/birthday-01.jpeg",
          price: 25000,
          inclusions: "Drapes, lights",
        })),
        totalCount: 36,
        isAuthenticated: true,
        isGated: false,
        lockedCount: 0,
      };
      await route.fulfill({ json });
    });

    // 2. Logged-in user navigates to /gallery
    await page.goto("/gallery");

    // All designs visible with zero friction
    const cards = page.locator("article");
    await expect(cards).toHaveCount(36);

    // Gated lock section should NOT be visible to authenticated user
    const gatedSection = page.locator("#gallery-gated-section");
    await expect(gatedSection).not.toBeVisible();

    // 3. User logs out / unauthenticates
    await page.unroute("**/api/designs*");
    await page.goto("/gallery");

    // Reverts to guest teaser mode
    await expect(page.locator("#gallery-gated-section")).toBeVisible();
    const guestCards = page.locator("article");
    await expect(guestCards.first()).toBeVisible();
    const count = await guestCards.count();
    expect(count).toBeLessThanOrEqual(6);
  });
});
