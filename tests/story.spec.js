import {expect, test} from '@playwright/test';

test('orbital introduction stays centered and reverses with scroll', async ({page}, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(response.url());
  });
  await page.goto('/');
  await expect(page.locator('#loading-screen')).toHaveCount(0, {timeout: 12000});
  await page.evaluate(() => document.fonts.ready);
  const title = page.getByRole('heading', {level: 1, includeHidden: true});
  const planet = page.locator('.earth-globe');
  const hero = page.locator('#tierra');
  await expect(title).toBeVisible();
  await expect(title).toBeInViewport({ratio: .99});
  const premise = page.locator('.hero-premise');
  const atlasLink = hero.getByRole('link', {name: 'Abrir el Atlas'});
  await expect(atlasLink).toBeInViewport();
  await expect(atlasLink).toHaveAttribute('href', 'https://nasa.azzu.tech/atlas/');
  await expect(premise).toBeInViewport({ratio: .99});
  await expect(premise).toHaveCSS('opacity', '1');
  await expect(planet).toBeInViewport();
  const startingTitle = await title.boundingBox();
  const startingPlanet = await planet.boundingBox();
  const heroBox = await hero.boundingBox();
  const heroCenterX = heroBox.x + heroBox.width / 2;
  const startingPremise = await premise.boundingBox();
  const button = await atlasLink.boundingBox();
  expect(startingPlanet.y).toBeGreaterThan(button.y + button.height);
  const copyCenterY = (startingTitle.y + button.y + button.height) / 2;
  expect(Math.abs(copyCenterY - page.viewportSize().height / 2)).toBeLessThan(2);
  for (const box of [startingTitle, startingPremise, startingPlanet, button]) {
    expect(Math.abs(box.x + box.width / 2 - heroCenterX)).toBeLessThan(2);
  }
  await page.screenshot({path: testInfo.outputPath('hero.png')});
  await page.evaluate(() => scrollTo(0, innerHeight * .04));
  await expect.poll(async () => (await planet.boundingBox()).y).toBeLessThan(startingPlanet.y - 2);
  await expect.poll(async () => (await title.boundingBox()).y).toBeLessThan(startingTitle.y - 1);
  await expect(premise).toBeInViewport({ratio: .99});
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
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  expect(errors).toEqual([]);
});

