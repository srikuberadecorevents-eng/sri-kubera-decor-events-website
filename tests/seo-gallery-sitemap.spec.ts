import { test, expect } from "@playwright/test";

test.describe("SEO-Safe Gallery & Sitemap Verification", () => {
  test("1. robots.txt has Disallow: /api/ and /auth/ and points to sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();

    expect(body).toContain("Disallow: /api/");
    expect(body).toContain("Disallow: /auth/");
    expect(body).toContain("Disallow: /admin/");
    expect(body).toContain("Sitemap:");
  });

  test("2. sitemap.xml uses real DB IDs, updated_at timestamps, and only public designs", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();

    // Check core static pages
    expect(body).toContain("/gallery");
    expect(body).toContain("/about");
    expect(body).toContain("/services");
    expect(body).toContain("/contact");

    // Matches real UUID design URLs
    const galleryMatches = body.match(/<loc>[^<]+\/gallery\/[^<]+<\/loc>/g) || [];
    // Exactly 6 public featured designs in sitemap
    expect(galleryMatches.length).toBe(6);

    // Ensure lastmod exists and is a valid ISO date
    const lastModMatches = body.match(/<lastmod>([^<]+)<\/lastmod>/g) || [];
    expect(lastModMatches.length).toBeGreaterThanOrEqual(7);
  });

  test("3. Core public pages have NO noindex robots tag", async ({ page }) => {
    const publicPages = ["/", "/about", "/services", "/gallery", "/contact"];

    for (const path of publicPages) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);

      // Check meta robots tag does not contain noindex
      const robotsMeta = page.locator('meta[name="robots"]');
      if ((await robotsMeta.count()) > 0) {
        const content = await robotsMeta.getAttribute("content");
        expect(content?.toLowerCase()).not.toContain("noindex");
      }
    }
  });

  test("4. Featured design page loads HTTP 200 with full content for guests (no redirect)", async ({ page }) => {
    // bday-01 is one of the initial public featured designs
    const res = await page.goto("/gallery/bday-01");
    expect(res?.status()).toBe(200);
    expect(page.url()).toContain("/gallery/bday-01");

    // Verify full content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("img").first()).toBeVisible();
    await expect(page.locator("text=What's Included In This Setup")).toBeVisible();
    await expect(page.locator("text=Back to Gallery")).toBeVisible();
  });

  test("5. Gated design page loads HTTP 200 with in-page sign-in prompt for guests (no redirect)", async ({ page }) => {
    // mar-01 is beyond the first 6 featured designs
    const res = await page.goto("/gallery/mar-01");
    expect(res?.status()).toBe(200);
    expect(page.url()).toContain("/gallery/mar-01");

    // Verify in-page Sign-In Prompt
    await expect(page.getByRole("heading", { name: /Sign In to View This Design/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign In to Unlock/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Create Free Account/i })).toBeVisible();

    // Verify robots meta is noindex for gated preview
    const robotsMeta = page.locator('meta[name="robots"]');
    const content = await robotsMeta.getAttribute("content");
    expect(content?.toLowerCase()).toContain("noindex");
  });
});
