import { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

// Load .env.local manually if present using native fs
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  // Ignore env read error
}

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "admin@gmail.com";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "08xmx4m7yJ*";

export interface MockUser {
  id: string;
  email: string;
  role?: string;
  user_metadata: {
    name?: string;
    role?: string;
    phone?: string;
  };
}

export const MOCK_ADMIN_USER: MockUser = {
  id: "00000000-0000-4000-a000-000000000001",
  email: ADMIN_EMAIL,
  role: "authenticated",
  user_metadata: {
    name: "Administrator",
    role: "admin",
    phone: "9876543210",
  },
};

export const MOCK_CUSTOMER_USER: MockUser = {
  id: "00000000-0000-4000-a000-000000000002",
  email: "customer@example.com",
  role: "authenticated",
  user_metadata: {
    name: "Customer User",
    role: "customer",
    phone: "9876543211",
  },
};

/**
 * Sets an admin session in the browser context using test cookie
 * supported by proxy.ts and AdminLayout in non-production environments.
 */
export async function setAdminSession(page: Page) {
  await page.context().addCookies([
    {
      name: "test_auth_user",
      value: encodeURIComponent(JSON.stringify(MOCK_ADMIN_USER)),
      url: "http://localhost:3000",
    },
    {
      name: "admin_last_active",
      value: Date.now().toString(),
      url: "http://localhost:3000",
    },
  ]);

  // Mock GoTrue client auth responses so client-side supabase.auth doesn't fail
  await page.route("**/auth/v1/user*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: MOCK_ADMIN_USER,
    });
  });

  await page.route("**/auth/v1/session*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: {
        access_token: "mock-admin-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-admin-refresh-token",
        user: MOCK_ADMIN_USER,
      },
    });
  });
}

/**
 * Sets a customer session to test 403 authorization guard.
 */
export async function setCustomerSession(page: Page) {
  await page.context().addCookies([
    {
      name: "test_auth_user",
      value: encodeURIComponent(JSON.stringify(MOCK_CUSTOMER_USER)),
      url: "http://localhost:3000",
    },
  ]);

  await page.route("**/auth/v1/user*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: MOCK_CUSTOMER_USER,
    });
  });
}

/**
 * Clears all authentication cookies and sessions.
 */
export async function clearAuthSession(page: Page) {
  await page.context().clearCookies();
}