test('chapter links open both surfaces and the return to orbit reveals the Atlas', async ({page}, testInfo) => {
  for (const [chapter, label, id, caption] of [
    ['luna', 'Explorar Lava Beds', 'lava', '.field'],
    ['marte', 'Descender a Marte', 'suelo-marciano', '.mars-ground-caption']
  ]) {
    await page.goto('/#' + chapter);
    await page.getByRole('link', {name: label}).click();
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
    await expect(page.locator('#' + id + ' ' + caption)).toHaveCSS('opacity', '1');
    await expect(page.locator('#' + id + ' h2')).toBeFocused();
    await page.screenshot({path: testInfo.outputPath(id + '.png')});
  }
  await expect(page.getByText('Soy Curiosity.', {exact: true})).toBeInViewport();
  await expect(page.getByRole('img', {name: /Modelo del rover Curiosity/})).toBeInViewport();
  const phase = time => page.evaluate(time => scrollTo(0, innerHeight * 3.8 * time), time);
  await expect(page.locator('#atacama')).toBeHidden();
  const surfaceAt = y => page.evaluate(y => {
    const hit = document.elementsFromPoint(innerWidth * .5, innerHeight * y)
      .find(el => el.matches('.mars-passage-rock') || el.closest('.surface'));
    return hit?.matches('.mars-passage-rock') ? 'rock' : hit?.closest('.surface')?.id;
  }, y);
  await phase(3.76);
  await expect.poll(() => surfaceAt(.75)).toBe('rock');
  await expect.poll(() => surfaceAt(.25)).toBe('suelo-marciano');
  await expect.poll(() => surfaceAt(.97)).toBe('rock');
  await expect(page.locator('#suelo-marciano')).toHaveCSS('opacity', '1');
  const rock = page.locator('.mars-passage-rock');
  await page.screenshot({path: testInfo.outputPath('montesharp-to-rock.png')});
  await phase(3.89);
  await expect(page.getByText('De Marte a Atacama', {exact: true})).toHaveCSS('opacity', '1');
  await page.screenshot({path: testInfo.outputPath('mars-transition-title.png')});
  await phase(4);
  await expect.poll(() => surfaceAt(.75)).toBe('atacama');
  await expect.poll(() => surfaceAt(.25)).toBe('rock');
  await expect(page.locator('#suelo-marciano')).toBeHidden();
  await page.screenshot({path: testInfo.outputPath('mars-to-atacama.png')});
  await phase(3.56);
  await expect.poll(() => surfaceAt(.75)).toBe('suelo-marciano');
  await expect(page.locator('#atacama')).toBeHidden();
  await phase(4.16);
  await expect(page.locator('#suelo-marciano')).toBeHidden();
  await expect(rock).not.toBeInViewport();
  await expect(page.getByRole('heading', {name: 'Desierto de Atacama'})).toBeVisible();
  await expect(page.locator('#atacama .field')).toHaveCSS('opacity', '1');
  const orbit = page.locator('.atacama-orbit');
  for (const time of [4.36, 4.42, 4.50]) {
    await phase(time);
    await expect(orbit).toHaveCSS('opacity', '1');
    await expect(page.locator('#atacama .landscape')).toBeHidden();
    await expect(page.locator('#atacama .surface-foreground')).toBeHidden();
    await page.screenshot({path: testInfo.outputPath(`departure-${time}.png`)});
  }
  await phase(4.63);
  await expect(orbit).toHaveCSS('opacity', '1');
  await expect(page.locator('#atacama .field')).toBeHidden();
  const atlasIntro = page.locator('.atlas-intro');
  await expect(atlasIntro.locator('h2')).toBeHidden();
  await phase(4.64);
  await expect(atlasIntro.locator('h2')).toBeHidden();
  await expect.poll(async () => {
    const box = await orbit.locator('img').boundingBox();
    return box.y + box.height;
  }).toBeLessThan(page.viewportSize().height * .23);
  await page.screenshot({path: testInfo.outputPath('before-atlas-entry.png')});
  await phase(4.78);
  await expect.poll(() => atlasIntro.locator('h2').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.4);
  await expect(atlasIntro.locator('h2')).toBeInViewport({ratio: .99});
  const enteringY = await atlasIntro.locator('h2').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42);
  await phase(5.32);
  await expect.poll(() => atlasIntro.locator('h2').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42)).toBeLessThan(enteringY);
  await expect(atlasIntro.getByRole('link', {name: 'Abrir el Atlas'})).toBeInViewport();
  await page.screenshot({path: testInfo.outputPath('atacama-orbit.png')});
  await phase(4.16);
  await expect(page.locator('#atacama .landscape')).toHaveCSS('opacity', '1');
  await expect(atlasIntro.locator('h2')).toBeHidden();
  const atlas = page.locator('#comparar');
  await atlas.locator('.atlas-preview').scrollIntoViewIfNeeded();
  await expect(atlas.locator('.atlas-preview img')).toBeInViewport();
  await expect(atlasIntro.getByRole('link', {name: 'Abrir el Atlas', includeHidden: true}))
    .toHaveAttribute('href', 'https://nasa.azzu.tech/atlas/');
  await expect(atlas.locator('.atlas-variables dt')).toHaveCount(3);
});

test('the NASA logo draws before revealing the landing', async ({page}, testInfo) => {
  await page.addInitScript(() => {
    document.addEventListener('animationstart', event => {
      if (event.animationName !== 'dismiss-loading-screen') return;
      event.target.getAnimations().find(animation => animation.animationName === event.animationName).pause();
    });
  });
  await page.goto('/', {waitUntil: 'commit'});
  const screen = page.locator('#loading-screen');
  await expect(screen).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  const firstStroke = screen.locator('svg path').first();
  await expect(firstStroke).toHaveAttribute('pathLength', '1', {timeout: 15000});
  const spark = screen.locator('.logo-spark').first();
  await expect(spark).toHaveAttribute('transform', /^translate\(/);
  const initialSparkPosition = await spark.getAttribute('transform');
  await expect(spark).not.toHaveAttribute('transform', initialSparkPosition);
  await expect(firstStroke).toHaveCSS('stroke', 'rgb(255, 255, 255)');
  const track = screen.locator('.loading-track');
  await expect(track).toBeVisible();
  expect(await track.evaluate(el => getComputedStyle(el, '::before').backgroundColor)).toBe('rgb(255, 255, 255)');
  const initialTrackPosition = await track.boundingBox();
  const initialLogoPosition = await screen.locator('svg').boundingBox();
  const trackDuration = await track.evaluate(el => getComputedStyle(el, '::before').animationDuration);
  await expect(firstStroke).toHaveCSS('animation-duration', `${trackDuration}, 0.42s`);
  await expect(page.locator('#root')).toHaveAttribute('inert', '');
  await expect(firstStroke).toHaveCSS('fill-opacity', '1', {timeout: 3500});
  expect(await track.boundingBox()).toEqual(initialTrackPosition);
  expect(await screen.locator('svg').boundingBox()).toEqual(initialLogoPosition);
  await page.screenshot({path: testInfo.outputPath('nasa-loader.png'), animations: 'allow'});
  await screen.evaluate(el => el.getAnimations().find(animation => animation.animationName === 'dismiss-loading-screen').finish());
  await expect(screen).toHaveCount(0);
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'none');
  await expect(page.getByRole('heading', {name: 'AZZU', exact: true})).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Capítulos'})).toHaveCount(0);
});

