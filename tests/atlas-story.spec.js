import {expect, test} from '@playwright/test';

test('the first card and heading stay fixed while later cards cover them', async ({page}, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#loading-screen')).toHaveCount(0, {timeout: 12000});
  const stage = page.locator('.atlas-stack-stage');
  const cards = stage.locator('.atlas-story-step');
  const start = await stage.evaluate(el => el.parentElement.getBoundingClientRect().top + scrollY);
  const phase = async progress => {
    await page.evaluate(y => scrollTo(0, y), start + page.viewportSize().height * 2.8 * progress);
    await page.evaluate(async () => { for (let i=0; i<35; i++) await new Promise(requestAnimationFrame); });
  };
  await phase(.1);
  const initial = await cards.first().boundingBox();
  const heading = await stage.locator('h3').boundingBox();
  for (const [progress, active] of [[.1,0],[.32,0],[.5,1],[.72,1],[.9,2],[.5,1],[.1,0]]) {
    await phase(progress);
    const first = await cards.first().boundingBox();
    expect(Math.abs(first.y - initial.y)).toBeLessThan(2);
    expect(Math.abs(first.width - initial.width)).toBeLessThan(2);
    expect(Math.abs((await stage.locator('h3').boundingBox()).y - heading.y)).toBeLessThan(2);
    if (progress === .32) {
      const incoming = await cards.nth(1).boundingBox();
      expect(incoming.y).toBeGreaterThan(first.y + 20);
      expect(incoming.y).toBeLessThan(first.y + first.height);
    }
    if ([.1,.5,.9].includes(progress)) {
      const card = cards.nth(active);
      await expect(card.locator('dt')).toBeInViewport({ratio:.99});
      await expect(card.locator('.terrain-story')).toBeInViewport({ratio:.95});
      expect(await card.evaluate(el => {
        const b=el.getBoundingClientRect();
        return document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('.atlas-story-step') === el;
      })).toBe(true);
    }
    await page.screenshot({path:testInfo.outputPath('stack-' + progress + '.png')});
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  expect(errors).toEqual([]);
});

test('reduced motion keeps all three metric explanations readable', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  const steps = page.locator('.atlas-story-step');
  await expect(steps).toHaveCount(3);
  await expect(steps.first()).toHaveCSS('position', 'relative');
  for (const step of await steps.all()) {
    await step.scrollIntoViewIfNeeded();
    await expect(step.locator('dt')).toBeInViewport();
    await expect(step.locator('dd')).toBeVisible();
  }
});
