import {expect, test} from '@playwright/test';

test('English is the default and the language can change during the journey', async ({page}) => {
  await page.goto('/');
  const html = page.locator('html');
  const english = page.getByRole('button', {name: 'English'});
  const spanish = page.getByRole('button', {name: 'Español'});
  await expect(html).toHaveAttribute('lang', 'en');
  await expect(page.locator('#loading-screen')).toHaveCount(0, {timeout: 20000});
  await expect(english).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.hero-scroll-cue > span')).toHaveText('Scroll');
  await expect(page.locator('#tierra').getByRole('link', {name: 'Open AZZU Atlas'})).toBeVisible();
  const heroTitle = page.locator('.hero-title h1');
  await spanish.click();
  await expect(html).toHaveAttribute('lang', 'es');
  await expect(page.locator('.hero-scroll-cue > span')).toHaveText('Desliza');
  await expect(page.locator('#root')).not.toHaveClass(/is-launching/);
  await expect(heroTitle).toHaveCSS('opacity', '1');
  await expect(heroTitle).toHaveCSS('animation-name', 'none');
  await english.click();
  await expect(html).toHaveAttribute('lang', 'en');

  await page.goto('/#luna');
  const moon = page.locator('#luna');
  await expect(moon.getByRole('heading', {name: 'To the Moon, from Earth'})).toBeInViewport();
  const offset = await page.evaluate(() => scrollY);
  await spanish.click();
  await expect(html).toHaveAttribute('lang', 'es');
  await expect(spanish).toHaveAttribute('aria-pressed', 'true');
  await expect(moon.getByRole('heading', {name: 'Rumbo a la Luna, desde la Tierra'})).toBeInViewport();
  expect(Math.abs(await page.evaluate(() => scrollY) - offset)).toBeLessThan(40);

  await page.reload();
  await expect(html).toHaveAttribute('lang', 'es');
  await expect(page.locator('#loading-screen')).toHaveCount(0, {timeout: 20000});
  await expect(spanish).toHaveAttribute('aria-pressed', 'true');
  await english.click();
  await expect(html).toHaveAttribute('lang', 'en');
  const footerAtlas = page.getByRole('contentinfo').getByRole('link', {name: 'Open AZZU Atlas'});
  await expect(footerAtlas).toHaveAttribute('href', 'https://nasa.azzu.tech/atlas/');
  await expect(footerAtlas.locator('img')).toHaveCount(0);
});
