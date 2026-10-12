import { test, expect } from "@playwright/test";
import {
  formatWhatsAppNumber,
  buildWhatsAppMessage,
} from "../src/lib/whatsappEnquiry";

test.describe("WhatsApp Enquiry Feature Tests", () => {
  test("1. Phone Number Formatter formats numbers to digits only with country code", () => {
    // 10 digits standard
    expect(formatWhatsAppNumber("7373876879")).toBe("917373876879");
    // With spaces and hyphens
    expect(formatWhatsAppNumber("+91 73738-76879")).toBe("917373876879");
    // Already has 91 prefix
    expect(formatWhatsAppNumber("919486064769")).toBe("919486064769");
    // Leading zero 11-digit
    expect(formatWhatsAppNumber("07373876879")).toBe("917373876879");
    // Empty or null returns business fallback
    expect(formatWhatsAppNumber(null)).toBe("917373876879");
  });

  test("2. buildWhatsAppMessage builds complete message with all required design facts", () => {
    const mockDesign = {
      id: "bday-01",
      title: "Purple Butterfly First Birthday",
      category: "Birthday",
      imageUrl: "https://deuwslifdqwrijiahltm.supabase.co/storage/v1/object/public/design-images/bday1.jpg",
    };

    const message = buildWhatsAppMessage({
      design: mockDesign,
      clientName: "Vishnu Prasad",
      clientPhone: "9876543210",
      origin: "https://srikuberadecor.com",
    });

    // Check all facts from requirements
    expect(message).toContain("Hello Sri Kubera Decor & Events!");
    expect(message).toContain("Purple Butterfly First Birthday");
    expect(message).toContain("Birthday");
    expect(message).toContain("bday-01");
    expect(message).toContain("https://srikuberadecor.com/gallery/bday-01");
    expect(message).toContain("https://deuwslifdqwrijiahltm.supabase.co/storage/v1/object/public/design-images/bday1.jpg");
    expect(message).toContain("Vishnu Prasad");
    expect(message).toContain("9876543210");
  });

  test("3. buildWhatsAppMessage builds generic greeting when no design is selected", () => {
    const genericMessage = buildWhatsAppMessage({
      design: null,
      clientName: "Priya",
      clientPhone: "9123456789",
    });

    expect(genericMessage).toContain("Hello Sri Kubera Decor & Events!");
    expect(genericMessage).toContain("Priya");
    expect(genericMessage).toContain("9123456789");
    expect(genericMessage).toContain("catalogue");
    expect(genericMessage).not.toContain("Design ID");
  });

  test("4. Gallery Detail Page has Open Graph tags for WhatsApp link preview", async ({ page }) => {
    // Visit first teaser design (bday-01)
    await page.goto("/gallery/bday-01");

    // Title tag
    const pageTitle = await page.title();
    expect(pageTitle).toContain("Sri Kubera Decor");

    // Open Graph meta tags for WhatsApp preview unfurling
    const ogTitle = await page.locator("meta[property='og:title']").getAttribute("content");
    expect(ogTitle).toBeTruthy();
    expect(ogTitle).toContain("Sri Kubera");

    const ogImage = await page.locator("meta[property='og:image']").getAttribute("content");
    expect(ogImage).toBeTruthy();
    expect(ogImage).toMatch(/^https?:\/\//);

    const ogDesc = await page.locator("meta[property='og:description']").getAttribute("content");
    expect(ogDesc).toBeTruthy();

    const ogUrl = await page.locator("meta[property='og:url']").getAttribute("content");
    expect(ogUrl).toBeTruthy();
    expect(ogUrl).toContain("/gallery/bday-01");
  });

  test("5. Gallery Detail Page has Instant WhatsApp Enquiry button with proper trigger", async ({ page }) => {
    await page.goto("/gallery/bday-01");

    const enquireBtn = page.locator("[data-testid='whatsapp-detail-enquire-btn']");
    await expect(enquireBtn).toBeVisible();
    await expect(enquireBtn).toContainText("Instant WhatsApp Enquiry");
  });

  test("6. Gallery Cards have Enquire button", async ({ page }) => {
    await page.goto("/gallery");

    const cardEnquireBtn = page.locator("[data-testid^='card-enquire-whatsapp-']").first();
    await expect(cardEnquireBtn).toBeVisible();
    await expect(cardEnquireBtn).toContainText("Enquire");
  });

  test("7. Floating WhatsApp Button is visible and configured", async ({ page }) => {
    await page.goto("/");

    const waFloating = page.locator("#whatsapp-floating-button");
    await expect(waFloating).toBeVisible();
    const href = await waFloating.getAttribute("href");
    expect(href).toContain("wa.me");
  });

  test("8. WhatsApp Enquiry API Route records enquiry", async ({ request }) => {
    const res = await request.post("/api/enquiry/whatsapp", {
      data: {
        design_id: "bday-01",
        message: "Automated smoke test WhatsApp enquiry message",
        client_name: "Test Client",
        client_phone: "9876543210",
      },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.enquiry_id).toBeTruthy();
  });
});
