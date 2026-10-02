const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'qa-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const auditResults = [];

function recordFinding(page, element, expected, actual, severity, fileAndLine) {
  auditResults.push({ page, element, expected, actual, severity, fileAndLine });
}

async function runAudit() {
  console.log('--- STARTING PLAYWRIGHT QA AUDIT ---');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '360px', width: 360, height: 740 },
    { name: '768px', width: 768, height: 1024 },
    { name: '1024px', width: 1024, height: 768 },
    { name: '1440px', width: 1440, height: 900 },
  ];

  const routes = [
    { path: '/', name: 'home' },
    { path: '/gallery', name: 'gallery' },
    { path: '/gallery/design-1', name: 'gallery-detail' },
    { path: '/services', name: 'services' },
    { path: '/about', name: 'about' },
    { path: '/contact', name: 'contact' },
    { path: '/login', name: 'login' },
    { path: '/signup', name: 'signup' },
    { path: '/non-existent-page-404', name: 'not-found' },
  ];

  // 1. VIEWPORT & OVERFLOW AUDIT
  console.log('\n[1] Testing Viewports, Horizontal Overflow, and Visual Snapshots...');
  for (const vp of viewports) {
    console.log(`Testing viewport: ${vp.name}`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    for (const route of routes) {
      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(600);

        // Check horizontal overflow
        const overflowData = await page.evaluate(() => {
          return {
            hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth
          };
        });

        if (overflowData.hasOverflow) {
          recordFinding(
            route.path,
            `Viewport layout (${vp.name})`,
            'No horizontal scrollbar / overflow',
            `Page horizontally overflows (scrollWidth: ${overflowData.scrollWidth}px > window: ${overflowData.innerWidth}px)`,
            'High',
            `src/app${route.path === '/' ? '/page.tsx' : route.path + '/page.tsx'}`
          );
        }

        // Check broken images
        const brokenImages = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
        });

        if (brokenImages.length > 0) {
          recordFinding(
            route.path,
            'Images',
            'All images load cleanly with naturalWidth > 0',
            `Broken images detected: ${brokenImages.join(', ')}`,
            'High',
            `src/app${route.path === '/' ? '/page.tsx' : route.path + '/page.tsx'}`
          );
        }

        // Take screenshot
        const shotName = `${route.name}_${vp.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, shotName), fullPage: true });
      } catch (err) {
        console.error(`Error loading ${route.path} on ${vp.name}:`, err.message);
      }
    }

    if (consoleErrors.length > 0) {
      recordFinding(
        'Various',
        `Console in ${vp.name}`,
        'Zero browser console errors',
        `Console errors encountered: ${consoleErrors.slice(0, 3).join('; ')}`,
        'Medium',
        'Browser runtime'
      );
    }

    await context.close();
  }

  // 2. INTERACTIVE PUBLIC CHECKS (Desktop 1440px)
  console.log('\n[2] Testing Interactions, Forms, Filters, and Links...');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dPage = await desktopContext.newPage();

  // Test Gallery Search & Category Filtering
  await dPage.goto(`${BASE_URL}/gallery`, { waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(500);
  const searchInput = dPage.locator('#gallery-search');
  if (await searchInput.isVisible()) {
    await searchInput.fill('Mandap');
    await dPage.waitForTimeout(400);
    const countText = await dPage.locator('text=Showing').innerText().catch(() => '');
    console.log('Search "Mandap" result:', countText);
  } else {
    recordFinding('/gallery', 'Search input #gallery-search', 'Search input visible', 'Element not found', 'High', 'src/app/gallery/page.tsx:73');
  }

  // Test Contact Form Validation
  console.log('Testing Contact form validation...');
  await dPage.goto(`${BASE_URL}/contact`, { waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(500);
  const submitBtn = dPage.locator('button[type="submit"]');
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await dPage.waitForTimeout(400);
    const nameError = await dPage.locator('#name-error').isVisible().catch(() => false);
    const phoneError = await dPage.locator('#phone-error').isVisible().catch(() => false);
    if (!nameError || !phoneError) {
      recordFinding('/contact', 'Contact form empty submit', 'Shows validation error messages under required fields', 'Errors not displayed properly', 'Medium', 'src/app/contact/ContactClient.tsx');
    }
  }

  // Test Login Form Validation
  console.log('Testing Login form validation...');
  await dPage.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(500);
  const loginSubmit = dPage.locator('button[type="submit"]');
  if (await loginSubmit.isVisible()) {
    await loginSubmit.click();
    await dPage.waitForTimeout(400);
    const emailErr = await dPage.locator('#email-error').isVisible().catch(() => false);
    if (!emailErr) {
      recordFinding('/login', 'Login empty submit', 'Shows validation error', 'Validation error not shown', 'Medium', 'src/app/login/page.tsx');
    }
  }

  // Test Signup Form Validation
  console.log('Testing Signup form validation...');
  await dPage.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(500);
  const signupSubmit = dPage.locator('button[type="submit"]');
  if (await signupSubmit.isVisible()) {
    await signupSubmit.click();
    await dPage.waitForTimeout(400);
    const passErr = await dPage.locator('#password-error').isVisible().catch(() => false);
    if (!passErr) {
      recordFinding('/signup', 'Signup empty submit', 'Shows validation error', 'Validation error not shown', 'Medium', 'src/app/signup/page.tsx');
    }
  }

  // Test WhatsApp floating button
  console.log('Testing WhatsApp button...');
  await dPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(500);
  const waBtn = dPage.locator('a[aria-label="Contact us on WhatsApp"]');
  if (await waBtn.isVisible()) {
    const waHref = await waBtn.getAttribute('href');
    if (!waHref || !waHref.includes('wa.me') || !waHref.includes('919486064769')) {
      recordFinding('/', 'Floating WhatsApp Button', 'Opens wa.me with NEXT_PUBLIC_BUSINESS_WHATSAPP (919486064769)', `href is: ${waHref}`, 'Medium', 'src/components/layout/WhatsAppButton.tsx');
    }
  } else {
    recordFinding('/', 'Floating WhatsApp Button', 'Floating button visible on all pages', 'Button element not found', 'High', 'src/components/layout/WhatsAppButton.tsx');
  }

  // Check dead links in Navbar and Footer
  console.log('Checking navigation and footer links...');
  const allLinks = await dPage.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.getAttribute('href')
    })).filter(l => l.href && !l.href.startsWith('tel:') && !l.href.startsWith('mailto:'));
  });

  for (const l of allLinks) {
    if (l.href === '#' || l.href === '') {
      recordFinding('/', `Link "${l.text}"`, 'Valid destination URL', 'Dead link with href="#"', 'Medium', 'src/components/layout/Footer.tsx');
    }
  }

  // 3. AUTH GUARDS & ROUTE ACCESS (Logged-out state)
  console.log('\n[3] Testing Route Guards (Logged out state)...');
  const guardedRoutes = [
    { path: '/dashboard', expectedRedirect: '/login' },
    { path: '/admin', expectedRedirect: '/login' },
    { path: '/enquiries', expectedRedirect: '/login' },
    { path: '/profile', expectedRedirect: '/login' },
  ];

  for (const gr of guardedRoutes) {
    await dPage.goto(`${BASE_URL}${gr.path}`, { waitUntil: 'domcontentloaded' });
    await dPage.waitForTimeout(500);
    const currentUrl = dPage.url();
    if (!currentUrl.includes(gr.expectedRedirect)) {
      recordFinding(
        gr.path,
        'Route Guard (Logged-out)',
        `Redirect to ${gr.expectedRedirect}?redirectTo=${gr.path}`,
        `Did not redirect properly; landed on: ${currentUrl}`,
        'Critical',
        'src/proxy.ts or src/app/admin/layout.tsx'
      );
    }
  }

  // 4. SECURITY AUDIT: RLS & SUPABASE CHECKS
  console.log('\n[4] Testing Security & RLS Policies...');
  const supabaseUrl = 'https://deuwslifdqwrijiahltm.supabase.co';
  const anonKey = 'sb_publishable_oLDFyTRnRUs2vmn39oJl7g_SoxdcxnB';
  const anonClient = createClient(supabaseUrl, anonKey);

  // Test 4a: Can anon read profiles?
  const { data: profilesData, error: profilesError } = await anonClient.from('profiles').select('*');
  if (!profilesError && profilesData && profilesData.length > 0) {
    recordFinding(
      'Database / RLS',
      'profiles table RLS',
      'Anonymous users cannot read other users profiles',
      `Anonymous read succeeded and returned ${profilesData.length} records`,
      'Critical',
      'supabase/migrations/001_initial_schema.sql:38'
    );
  }

  // Test 4b: Can anon read bookings?
  const { data: bookingsData, error: bookingsError } = await anonClient.from('bookings').select('*');
  if (!bookingsError && bookingsData && bookingsData.length > 0) {
    recordFinding(
      'Database / RLS',
      'bookings table RLS',
      'Anonymous users cannot read customer bookings',
      `Anonymous read succeeded and returned ${bookingsData.length} records`,
      'Critical',
      'supabase/migrations/001_initial_schema.sql:120'
    );
  }

  // Test 4c: Can unauthenticated user call /api/enquiry POST?
  const apiRes = await fetch(`${BASE_URL}/api/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ design_id: 'design-1' })
  });
  if (apiRes.status !== 401) {
    recordFinding(
      '/api/enquiry',
      'Unauthenticated API call',
      'Returns 401 Unauthorised',
      `Returned HTTP ${apiRes.status}`,
      'High',
      'src/app/api/enquiry/route.ts:13'
    );
  }

  // Test 4d: Check for exposed secret keys in .env.local
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  if (envContent.includes('placeholder_service_role_key_replace_me')) {
    recordFinding(
      '.env.local',
      'SUPABASE_SERVICE_ROLE_KEY',
      'Valid production service role key configured',
      'Contains placeholder value "placeholder_service_role_key_replace_me"',
      'High',
      '.env.local:7'
    );
  }
  if (envContent.includes('re_placeholder_replace_me')) {
    recordFinding(
      '.env.local',
      'RESEND_API_KEY',
      'Valid production Resend API key configured for email receipts',
      'Contains placeholder value "re_placeholder_replace_me"',
      'High',
      '.env.local:9'
    );
  }

  // Test 5: Performance Navigation Timings
  console.log('\n[5] Measuring Performance Metrics...');
  const perfPages = ['/', '/gallery', '/services', '/contact'];
  for (const pp of perfPages) {
    await dPage.goto(`${BASE_URL}${pp}`, { waitUntil: 'domcontentloaded' });
    const perfTiming = await dPage.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
      };
    });
    console.log(`Performance for ${pp}: DCL=${perfTiming.domContentLoaded}ms, Load=${perfTiming.loadComplete}ms`);
  }

  await desktopContext.close();
  await browser.close();

  // Save findings JSON
  fs.writeFileSync(
    path.join(__dirname, '..', 'qa-audit-findings.json'),
    JSON.stringify(auditResults, null, 2)
  );
  console.log(`\nQA Audit Completed! Total issues recorded: ${auditResults.length}`);
}

runAudit().catch(err => {
  console.error('Audit runner error:', err);
  process.exit(1);
});
