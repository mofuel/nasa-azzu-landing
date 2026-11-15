import {expect, test} from '@playwright/test';

test('orbital introduction stays centered and reverses with scroll', async ({page}, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(response.url());
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const title = page.getByRole('heading', {level: 1, includeHidden: true});
  const planet = page.locator('.earth-globe');
  const hero = page.locator('#tierra');
  await expect(title).toBeVisible();
  await expect(title).toBeInViewport({ratio: 1});
  const premise = page.locator('.hero-premise');
  await expect(premise).toBeInViewport({ratio: 1});
  await expect(premise).toHaveCSS('opacity', '1');
  await expect(planet).toBeInViewport();
  const startingTitle = await title.boundingBox();
  const startingPlanet = await planet.boundingBox();
  const width = page.viewportSize().width;
  const startingPremise = await premise.boundingBox();
  expect(startingPlanet.y).toBeGreaterThan(startingPremise.y + startingPremise.height);
  const copyCenterY = (startingTitle.y + startingPremise.y + startingPremise.height) / 2;
  expect(Math.abs(copyCenterY - page.viewportSize().height / 2)).toBeLessThan(2);
  for (const box of [startingTitle, startingPremise, startingPlanet]) {
    expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(2);
  }
  await page.screenshot({path: testInfo.outputPath('hero.png')});
  await page.evaluate(() => scrollTo(0, innerHeight * .46));
  expect(Math.abs((await title.boundingBox()).y - startingTitle.y)).toBeLessThan(2);
  await expect(page.locator('.hero-premise')).toBeInViewport({ratio: 1});
  expect(Math.abs((await planet.boundingBox()).y - startingPlanet.y)).toBeLessThan(2);
  await page.evaluate(() => scrollTo(0, innerHeight * 2.38));
  await expect.poll(async () => (await planet.boundingBox()).y).toBeLessThan(startingTitle.y);
  expect(Math.abs((await hero.boundingBox()).y)).toBeLessThan(2);
  expect((await title.boundingBox()).y).toBeLessThan(startingTitle.y);
  await expect(title).toBeHidden();
  await page.screenshot({path: testInfo.outputPath('approach.png')});
  await page.evaluate(() => scrollTo(0, innerHeight * 3.79));
  await expect.poll(async () => Number(await page.locator('.hero-landing').evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(.95);
  await page.screenshot({path: testInfo.outputPath('landing.png')});
  await page.evaluate(() => scrollTo(0, 0));
  await expect(title).toBeVisible();
  await expect.poll(async () => Math.abs((await planet.boundingBox()).y - startingPlanet.y)).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  expect(errors).toEqual([]);
});

test('chapter links open both surface records and the comparison', async ({page}, testInfo) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', {name: 'Capítulos'});
  for (const [chapter, label, id] of [['Luna', 'Explorar Lava Beds', 'lava'], ['Marte', 'Explorar Atacama', 'atacama']]) {
    await navigation.getByRole('link', {name: chapter, exact: true}).click();
    await expect(navigation.getByRole('link', {name: chapter, exact: true})).toHaveAttribute('aria-current', 'location');
    await page.getByRole('link', {name: label}).click();
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
    await expect(page.locator('#' + id + ' .field')).toHaveCSS('opacity', '1');
    await expect(page.locator('#' + id + ' h2')).toBeFocused();
    await page.screenshot({path: testInfo.outputPath(id + '.png')});
  }
  await navigation.getByRole('link', {name: 'Comparar'}).click();
  await expect(page.locator('#comparar h2')).toBeInViewport();
});

test('reduced motion keeps the records visible without pinning', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/#lava');
  await expect(page.locator('#lava .field')).toBeVisible();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});


test('lunar rock covers the outgoing view, reveals Lava Beds and reverses', async ({page}, testInfo) => {
  await page.goto('/');
  const scene = page.locator('#lava');
  const rock = scene.locator('.occlusion');
  const field = scene.locator('.field');
  const lunarSurface = page.locator('#luna');
  const landscape = scene.locator('.landscape');
  const title = scene.locator('.surface-transition');
  const phase = time => page.evaluate(time => scrollTo(0, innerHeight * 3.8 * time), time);

  await phase(1.27);
  await expect(lunarSurface.locator('.intro')).toHaveCSS('opacity', '1');
  await expect(landscape).toHaveCSS('visibility', 'hidden');

  await phase(1.51);
  await expect(title).toHaveCSS('opacity', '1');
  await expect(field).toHaveCSS('visibility', 'hidden');
  const cover = await rock.boundingBox();
  expect(cover.y + cover.height * .04).toBeLessThan(0);
  expect(cover.y + cover.height * .81).toBeGreaterThan(page.viewportSize().height);
  await page.screenshot({path: testInfo.outputPath('lunar-occlusion.png')});

  await phase(1.64);
  await expect.poll(async () => {
    const box = await rock.boundingBox();
    return Math.round(box.y + box.height * .81);
  }).toBeLessThan(page.viewportSize().height * .85);
  await expect(field).toHaveCSS('visibility', 'hidden');
  await page.screenshot({path: testInfo.outputPath('lava-reveal.png')});

  await phase(1.819);
  await expect.poll(() => field.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.98);
  await expect.poll(async () => {
    const box = await rock.boundingBox();
    return box.y + box.height;
  }).toBeLessThan(0);
  await phase(1.27);
  await expect(landscape).toHaveCSS('visibility', 'hidden');
  await expect(lunarSurface.locator('.intro')).toHaveCSS('opacity', '1');
  await expect(field).toHaveCSS('visibility', 'hidden');
});

