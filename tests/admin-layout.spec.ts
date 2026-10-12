import { test, expect } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "desktop", width: 1920, height: 1080 },
];

test.describe("Admin Layout Isolation & Responsiveness", () => {
  for (const vp of viewports) {
    test(`/admin/login at ${vp.width}x${vp.height} has no public chrome and no horizontal scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/admin/login", { waitUntil: "domcontentloaded" });

      // Verify no public header
      const publicHeader = page.locator("header:has-text('Quick Links'), header a[href='/about']");
      await expect(publicHeader).toHaveCount(0);

      // Verify no public footer
      const publicFooter = page.locator("footer:has-text('Quick Links'), footer:has-text('Our Services')");
      await expect(publicFooter).toHaveCount(0);

      // Verify no floating WhatsApp button
      const floatingWhatsApp = page.locator("#whatsapp-floating-button");
      await expect(floatingWhatsApp).toHaveCount(0);

      // Verify login card exists
      await expect(page.locator("text=Admin Sign In")).toBeVisible();

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
    });

    test(`/admin/403 at ${vp.width}x${vp.height} has no public chrome`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/admin/403", { waitUntil: "domcontentloaded" });

      // Verify no public header or footer
      await expect(page.locator("footer:has-text('Quick Links')")).toHaveCount(0);
      await expect(page.locator("#whatsapp-floating-button")).toHaveCount(0);

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
    });
  }

  test("Public home page has public Header, Footer, and WhatsApp button", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Verify public header exists
    await expect(page.locator("header a[href='/']").first()).toBeVisible();

    // Verify public footer exists
    await expect(page.locator("footer:has-text('Quick Links')")).toBeVisible();
    await expect(page.locator("footer:has-text('Our Services')")).toBeVisible();

    // Verify floating WhatsApp button exists
    await expect(page.locator("#whatsapp-floating-button")).toBeVisible();
  });

  test("Public /about has public Header and Footer", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header a[href='/']").first()).toBeVisible();
    await expect(page.locator("footer:has-text('Quick Links')")).toBeVisible();
  });

  test("Public /gallery has public Header and Footer", async ({ page }) => {
    await page.goto("/gallery", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header a[href='/']").first()).toBeVisible();
    await expect(page.locator("footer:has-text('Quick Links')")).toBeVisible();
  });

  test("Public /contact has public Header and Footer", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header a[href='/']").first()).toBeVisible();
    await expect(page.locator("footer:has-text('Quick Links')")).toBeVisible();
  });
});