test('reduced motion keeps the records visible without pinning', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/#lava');
  await expect(page.locator('#loading-screen')).toHaveCount(0);
  await expect(page.locator('#lava .field')).toBeVisible();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});


test('lunar rock covers the outgoing view, reveals Lava Beds and reverses', async ({page}, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#loading-screen')).toHaveCount(0, {timeout: 12000});
  const scene = page.locator('#lava');
  const rock = scene.locator('.occlusion');
  const field = scene.locator('.field');
  const lunarSurface = page.locator('.hero-landing');
  const landscape = scene.locator('.landscape');
  const title = scene.locator('.surface-transition');
  const phase = time => page.evaluate(time => scrollTo(0, innerHeight * 3.8 * time), time);

  await phase(1.27);
  await expect(lunarSurface).toHaveCSS('opacity', '1');
  await expect(landscape).toHaveCSS('visibility', 'hidden');

  await phase(1.445);
  await expect(title).toHaveCSS('opacity', '1');
  await expect(field).toHaveCSS('visibility', 'hidden');
  const cover = await rock.boundingBox();
  expect(cover.y + cover.height * .04).toBeLessThan(0);
  expect(cover.y + cover.height * .81).toBeGreaterThan(page.viewportSize().height);
  await page.screenshot({path: testInfo.outputPath('lunar-occlusion.png')});

  await phase(1.57);
  await expect.poll(async () => {
    const box = await rock.boundingBox();
    return Math.round(box.y + box.height * .81);
  }).toBeLessThan(page.viewportSize().height * .85);
  await expect(field).toHaveCSS('visibility', 'hidden');
  await page.screenshot({path: testInfo.outputPath('lava-reveal.png')});

  await phase(1.819);
  await expect.poll(() => field.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.98);
  const card = await field.boundingBox();
  expect(card.width).toBeLessThanOrEqual(410);
  expect(card.width).toBeGreaterThan(Math.min(350, page.viewportSize().width * .8));
  await expect(field).toBeInViewport({ratio: .99});
  expect(card.x + card.width / 2).toBeGreaterThanOrEqual(page.viewportSize().width / 2 - 1);
  await page.screenshot({path: testInfo.outputPath('lava-card.png')});
  await expect.poll(async () => {
    const box = await rock.boundingBox();
    return box.y + box.height;
  }).toBeLessThan(0);
  await phase(1.27);
  await expect(landscape).toHaveCSS('visibility', 'hidden');
  await expect(lunarSurface).toHaveCSS('opacity', '1');
  await expect(field).toHaveCSS('visibility', 'hidden');
});

test('the Moon fills the viewport before revealing the lunar landscape', async ({page}, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#loading-screen')).toHaveCount(0, {timeout: 12000});
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
  const lunarScan = page.getByRole('complementary', {name: 'Ficha orbital · Luna'});
  await phase(.829);
  await expect(earth).toBeVisible();
  await expect(lunarScan).toBeHidden();
  await phase(.878);
  await expect(earth).toBeHidden();
  await expect(lunarScan.getByRole('heading', {name: 'Un hogar bajo la Luna'})).toBeInViewport({ratio: .99});
  await expect(lunarScan.getByText('Lava Beds, California')).toBeInViewport({ratio: .99});
  if (width > 700) {
    const silhouetteRight = await moon.evaluate(el => {
      const bounds = el.getBoundingClientRect();
      const {a, b} = new DOMMatrix(getComputedStyle(el).transform);
      return bounds.x + (bounds.width + el.offsetWidth * Math.hypot(a, b)) / 2;
    });
    const card = await lunarScan.locator('.lunar-scan-card').boundingBox();
    expect(silhouetteRight).toBeLessThan(card.x - 15);
  }
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
  const arrival = await landing.boundingBox();
  expect(Math.abs(arrival.y)).toBeLessThan(2);
  await phase(1.06);
  const location = landing.locator('.lunar-location');
  await expect(location).toContainText('Luna');
  await expect(location).toBeInViewport();
  const locationBox = await location.boundingBox();
  expect(locationBox.y).toBeLessThan(height * .25);
  expect(locationBox.x).toBeGreaterThan(width * .5);
  await expect(lunarScan).toBeHidden();
  expect(Math.abs((await landing.boundingBox()).y - arrival.y)).toBeLessThan(2);
  await page.screenshot({path: testInfo.outputPath('lunar-descent.png')});
  await phase(1.23);
  await expect.poll(async () => (await landing.boundingBox()).y).toBeLessThan(arrival.y - 20);
  await phase(.48);
  expect((await moon.boundingBox()).y).toBeGreaterThanOrEqual(height - 1);
});