test('the Moon fills the viewport before revealing the lunar landscape', async ({page}, testInfo) => {
  await page.goto('/');
  const moon = page.locator('.hero-moon');
  const earth = page.locator('.earth-globe');
  const landing = page.locator('.hero-landing');
  const height = page.viewportSize().height;
  const phase = async progress => {
    await page.evaluate(progress => scrollTo(0, innerHeight * 3.8 * progress), progress);
    await page.evaluate(async () => {
      const moon = document.querySelector('.hero-moon');
      let previous;
      let stableFrames = 0;
      while (stableFrames < 3) {
        await new Promise(requestAnimationFrame);
        const transform = moon.style.transform;
        stableFrames = transform === previous ? stableFrames + 1 : 0;
        previous = transform;
      }
    });
  };
  expect((await moon.boundingBox()).y).toBeGreaterThanOrEqual(height - 1);
  await phase(.48);
  await expect(moon).not.toBeInViewport();
  await phase(.55);
  const emerging = await moon.boundingBox();
  const initialEarth = await earth.boundingBox();
  expect(emerging.y).toBeLessThan(height);
  const visibleHeight = height - emerging.y;
  expect(visibleHeight / emerging.height).toBeGreaterThan(.12);
  expect(visibleHeight / emerging.height).toBeLessThan(.35);
  expect(emerging.x + emerging.width / 2).toBeLessThan(page.viewportSize().width * .25);
  expect(initialEarth.y).toBeLessThan(height * .35);
  expect(initialEarth.width).toBeGreaterThan(emerging.width * 9);
  await page.screenshot({path: testInfo.outputPath('moon-emerges.png')});
  await phase(.63);
  await expect(moon).toBeInViewport({ratio: .99});
  await phase(.74);
  const crossing = await moon.boundingBox();
  expect(crossing.y).toBeGreaterThan(height * .6);
  expect(crossing.x).toBeGreaterThan(emerging.x);
  expect(crossing.width).toBeGreaterThan(emerging.width);
  expect((await earth.boundingBox()).width).toBeGreaterThan(initialEarth.width);
  await expect(landing).toHaveCSS('opacity', '0');
  await page.screenshot({path: testInfo.outputPath('earth-moon-approach.png')});
  const width = page.viewportSize().width;
  expect(Math.abs(crossing.x + crossing.width / 2 - width / 2)).toBeLessThan(2);
  expect(Math.abs(crossing.y + crossing.height / 2 - height * .73)).toBeLessThan(2);
  const earthAtCenter = await earth.boundingBox();
  await phase(.835);
  const approaching = await moon.boundingBox();
  expect(approaching.width).toBeGreaterThan(crossing.width * 1.25);
  expect(approaching.x + approaching.width / 2).toBeLessThan(width * .48);
  expect((await earth.boundingBox()).x).toBeGreaterThan(earthAtCenter.x);
  await phase(.88);
  const lunarScan = page.getByRole('complementary', {name: 'Ficha orbital · Luna'});
  await expect(lunarScan.getByText('Lava Beds, California')).toBeInViewport({ratio: 1});
  expect((await moon.boundingBox()).width).toBeGreaterThan(height * .82);
  await page.screenshot({path: testInfo.outputPath('lunar-scan.png')});
  await phase(.951);
  const close = await moon.boundingBox();
  expect(close.width).toBeGreaterThan(Math.hypot(width, height) * 1.05);
  expect(Math.abs(close.y + close.height / 2 - height / 2)).toBeLessThan(2);
  expect(Math.abs(close.x + close.width / 2 - width / 2)).toBeLessThan(2);
  await expect(earth).toHaveCSS('visibility', 'hidden');
  await expect(landing).toHaveCSS('opacity', '0');
  await page.screenshot({path: testInfo.outputPath('moon-close-up.png')});
  await phase(.975);
  const blend = Number(await landing.evaluate(el => getComputedStyle(el).opacity));
  expect(blend).toBeGreaterThan(.25);
  expect(blend).toBeLessThan(.75);
  await expect(moon).toBeVisible();
  await phase(.998);
  await expect(lunarScan).toBeHidden();
  await expect(moon).toHaveCSS('visibility', 'hidden');
  await expect.poll(async () => Number(await landing.evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(.95);
  const lunarHeading = page.getByRole('heading', {name: 'Descenso lunar'});
  const navigation = page.getByRole('navigation', {name: 'Capítulos'});
  const arrival = await landing.boundingBox();
  expect(Math.abs(arrival.y)).toBeLessThan(2);
  await phase(1.17);
  await expect(lunarHeading).toBeInViewport();
  await expect(landing.locator('.lunar-intro')).toHaveCSS('opacity', '1');
  await expect(navigation.getByRole('link', {name: 'Luna', exact: true})).toHaveAttribute('aria-current', 'location');
  expect(Math.abs((await landing.boundingBox()).y - arrival.y)).toBeLessThan(2);
  await page.screenshot({path: testInfo.outputPath('lunar-descent.png')});
  await phase(.48);
  expect((await moon.boundingBox()).y).toBeGreaterThanOrEqual(height - 1);
});



test('the cave closes, reveals the lunar terrain and leads to Mars', async ({page}, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.pin-spacer > #tierra')).toBeAttached();
  const sites = page.locator('#casos');
  const cave = page.locator('.cave-passage');
  const leftWall = cave.locator('.cave-wall-left');
  const rightWall = cave.locator('.cave-wall-right');
  const lavaLandscape = page.locator('#lava .landscape');
  const terrain = cave.locator('.cave-terrain');
  const moon = cave.locator('.cave-moon');
  const phase = time => page.evaluate(time => scrollTo(0, innerHeight * 3.8 * time), time);

  await phase(1.90);
  await expect(cave).toBeHidden();
  await expect(page.locator('#lava .field')).toHaveCSS('opacity', '1');

  const leftStart = (await leftWall.boundingBox()).x;
  const rightStart = (await rightWall.boundingBox()).x;
  await phase(1.995);
  await expect.poll(() => leftWall.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.8);
  expect(Math.abs((await leftWall.boundingBox()).x - leftStart)).toBeLessThan(2);
  expect(Math.abs((await rightWall.boundingBox()).x - rightStart)).toBeLessThan(2);
  await page.screenshot({path: testInfo.outputPath('cave-aligned.png')});
  await phase(2.10);
  await expect.poll(async () => (await leftWall.boundingBox()).x).toBeGreaterThan(leftStart + 30);
  expect((await rightWall.boundingBox()).x).toBeLessThan(rightStart - 30);
  for (const wall of [leftWall, rightWall]) {
    expect(await wall.evaluate(el => el.getBoundingClientRect().width / el.offsetWidth)).toBeCloseTo(1, 2);
  }
  await expect.poll(() => lavaLandscape.evaluate(el => el.getBoundingClientRect().width / el.offsetWidth)).toBeLessThan(.96);
  await page.screenshot({path: testInfo.outputPath('cave-pullback.png')});

  await phase(2.20);
  await expect(cave.locator('.cave-shadow')).toHaveCSS('opacity', '1');
  await expect(page.locator('#lava .landscape')).toBeHidden();

  await phase(2.31);
  const eyelids = cave.locator('.lunar-eyelids');
  await expect(eyelids).toBeVisible();
  await expect.poll(() => eyelids.evaluate(el => Number(getComputedStyle(el).getPropertyValue('--lid-cover')))).toBeLessThan(.7);
  await expect(leftWall).toBeHidden();
  await expect(rightWall).toBeHidden();
  await page.screenshot({path: testInfo.outputPath('lunar-eyes-opening.png')});

  await phase(2.417);
  await expect(terrain).toHaveCSS('opacity', '1');
  await expect(cave.locator('.cave-shadow')).toBeHidden();
  await page.screenshot({path: testInfo.outputPath('cave-lunar-reveal.png')});

  await phase(2.65);
  await expect(moon).toBeVisible();
  await expect.poll(() => moon.evaluate(el => el.getBoundingClientRect().width / el.offsetWidth)).toBeLessThan(.8);
  await expect(sites).toBeHidden();

  const marsPlanet = page.locator('#marte .planet');
  const marsPosition = async () => {
    const {x, width} = await marsPlanet.boundingBox();
    return {center: x + width / 2, width};
  };
  const screenCenter = page.viewportSize().width / 2;
  await phase(2.90);
  await expect.poll(async () => Math.abs((await marsPosition()).center - screenCenter)).toBeLessThan(3);
  const centeredMars = await marsPosition();
  await expect(moon).toBeHidden();
  await phase(3.01);
  await expect(page.getByRole('heading', {name: /Huellas en el desierto/})).toBeInViewport();
  await expect.poll(async () => (await marsPosition()).width).toBeGreaterThan(centeredMars.width * 1.5);
  expect((await marsPosition()).center).toBeGreaterThan(screenCenter);
  const marsScan = page.getByRole('complementary', {name: 'Ficha orbital · Marte'});
  await expect(marsScan.getByText('Atacama, Chile')).toBeInViewport({ratio: 1});
  await page.screenshot({path: testInfo.outputPath('mars-scan.png')});
  await phase(1.90);
  await expect(cave).toBeHidden();
  await expect(page.locator('#lava .field')).toHaveCSS('opacity', '1');

  await page.goto('/#casos');
  await expect(sites.getByRole('heading', {name: /De buscar refugio/})).toBeInViewport();
});
