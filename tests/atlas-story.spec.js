import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('azzu-language', 'es'));
});

test('the Atlas laptop follows scroll in both directions and the footer links back', async ({page}, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#loading-screen')).toHaveCount(0, {timeout: 12000});
  const progressBar = page.getByRole('progressbar', {name: 'Avance del recorrido'});
  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  const panel = page.locator('#comparar');
  const screen = panel.locator('.atlas-laptop-screen img');
  const lid = panel.locator('.atlas-laptop-lid');
  const preview = panel.locator('.atlas-preview');
  expect(await lid.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m22)).toBeLessThan(0);
  const closedWidth = (await lid.boundingBox()).width;
  const baseWidth = (await panel.locator('.atlas-laptop-base').boundingBox()).width;
  expect(Math.abs(closedWidth - baseWidth)).toBeLessThan(baseWidth * .02);
  await expect(screen).toHaveCSS('opacity', '0');
  const phase = progress => preview.evaluate((el, progress) => {
    const start = el.parentElement.getBoundingClientRect().top + window.scrollY - innerHeight * .08;
    window.scrollTo(0, start + innerHeight * .77 * progress);
  }, progress);
  const opening = () => lid.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m22);
  await phase(.64);
  await expect.poll(opening).toBeGreaterThan(.9999);
  await expect(screen).toHaveCSS('opacity', '0');
  await phase(1.02);
  await expect(screen).toHaveCSS('opacity', '1');
  await phase(.93);
  await expect(screen).toHaveCSS('opacity', '1');
  await expect.poll(opening).toBeGreaterThan(.9999);
  await expect(progressBar).toHaveAttribute('aria-valuenow', /^[1-9]\d?$/);
  await phase(.28);
  await expect(screen).toHaveCSS('opacity', '0');
  await expect.poll(opening).toBeLessThan(.9);
  await phase(1.02);
  await expect(screen).toBeInViewport();
  await expect(screen).toHaveCSS('opacity', '1');
  const screenBox = await screen.boundingBox();
  const displayBox = await panel.locator('.atlas-laptop-display').boundingBox();
  expect(Math.abs(screenBox.x + screenBox.width / 2 - page.viewportSize().width / 2)).toBeLessThan(2);
  expect(displayBox.height).toBeGreaterThan(screenBox.height);
  expect(Math.abs(screenBox.y + screenBox.height / 2 - displayBox.y - displayBox.height / 2)).toBeLessThan(2);
  await page.screenshot({path: testInfo.outputPath('atlas-laptop.png')});
  const cards = panel.locator('.atlas-story-step');
  await expect(cards).toHaveCount(3);
  await expect(panel.locator('.atlas-variables .pin-spacer')).toHaveCount(0);
  const profile = cards.first().locator('.terrain-profile');
  await phase(-.12);
  await expect(profile).toHaveCSS('stroke-dashoffset', '1px');
  await cards.first().evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
  await expect(profile).toHaveCSS('stroke-dashoffset', '0px');
  await phase(-.12);
  await expect(profile).toHaveCSS('stroke-dashoffset', '1px');
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('dt')).toBeInViewport({ratio: .99});
    await expect(card.getByRole('img')).toBeInViewport();
  }
  await panel.locator('.atlas-variables').scrollIntoViewIfNeeded();
  await page.screenshot({path: testInfo.outputPath('atlas-metrics.png')});

  const footer = page.getByRole('contentinfo');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  await expect(footer.getByRole('link')).toHaveCount(3);
  await expect(footer.getByRole('link', {name: 'Abrir AZZU Atlas'}))
    .toHaveAttribute('href', 'https://nasa.azzu.tech/atlas/');
  await expect(footer.locator('.footer-brand')).toContainText('AZZU');
  await expect(footer.locator('.footer-brand img')).toBeVisible();
  await expect(footer.getByRole('link', {name: 'GitHub del Atlas'}))
    .toHaveAttribute('href', 'https://github.com/77ALDO77/tsumi_nasa_SA');
  await expect(footer.getByRole('link', {name: 'GitHub del landing'}))
    .toHaveAttribute('href', 'https://github.com/mofuel/nasa-azzu-landing');
  await expect.poll(() => footer.locator('.footer-horizon').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.998);
  await page.screenshot({path: testInfo.outputPath('footer.png')});
  const backToTop = page.getByRole('link', {name: 'Volver al inicio'});
  const {y} = await backToTop.boundingBox();
  const footerLinks = await footer.locator('.footer-links').boundingBox();
  expect(footerLinks.y + footerLinks.height).toBeLessThan(y);
  await backToTop.click();
  await expect(page).toHaveURL(/#tierra$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  const scrollDown = page.getByRole('link', {name: 'Deslizar para explorar'});
  await expect(scrollDown).toHaveAttribute('data-direction', 'down');
  await scrollDown.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(page.viewportSize().height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  expect(errors).toEqual([]);
});

test('reduced motion keeps all three metric explanations readable', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  const steps = page.locator('.atlas-story-step');
  await expect(page.locator('.atlas-laptop-screen img')).toHaveCSS('opacity', '1');
  await expect(steps).toHaveCount(3);
  await expect(page.locator('#comparar .pin-spacer')).toHaveCount(0);
  for (const step of await steps.all()) {
    await step.scrollIntoViewIfNeeded();
    await expect(step.locator('dt')).toBeInViewport();
    await expect(step.locator('dd')).toBeVisible();
  }
});
