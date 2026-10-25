import { test, expect } from "@playwright/test";

test.describe("Auth Flow: Signup, Login, Logout & Redirects", () => {
  const newUser = {
    id: "a1b2c3d4-e5f6-7890-abcd-112233445566",
    aud: "authenticated",
    role: "authenticated",
    email: "newcustomer@example.com",
    user_metadata: {
      name: "New Customer",
      phone: "9876543210",
      role: "user",
      gender: "female",
    },
    identities: [
      {
        id: "a1b2c3d4-e5f6-7890-abcd-112233445566",
        user_id: "a1b2c3d4-e5f6-7890-abcd-112233445566",
        identity_data: { email: "newcustomer@example.com" },
        provider: "email",
      },
    ],
    created_at: new Date().toISOString(),
  };

  const newSession = {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: newUser,
  };

  test("1. Signup succeeds without email verification screen and redirects to intended page", async ({ page }) => {
    let profileUpsertCalled = false;

    // Mock Supabase GoTrue API signup response (standard payload when email confirmation is off)
    await page.route("**/auth/v1/signup*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: {
          access_token: newSession.access_token,
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: newSession.refresh_token,
          user: newUser,
        },
      });
    });

    // Mock profiles upsert
    await page.route("**/rest/v1/profiles*", async (route) => {
      if (route.request().method() === "POST") {
        profileUpsertCalled = true;
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          json: { success: true },
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { ...newUser, name: "New Customer" },
        });
      }
    });

    // Mock user endpoint
    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: newUser,
      });
    });

    await page.goto("/signup?redirectTo=/gallery");
    await page.waitForLoadState("domcontentloaded");

    // Fill form
    await page.locator("#signup-name").fill("New Customer");
    await page.locator("#signup-phone").fill("9876543210");
    await page.locator("#signup-email").fill("newcustomer@example.com");
    await page.locator("#gender-female").check();
    await page.locator("#signup-password").fill("ValidPass123!");
    await page.locator("#signup-confirm").fill("ValidPass123!");
    await page.locator("#signup-agree-terms").check();

    // Submit
    await page.locator("button[type='submit']").click();

    // Verify redirected directly to /gallery without any email verification screen
    await page.waitForURL((url) => url.pathname === "/gallery", { timeout: 10000 });
    expect(page.url()).toContain("/gallery");

    // Verify requirement popup timer was stored in localStorage
    const timerValue = await page.evaluate((userId) => {
      return localStorage.getItem(`req_timer_start_${userId}`);
    }, newUser.id);
    expect(timerValue).not.toBeNull();
    expect(Number(timerValue)).toBeGreaterThan(0);

    // Verify profile upsert was triggered
    expect(profileUpsertCalled).toBe(true);
  });

  test("2. Signup error: Email already registered shows clean error", async ({ page }) => {
    await page.route("**/auth/v1/signup*", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        json: {
          error_code: "user_already_exists",
          message: "User already registered",
        },
      });
    });

    await page.goto("/signup");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#signup-name").fill("Existing User");
    await page.locator("#signup-phone").fill("9876543210");
    await page.locator("#signup-email").fill("existing@example.com");
    await page.locator("#gender-male").check();
    await page.locator("#signup-password").fill("ValidPass123!");
    await page.locator("#signup-confirm").fill("ValidPass123!");
    await page.locator("#signup-agree-terms").check();

    await page.locator("button[type='submit']").click();

    // Verify clean friendly message is shown in #signup-error-alert
    const alertBox = page.locator("#signup-error-alert");
    await expect(alertBox).toBeVisible({ timeout: 5000 });
    await expect(alertBox).toContainText(/already exists/i);
    // Ensure we stayed on signup page
    expect(page.url()).toContain("/signup");
  });

  test("3. Signup error: Weak password shows clean error", async ({ page }) => {
    await page.route("**/auth/v1/signup*", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        json: {
          error_code: "weak_password",
          message: "Password should be at least 8 characters",
        },
      });
    });

    await page.goto("/signup");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#signup-name").fill("Weak Pass User");
    await page.locator("#signup-phone").fill("9876543210");
    await page.locator("#signup-email").fill("weakpass@example.com");
    await page.locator("#gender-male").check();
    await page.locator("#signup-password").fill("Abcdefg1");
    await page.locator("#signup-confirm").fill("Abcdefg1");
    await page.locator("#signup-agree-terms").check();

    await page.locator("button[type='submit']").click();

    const alertBox = page.locator("#signup-error-alert");
    await expect(alertBox).toBeVisible({ timeout: 5000 });
    await expect(alertBox).toContainText(/password is too weak/i);
  });

  test("4. Signup error: Network failure shows clean connection error", async ({ page }) => {
    await page.route("**/auth/v1/signup*", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/signup");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#signup-name").fill("Network Test");
    await page.locator("#signup-phone").fill("9876543210");
    await page.locator("#signup-email").fill("networkfail@example.com");
    await page.locator("#gender-male").check();
    await page.locator("#signup-password").fill("ValidPass123!");
    await page.locator("#signup-confirm").fill("ValidPass123!");
    await page.locator("#signup-agree-terms").check();

    await page.locator("button[type='submit']").click();

    const alertBox = page.locator("#signup-error-alert");
    await expect(alertBox).toBeVisible({ timeout: 5000 });
    await expect(alertBox).toContainText(/unable to connect to the server/i);
  });

  test("5. Login and redirect: valid login navigates to intended redirectTo", async ({ page }) => {
    await page.route("**/auth/v1/token*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: newSession,
      });
    });

    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: newUser,
      });
    });

    await page.route("**/rest/v1/profiles*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { id: newUser.id, role: "user" },
      });
    });

    await page.goto("/login?redirectTo=/services");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#login-email").fill("newcustomer@example.com");
    await page.locator("#login-password").fill("ValidPass123!");
    await page.locator("button[type='submit']").click();

    await expect(page).toHaveURL(/\/services/, { timeout: 10000 });
  });

  test("6. Logout: customer signs out and navigates to home", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "test_auth_user",
        value: encodeURIComponent(JSON.stringify(newUser)),
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/enquiries", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/enquiries/);

    // Perform sign out by clearing session
    await context.clearCookies();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL("http://localhost:3000/");

    // Protected customer portal now redirects back to login
    await page.goto("/enquiries", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?redirectTo=.+enquiries/);
  });

  test("7. Redirect: logged-in user visiting /signup or /login is redirected away", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "test_auth_user",
        value: encodeURIComponent(JSON.stringify(newUser)),
        url: "http://localhost:3000",
      },
    ]);

    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({ json: newUser });
    });

    await page.goto("/signup");
    await expect(page).toHaveURL(/\/enquiries/);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/enquiries/);
  });
});
