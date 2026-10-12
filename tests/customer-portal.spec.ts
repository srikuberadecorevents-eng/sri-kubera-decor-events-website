import { test, expect } from "@playwright/test";

test.describe("Customer Portal (/enquiries & /profile) Reliability Tests", () => {
  const customerUser = {
    id: "f83b1234-abcd-4321-beef-1234567890ab",
    email: "srikuberadecorevents@gmail.com",
    role: "user",
    user_metadata: {
      name: "Sri Kubera Customer",
      phone: "9486064769",
      role: "user",
    },
    created_at: new Date().toISOString(),
  };

  test("1. Unauthenticated access to /enquiries and /profile redirects to /login with redirectTo param", async ({ page }) => {
    // 1. Visit /enquiries as guest
    await page.goto("/enquiries");
    await expect(page).toHaveURL(/\/login\?redirectTo=.+enquiries/);

    // 2. Visit /profile as guest
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login\?redirectTo=.+profile/);

    // 3. Visit /dashboard as guest
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirectTo=.+dashboard/);
  });

  test("2. Logged-in customer can access /profile and /enquiries with zero redirect loops", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "test_auth_user",
        value: encodeURIComponent(JSON.stringify(customerUser)),
        domain: "localhost",
        path: "/",
      },
    ]);

    // Mock user auth session
    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({ json: customerUser });
    });

    // Mock profiles lookup
    await page.route("**/rest/v1/profiles*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            id: customerUser.id,
            email: customerUser.email,
            name: "Sri Kubera Customer",
            phone: "9486064769",
            role: "user",
            gender: "male",
            address: "No. 80, Manjini Nagar, Puducherry",
            pincode: "605003",
            created_at: customerUser.created_at,
          },
        });
      } else {
        await route.fulfill({ json: { success: true } });
      }
    });

    // Mock bookings
    await page.route("**/rest/v1/bookings*", async (route) => {
      await route.fulfill({ json: [] });
    });

    // 1. Visit /profile as customer
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole("heading", { name: /My Profile & Preferences/i })).toBeVisible();

    // 2. Visit /enquiries as customer
    await page.goto("/enquiries");
    await expect(page).toHaveURL(/\/enquiries/);
    await expect(page.getByRole("heading", { name: /My Enquiries & Bookings/i })).toBeVisible();

    // 3. Visit /dashboard as customer (redirects to /enquiries cleanly without loop)
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/enquiries/);
  });

  test("3. Enquiries empty state displays 'You have no enquiries yet' and links to gallery", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "test_auth_user",
        value: encodeURIComponent(JSON.stringify(customerUser)),
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({ json: customerUser });
    });

    await page.route("**/rest/v1/bookings*", async (route) => {
      await route.fulfill({ json: [] });
    });

    await page.goto("/enquiries");

    // Empty state heading check
    const emptyHeading = page.getByRole("heading", { name: /You have no enquiries yet/i });
    await expect(emptyHeading).toBeVisible();

    // Button links to gallery
    const galleryBtn = page.getByRole("link", { name: /Explore Design Gallery/i });
    await expect(galleryBtn).toBeVisible();
    await expect(galleryBtn).toHaveAttribute("href", "/gallery");
  });

  test("4. Enquiries list displays bookings and navigates to detail page", async ({ page, context }) => {
    const mockBookings = [
      {
        id: "b111-2222-3333-4444",
        enquiry_id: "ENQ-9988",
        status: "pending",
        booking_date: new Date().toISOString(),
        event_date: "2026-12-15",
        venue: "Anandha Inn Convention Hall, Puducherry",
        admin_notes: "Initial phone discussion pending.",
        designs: {
          title: "Royal Grand Mandapam",
          image_url: "/assets/marriage-01.jpeg",
          categories: { name: "Wedding" },
        },
      },
    ];

    const customerUserWithBookings = {
      ...customerUser,
      test_bookings: mockBookings,
    };

    await context.addCookies([
      {
        name: "test_auth_user",
        value: encodeURIComponent(JSON.stringify(customerUserWithBookings)),
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({ json: customerUserWithBookings });
    });

    await page.route("**/rest/v1/bookings*", async (route) => {
      await route.fulfill({ json: mockBookings });
    });

    await page.goto("/enquiries");

    // Booking card elements
    await expect(page.getByText("ENQ-9988")).toBeVisible();
    await expect(page.getByText("Royal Grand Mandapam")).toBeVisible();
    await expect(page.getByText("Submitted")).toBeVisible();

    // Copy Enquiry ID button
    const copyBtn = page.getByTitle("Copy Enquiry ID");
    await expect(copyBtn).toBeVisible();

    // Detail page link
    const detailsLink = page.getByRole("link", { name: /View Full Details/i });
    await expect(detailsLink).toBeVisible();
    await expect(detailsLink).toHaveAttribute("href", "/enquiries/b111-2222-3333-4444");
  });

  test("5. Profile page loads, edits details via upsert, and changes password", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "test_auth_user",
        value: encodeURIComponent(JSON.stringify(customerUser)),
        domain: "localhost",
        path: "/",
      },
    ]);

    let updatedPayload: { name?: string; [key: string]: unknown } | null = null;

    await page.route("**/auth/v1/user*", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({ json: { ...customerUser } });
      } else {
        await route.fulfill({ json: customerUser });
      }
    });

    await page.route("**/rest/v1/profiles*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            id: customerUser.id,
            email: customerUser.email,
            name: "Initial Customer Name",
            phone: "9486064769",
            role: "user",
            gender: "male",
            address: "Initial Address",
            pincode: "605001",
            created_at: customerUser.created_at,
          },
        });
      } else {
        updatedPayload = route.request().postDataJSON();
        await route.fulfill({ json: { success: true } });
      }
    });

    await page.goto("/profile");
    await expect(page.locator("#profile-name")).toHaveValue("Initial Customer Name");

    // Edit profile details
    await page.locator("#profile-name").fill("Updated Sri Kubera Customer");
    await page.locator("#profile-address").fill("No. 100, Beach Road, Puducherry");
    await page.locator("#profile-pincode").fill("605002");

    // Submit form
    const saveBtn = page.getByRole("button", { name: /Save Changes/i });
    await saveBtn.click();

    // Verify toast confirmation
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible();
    expect(updatedPayload).not.toBeNull();
    const payload = updatedPayload as { name?: string } | null;
    expect(payload?.name).toBe("Updated Sri Kubera Customer");

    // Change password flow
    await page.locator("#profile-new-password").fill("NewSecretPass123!");
    await page.locator("#profile-confirm-password").fill("NewSecretPass123!");
    const passBtn = page.getByRole("button", { name: /Update Password/i });
    await passBtn.click();

    await expect(page.getByText(/Password updated successfully/i).first()).toBeVisible();
  });
});
