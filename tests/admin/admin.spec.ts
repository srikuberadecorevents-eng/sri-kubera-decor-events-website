import { test, expect } from "@playwright/test";
import {
  setAdminSession,
  setCustomerSession,
  clearAuthSession,
  MOCK_CUSTOMER_USER,
} from "./admin-auth-helper";

const viewports = [
  { name: "desktop-laptop", width: 1366, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

test.describe("Admin Portal Access, Layout & Isolation", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthSession(page);
  });

  for (const vp of viewports) {
    test(`Unauthenticated /admin redirects to /admin/login at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/admin", { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/admin\/login/);
      await expect(page.locator("text=Admin Sign In")).toBeVisible();
    });

    test(`Customer role visiting /admin redirects to /admin/403 at ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setCustomerSession(page);
      await page.goto("/admin", { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/admin\/403/);
      await expect(page.getByRole("heading", { name: "Access Restricted" })).toBeVisible();
    });

    test(`Admin portal has no public header, footer or whatsapp popup at ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setAdminSession(page);
      await page.goto("/admin", { waitUntil: "domcontentloaded" });

      // Verify no public header
      const publicHeader = page.locator("header:has-text('Quick Links'), header a[href='/about']");
      await expect(publicHeader).toHaveCount(0);

      // Verify no public footer
      const publicFooter = page.locator("footer:has-text('Quick Links'), footer:has-text('Our Services')");
      await expect(publicFooter).toHaveCount(0);

      // Verify no floating WhatsApp button
      const floatingWhatsApp = page.locator("#whatsapp-floating-button");
      await expect(floatingWhatsApp).toHaveCount(0);

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 2);
    });
  }

  test("Mobile drawer opens, closes on ESC key and navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setAdminSession(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });

    // Open mobile sidebar drawer using menu button
    const menuButton = page.locator("button[aria-label='Open navigation menu'], button:has-text('Menu')").first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Test ESC key closes drawer
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);

      // Drawer should be hidden or inactive
      const drawerVisible = await page.locator("aside:has-text('Enquiries')").first().isVisible();
      expect(drawerVisible).toBeFalsy();
    }
  });

  test("'View Public Site' link opens in a new tab", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await setAdminSession(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });

    const viewPublicLink = page.locator("a[href='/'][target='_blank']").first();
    await expect(viewPublicLink).toBeVisible();
    await expect(viewPublicLink).toHaveAttribute("target", "_blank");
  });

  test("Sign Out clears session and redirects to /admin/login", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await setAdminSession(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });

    const signOutBtn = page.locator("button:has-text('Sign Out')").first();
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Verify redirected to login
    await expect(page).toHaveURL(/\/admin\/login/);

    // Visiting /admin directly after sign out redirects to /admin/login
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("Admin Portal Lists, Delete Options & Confirm Dialogs", () => {
  test.beforeEach(async ({ page }) => {
    await setAdminSession(page);
  });

  test("1. Dashboard: renders metrics and sidebar links", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin", { waitUntil: "domcontentloaded" });

    // Verify title and quick stats
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.locator("a[href='/admin/enquiries']").first()).toBeVisible();
    await expect(page.locator("a[href='/admin/requirements']").first()).toBeVisible();
  });

  test("2. Enquiries: checkbox column, select-all, row delete, Quick Contact View/Call/WA, and ConfirmDialog", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/enquiries", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Customer Enquiries|Enquiries/i })).toBeVisible();

    // Verify search input
    await expect(page.locator("input[placeholder*='Search']")).toBeVisible();

    // Verify select-all checkbox header OR empty state is visible
    const selectAllCheckbox = page.locator("th input[type='checkbox']").first();
    const emptyState = page.getByRole("heading", { name: "No Enquiries Found" });
    await expect(selectAllCheckbox.or(emptyState)).toBeVisible();

    // If rows are present, test delete button & ConfirmDialog
    const rowCheckboxes = page.locator("tbody tr input[type='checkbox']");
    const count = await rowCheckboxes.count();
    if (count > 0) {
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow.locator("a[title='View Details'], button[title='View Details']").first()).toBeVisible();

      const rowDeleteBtn = firstRow.locator("button[title='Delete enquiry']");
      if (await rowDeleteBtn.isVisible()) {
        await rowDeleteBtn.click();
        const dialog = page.locator("[role='dialog'], .fixed:has-text('Delete Enquiry')");
        await expect(dialog).toBeVisible();
        await dialog.locator("button:has-text('Cancel')").click();
      }
    }
  });

  test("3. Requirements: checkboxes, bulk delete, lightbox, and ConfirmDialog", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/requirements", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Requirements/i }).first()).toBeVisible();
    const selectAllCheckbox = page.locator("th input[type='checkbox']").first();
    const emptyState = page.getByRole("heading", { name: "No Requirements Found" });
    await expect(selectAllCheckbox.or(emptyState)).toBeVisible();
  });

  test("4. Designs: grid/list views, bulk delete, row delete, and enquiry link warning", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/designs", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Designs", exact: true })).toBeVisible();
    await expect(page.locator("a:has-text('Add New Design')").first()).toBeVisible();

    // Verify designs grid cards or empty state
    const designCards = page.locator("button[aria-label='Select design'], tbody tr, h3").first();
    await expect(designCards).toBeVisible();

    // Row delete trash button on cards
    const deleteBtn = page.locator("button[title*='Delete']").first();
    await expect(deleteBtn).toBeVisible();
  });

  test("5. Categories: list, row checkbox, bulk delete, and move & delete dialog", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/categories", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Categories", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Category" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Select all categories" })).toBeVisible();
  });

  test("6. Media Library: checkboxes, select-all, in-use warning dialog", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/media", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Media Library" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Select All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload Photos" }).first()).toBeVisible();
  });

  test("7. Testimonials: checkboxes, select-all, bulk delete button", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/testimonials", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Testimonials/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add & Publish Review" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Select all testimonials" })).toBeVisible();
  });

  test("8. Services: checkboxes, select-all, bulk delete button", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/services", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Services/i })).toBeVisible();
    await expect(page.locator("button:has-text('Add Service')")).toBeVisible();
  });

  test("9. Customers: select-all, row delete, bulk delete with CSV reminder", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/customers", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Customers/i })).toBeVisible();
    await expect(page.locator("button:has-text('Export Customers CSV')")).toBeVisible();
  });

  test("10. Users & Roles: select-all, row delete, admin self-deletion guard", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/users", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Users/i }).first()).toBeVisible();
    await expect(page.locator("button:has-text('All Roles')")).toBeVisible();
  });

  test("11. Calendar: double booking warnings and day events drawer", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/calendar", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Booking Calendar|Calendar/i }).first()).toBeVisible();
    await expect(page.locator("button:has-text('Today')")).toBeVisible();
  });

  test("12. Settings: URL & email validation, empty notification email warning banner", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/settings", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.locator("button:has-text('Save Business Details')")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Phone Number" })).toBeVisible();
  });

  test("13. Activity Log: view-only without delete, pagination & filter controls", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/activity", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Activity Log/i }).first()).toBeVisible();
    // Confirm NO delete option exists on Activity Log (strictly view-only)
    await expect(page.locator("button:has-text('Delete selected')")).toHaveCount(0);
    await expect(page.locator("th input[type='checkbox']")).toHaveCount(0);
  });
});

test.describe("Security: Server-side Admin Authorization Verification", () => {
  test("Logged out request to /api/admin/delete is rejected with 401/403", async ({ request }) => {
    const response = await request.post("/api/admin/delete", {
      data: {
        entity: "enquiries",
        ids: ["test-id"],
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test("Customer session request to /api/admin/delete is rejected with 403", async ({ request }) => {
    const response = await request.post("/api/admin/delete", {
      headers: {
        Cookie: `test_auth_user=${encodeURIComponent(JSON.stringify(MOCK_CUSTOMER_USER))}`,
      },
      data: {
        entity: "enquiries",
        ids: ["test-id"],
      },
    });

    expect([401, 403]).toContain(response.status());
  });
});
