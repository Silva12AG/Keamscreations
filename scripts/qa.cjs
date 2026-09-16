const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const profile of [
    { name: 'desktop', viewport: { width: 1440, height: 1000 } },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  ]) {
    const page = await browser.newPage(profile);
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `qa-${profile.name}.png`, fullPage: true });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const beforeTheme = await page.locator('html').getAttribute('data-theme');
    await page.locator('.theme-toggle').click();
    const afterTheme = await page.locator('html').getAttribute('data-theme');
    if (beforeTheme === afterTheme) throw new Error(`${profile.name}: theme toggle did not change theme`);

    if (profile.name === 'mobile') {
      await page.locator('.nav-toggle').click();
      if (await page.locator('.site-nav').getAttribute('class') === 'site-nav') throw new Error('mobile menu did not open');
      await page.locator('.nav-toggle').click();
    }

    await page.locator('.slider-next').click({ force: true });
    const counter = await page.locator('.slide-counter b').textContent();
    if (counter.trim() !== '02') throw new Error(`${profile.name}: slider did not advance`);

    await page.locator('.portfolio-filters [data-filter="logo"]').click();
    const visibleLogos = await page.locator('.portfolio-card[data-category="logo"]:visible').count();
    if (visibleLogos !== 3) throw new Error(`${profile.name}: portfolio filter did not show three logos`);

    await page.locator('[data-open-quote]').first().click();
    await page.locator('input[name="name"]').fill('QA Visitor');
    await page.locator('input[name="contact"]').fill('+267 70000000');
    await page.locator('select[name="service"]').selectOption({ label: 'Website design' });
    await page.locator('input[name="deadline"]').fill('2026-11-30');
    await page.locator('textarea[name="details"]').fill('A responsive website for a local business.');
    await page.locator('#quote-form button[type="submit"]').click();
    const whatsappHref = await page.locator('#whatsapp-link').getAttribute('href');
    const emailHref = await page.locator('#email-link').getAttribute('href');
    if (!whatsappHref.startsWith('https://wa.me/26773164945?text=')) throw new Error(`${profile.name}: WhatsApp draft link invalid`);
    if (!emailHref.startsWith('mailto:keamscreations@gmail.com?subject=')) throw new Error(`${profile.name}: email draft link invalid`);

    results.push({ profile: profile.name, overflow, consoleErrors: errors.length });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