test('leaving Lava Beds follows the published Moon departure before Mars', async ({page}, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#loading-screen')).toHaveCount(0, {timeout: 12000});
  await expect(page.locator('.pin-spacer > #tierra')).toBeAttached();
  const cave = page.locator('.cave-passage');
  const leftWall = cave.locator('.cave-wall-left');
  const rightWall = cave.locator('.cave-wall-right');
  const lavaLandscape = page.locator('#lava .landscape');
  const moon = page.locator('.departure-moon');
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
  await phase(2.02);
  await expect(moon).toBeVisible();
  const initialMoonWidth = (await moon.boundingBox()).width;
  await phase(2.10);
  await expect(moon).toBeVisible();
  await expect.poll(async () => (await moon.boundingBox()).width).toBeLessThan(initialMoonWidth * .98);
  await expect.poll(async () => (await leftWall.boundingBox()).x).toBeGreaterThan(leftStart + 30);
  expect((await rightWall.boundingBox()).x).toBeLessThan(rightStart - 30);
  for (const wall of [leftWall, rightWall]) {
    expect(await wall.evaluate(el => el.getBoundingClientRect().width / el.offsetWidth)).toBeCloseTo(1, 2);
  }
  await expect.poll(() => lavaLandscape.evaluate(el => el.getBoundingClientRect().width / el.offsetWidth)).toBeLessThan(.98);
  await page.screenshot({path: testInfo.outputPath('cave-pullback.png')});

  await phase(2.30);
  await expect(moon).toBeVisible();
  await expect.poll(() => lavaLandscape.evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.65);
  await expect(lavaLandscape).toBeVisible();
  expect(await lavaLandscape.evaluate(el => {
    const {top, right, bottom, left} = el.getBoundingClientRect();
    return top <= 0 && right >= innerWidth && bottom >= innerHeight && left <= 0;
  })).toBe(true);
  await page.screenshot({path: testInfo.outputPath('cave-to-moon.png')});

  await phase(2.425);
  await expect(cave).toBeHidden();
  await expect(lavaLandscape).toBeHidden();
  await expect(page.locator('.hero-landing')).toBeHidden();
  await expect(moon).toBeVisible();
  await expect.poll(async () => (await moon.boundingBox()).width).toBeLessThan(initialMoonWidth * .5);
  const departure = await moon.boundingBox();
  await page.screenshot({path: testInfo.outputPath('lunar-departure.png')});

  await phase(2.65);
  await expect.poll(async () => (await moon.boundingBox()).width).toBeLessThan(departure.width * .65);
  const distantMoon = await moon.boundingBox();
  await phase(2.79);
  await expect.poll(async () => {
    const current = await moon.boundingBox();
    return current.y + current.height / 2;
  }).toBeLessThan(distantMoon.y + distantMoon.height / 2 - page.viewportSize().height * .10);
  await expect.poll(async () => {
    const current = await moon.boundingBox();
    return current.x + current.width / 2;
  }).toBeLessThan(departure.x + departure.width / 2 - page.viewportSize().width * .12);

  const marsPlanet = page.locator('#marte .planet');
  const marsPosition = async () => {
    const {x, y, width, height} = await marsPlanet.boundingBox();
    return {center: x + width / 2, centerY: y + height / 2, width};
  };
  const screenCenter = page.viewportSize().width / 2;
  await phase(2.80);
  await expect(marsPlanet).toBeInViewport({ratio: .1});
  const enteringMars = await marsPosition();
  expect(enteringMars.center).toBeGreaterThan(screenCenter * 1.5);
  await page.screenshot({path: testInfo.outputPath('mars-entry.png')});
  await phase(2.90);
  await expect.poll(async () => Math.abs((await marsPosition()).center - screenCenter)).toBeLessThan(3);
  const centeredMars = await marsPosition();
  expect(centeredMars.centerY).toBeGreaterThan(enteringMars.centerY + 20);
  await expect(moon).toBeHidden();
  await phase(3.01);
  await expect(page.getByRole('heading', {name: 'Rumbo a Marte, desde la Tierra'})).toBeInViewport();
  await expect.poll(async () => (await marsPosition()).width).toBeGreaterThan(centeredMars.width * 1.5);
  expect((await marsPosition()).center).toBeGreaterThan(screenCenter);
  const marsScan = page.getByRole('complementary', {name: 'Ficha orbital · Marte'});
  await expect(marsScan.getByText('Atacama, Chile')).toBeInViewport({ratio: 1});
  await page.screenshot({path: testInfo.outputPath('mars-scan.png')});
  await phase(1.90);
  await expect(cave).toBeHidden();
  await expect(page.locator('#lava .field')).toHaveCSS('opacity', '1');

  await page.goto('/#casos');
  await expect(page.getByRole('navigation', {name: 'Casos de campo'})).toBeInViewport();
});
