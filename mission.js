import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {startStarfield} from './starfield.js';
gsap.registerPlugin(ScrollTrigger);

export function setupStory(root) {
  const sceneLabels = {
    '#luna': 'lunarReading', '#lava': 'lavaReading', '#marte': 'marsReading',
    '#suelo-marciano': 'marsGroundReading', '#atacama': 'atacamaReading'
  };
  let landingTimeline;
  let lenis;
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const hero = root.querySelector('.earth');
    const stopStarfield = startStarfield(hero.querySelector('.hero-stars canvas'));
    const select = gsap.utils.selector(hero);
    const moon = hero.querySelector('.hero-moon');
    const lunarScan = hero.querySelector('.lunar-scan');
    const centerX = () => (hero.clientWidth - moon.offsetWidth) / 2 - moon.offsetLeft;
    const lowerCenterY = () => hero.clientHeight * .73 - moon.offsetHeight / 2 - moon.offsetTop;
    const nearMoon = {x: centerX, y: lowerCenterY, scale: 1.22, rotation: -18};
    const scannedMoon = {
      x: () => centerX() - hero.clientWidth * .19,
      y: () => lowerCenterY() + hero.clientHeight * .035,
      scale: () => {
        const diameter = hero.clientHeight * .82;
        return (hero.clientWidth > 700 ? Math.min(diameter, hero.clientWidth * .48) : diameter) / moon.offsetWidth;
      },
      rotation: -21
    };
    const landingMoon = {
      x: centerX, y: () => lowerCenterY() - hero.clientHeight * .23,
      scale: () => Math.hypot(hero.clientWidth, hero.clientHeight) * 1.1 / moon.offsetWidth,
      rotation: -21
    };
    const lunarFlight = [
      [.49, {x: 0, y: 0, scale: .67, rotation: 0}],
      [.55, {x: 0, y: () => -moon.offsetHeight * .33, scale: .67, rotation: 0}],
      [.63, {x: 0, y: () => -hero.clientHeight * .16, scale: .93, rotation: -7}],
      [.69, {x: () => centerX() * .52, y: () => lowerCenterY() - hero.clientHeight * .025,
        scale: 1.16, rotation: -14}, 'sine.out'],
      [.74, nearMoon, 'sine.inOut'],
      [.855, scannedMoon, 'sine.inOut'],
      [.909, scannedMoon],
      [.95, landingMoon, 'sine.inOut'],
      [.997, {...landingMoon, scale: () => Math.hypot(hero.clientWidth, hero.clientHeight) * 1.23 / moon.offsetWidth}]
    ];
    const lunarArrival = lunarFlight.at(-1)[0];
    const landing = hero.querySelector('.lunar-surface');
    const lava = hero.querySelector('#lava');
    const rock = lava.querySelector('.occlusion');
    const lavaView = lava.querySelector('.landscape');
    const transitionTitle = lava.querySelector('.surface-transition');
    const lavaDetails = lava.querySelector('.field');
    const cave = hero.querySelector('.cave-passage');
    const caveWalls = [...cave.querySelectorAll('.cave-wall')];
    const departureMoon = hero.querySelector('.departure-moon');
    const mars = hero.querySelector('#marte');
    const marsPlanet = mars.querySelector('.planet');
    const marsScan = mars.querySelector('.mars-scan');
    const marsIntro = mars.querySelector('.intro');
    const marsGround = hero.querySelector('.mars-ground');
    const marsLandscape = marsGround.querySelector('.landscape');
    const marsForeground = marsGround.querySelector('.surface-foreground');
    const marsCaption = marsGround.querySelector('.mars-ground-caption');
    const marsRover = marsGround.querySelector('.mars-rover');
    const atacama = hero.querySelector('#atacama');
    const marsRock = atacama.querySelector('.mars-passage-rock');
    const atacamaLandscape = atacama.querySelector('.landscape');
    const atacamaForeground = atacama.querySelector('.surface-foreground');
    const atacamaField = atacama.querySelector('.field');
    const orbit = atacama.querySelector('.atacama-orbit');
    const departingMars = orbit.querySelector('img');
    const journeyEnd = 4.83;
    landingTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero, pin: true, start: 'top top',
        end: () => '+=' + hero.clientHeight * 3.8 * journeyEnd,
        scrub: .25, invalidateOnRefresh: true
      },
      defaults: {ease: 'none'}
    })
      .to(select('.hero-title'), {y: () => -hero.clientHeight * .045, duration: .18}, 0)
      .to(select('.earth-globe'), {y: () => -hero.clientHeight * .12, scale: 1.04, duration: .14}, 0)
      .to(select('.hero-title'), {y: () => -hero.clientHeight * .3, duration: .52}, .18)
      .to(select('.hero-title'), {autoAlpha: 0, duration: .10, ease: 'sine.inOut'}, .34)
      .to(select('.earth-globe'), {y: () => -hero.clientHeight * 1.13, scale: 1.42, duration: .60, ease: 'power1.out'}, .14)
      .fromTo(lunarScan, {autoAlpha: 0}, {autoAlpha: 1, duration: .018}, .843)
      .addLabel('lunarReading', .878)
      .to(lunarScan, {autoAlpha: 0, duration: .015}, .889)
      .to(select('.earth-globe'), {autoAlpha: 0, duration: .072, ease: 'sine.inOut'}, .768)
      .to(select('.earth-globe'), {x: () => hero.clientWidth * .12, duration: .35, ease: 'sine.inOut'}, .39)
      .to(select('.earth-globe'), {x: () => hero.clientWidth * 1.06, duration: .114, ease: 'sine.inOut'}, .74)
      .to(select('.earth-globe'), {y: () => -hero.clientHeight * 1.43, scale: 1.13, duration: .18, ease: 'sine.in'}, .74)
      .fromTo(landing, {autoAlpha: 0}, {autoAlpha: 1, duration: .044, ease: 'sine.inOut'}, .953)
      .set(moon, {autoAlpha: 0}, lunarArrival)
      .set([lavaView, lavaDetails, transitionTitle],
        {autoAlpha: 0}, 0)
      .fromTo(rock, {yPercent: 86}, {yPercent: 3, duration: .385}, 1.065)
      .to(landing, {yPercent: -100, duration: .355}, 1.095)
      .set(lavaView, {autoAlpha: 1}, 1.44)
      .to(transitionTitle, {autoAlpha: 1, duration: .035}, 1.403)
      .to(rock, {yPercent: -110, duration: .24}, 1.45)
      .to(transitionTitle, {yPercent: -175, autoAlpha: 0, duration: .13}, 1.47)
      .fromTo(lavaView, {yPercent: 5, scale: 1.08},
        {yPercent: -2, scale: 1, duration: .28}, 1.45)
      .fromTo(lavaDetails, {y: 24, autoAlpha: 0},
        {y: 0, autoAlpha: 1, duration: .10}, 1.63)
      .addLabel('lavaReading', 1.75)
      .set([cave, departureMoon, mars, marsIntro, marsScan], {autoAlpha: 0}, 0)
      .to(lavaDetails, {y: -28, autoAlpha: 0, duration: .12}, 1.94)
      .set(cave, {autoAlpha: 1}, 1.96)
      .fromTo(caveWalls, {x: 0, autoAlpha: 0}, {autoAlpha: 1, duration: .04}, 1.96)
      .to(caveWalls, {
        x: (index, wall) => wall.offsetHeight * (index === 0 ? .60 : -.60),
        duration: .19, ease: 'sine.inOut'
      }, 2.00)
      .to(lavaView, {scale: .86, duration: .13, ease: 'sine.inOut'}, 2.06)
      .set(landing, {autoAlpha: 0}, 2.08)
      .set(departureMoon, {
        autoAlpha: 1, scale: () => Math.hypot(hero.clientWidth, hero.clientHeight) * 1.25 / departureMoon.offsetWidth
      }, 2.07)
      .to([lavaView, caveWalls], {autoAlpha: 0, duration: .35, ease: 'sine.inOut'}, 2.07)
      .set(cave, {autoAlpha: 0}, 2.42)
      .to(departureMoon, {scale: .52, y: () => hero.clientHeight * .15, duration: .27, ease: 'sine.inOut'}, 2.42)
      .to(departureMoon, {x: () => -hero.clientWidth * .5 - departureMoon.offsetWidth * .3,
        duration: .24, ease: 'sine.inOut'}, 2.63)
      .to(departureMoon, {y: () => -hero.clientHeight * .55, duration: .24, ease: 'power2.in'}, 2.63)
      .to(departureMoon, {scale: .07, duration: .18, ease: 'sine.out'}, 2.69)
      .set(departureMoon, {autoAlpha: 0}, 2.87)
      .set(mars, {autoAlpha: 1}, 2.69)
      .fromTo(marsPlanet, {x: () => hero.clientWidth * .70, scale: .65},
        {x: 0, duration: .21, ease: 'sine.inOut'}, 2.69)
      .fromTo(marsPlanet, {y: () => -hero.clientHeight * .68},
        {y: () => hero.clientHeight * .10, duration: .21, ease: 'power2.out'}, 2.69)
      .to(marsPlanet, {x: () => hero.clientWidth * .22, y: () => hero.clientHeight * .30, scale: 1.42,
        duration: .08, ease: 'sine.inOut'}, 2.92)
      .to(marsIntro, {autoAlpha: 1, duration: .08}, 2.92)
      .to(marsScan, {autoAlpha: 1, duration: .05}, 2.95)
      .addLabel('marsReading', 3.00)
      .to([marsIntro, marsScan], {autoAlpha: 0, duration: .055}, 3.04)
      .to(marsPlanet, {
        x: () => -hero.clientWidth * .12, y: 0,
        scale: () => Math.hypot(hero.clientWidth, hero.clientHeight) * 1.35 / marsPlanet.offsetWidth,
        duration: .16, ease: 'power1.in'
      }, 3.04)
      .fromTo(marsGround, {autoAlpha: 0}, {autoAlpha: 1, duration: .22, ease: 'sine.inOut'}, 3.12)
      .set(mars, {autoAlpha: 0}, 3.34)
      .fromTo(marsLandscape, {scale: 1.24, yPercent: -7}, {scale: 1, yPercent: 0, duration: .46, ease: 'sine.out'}, 3.12)
      .fromTo(marsForeground, {scale: 1.28, yPercent: 68}, {scale: 1, yPercent: -6, duration: .42, ease: 'power1.out'}, 3.19)
      .fromTo(marsCaption, {autoAlpha: 0}, {autoAlpha: 1, duration: .12}, 3.35)
      .fromTo(marsRover, {y: 24, autoAlpha: 0}, {y: 0, autoAlpha: 1, duration: .14, ease: 'power1.out'}, 3.35)
      .addLabel('marsGroundReading', 3.56)
      .to(marsCaption, {autoAlpha: 0, duration: .10}, 3.64)
      .set(atacama, {autoAlpha: 0}, 0)
      .set(atacama, {autoAlpha: 1}, 3.64)
      .set(marsGround, {'--mars-feather': '7%'}, 3.64)
      .to(marsGround, {yPercent: -100, duration: .24}, 3.64)
      .fromTo(marsRock, {y: () => hero.clientHeight}, {y: 0, duration: .24}, 3.64)
      .set(marsGround, {autoAlpha: 0}, 3.88)
      .to(marsRock, {y: () => -hero.clientHeight * 1.36, duration: .24}, 3.88)
      .fromTo(atacamaLandscape, {yPercent: 13, scale: 1.14}, {yPercent: -3, scale: 1, duration: .28, ease: 'sine.out'}, 3.88)
      .fromTo(atacamaForeground, {yPercent: 48, xPercent: 10, scale: 1.13},
        {yPercent: -8, xPercent: 0, scale: 1, duration: .28, ease: 'power1.out'}, 3.88)
      .fromTo(atacamaField, {y: 20, autoAlpha: 0}, {y: 0, autoAlpha: 1, duration: .13}, 4.01)
      .addLabel('atacamaReading', 4.16)
      .to(atacamaField, {y: 30, autoAlpha: 0, duration: .15}, 4.21)
      .to([atacamaLandscape, atacamaForeground], {yPercent: 32, duration: .32, ease: 'power1.in'}, 4.22)
      .fromTo(orbit, {autoAlpha: 0}, {autoAlpha: 1, duration: .25, ease: 'sine.inOut'}, 4.27)
      .fromTo(departingMars, {
        scale: () => Math.hypot(hero.clientWidth, hero.clientHeight) * 1.55 / departingMars.offsetWidth,
        yPercent: 52
      }, {scale: .3, yPercent: -60, duration: .55, ease: 'power2.out'}, 4.27)
      .to(departingMars, {autoAlpha: 0, duration: .11}, journeyEnd - .11);

    for (let i = 1; i < lunarFlight.length; i++) {
      const [start, from] = lunarFlight[i - 1];
      const [end, to, ease = 'none'] = lunarFlight[i];
      const duration = end - start;
      landingTimeline.fromTo(moon, from, {...to, duration, ease, immediateRender: false}, start);
    }

    const atlas = root.querySelector('#comparar');
    const preview = atlas.querySelector('.atlas-preview');
    gsap.timeline({
      scrollTrigger: {trigger: atlas, start: 'top 97%', end: 'top 12%', scrub: .25}
    })
      .from(atlas.querySelector('.atlas-intro'), {y: 35, scale: .96, opacity: .3, duration: .55}, 0)
      .from(preview, {y: 62, scale: .84, rotateX: 16, transformPerspective: 950, opacity: .22, duration: .75}, .2);
    const variables = atlas.querySelector('.atlas-variables');
    gsap.from(variables.children, {
      y: 26, opacity: .45, stagger: .12,
      scrollTrigger: {trigger: variables, start: 'top 95%', end: 'top 63%', scrub: .25}
    });

    const scroller = new Lenis({autoRaf: true, lerp: .12, naiveDimensions: true, stopInertiaOnNavigate: true});
    scroller.on('scroll', ScrollTrigger.update);
    lenis = scroller;

    return () => {
      stopStarfield();
      scroller.destroy();
      lenis = null;
      landingTimeline = null;
    };
  }, root);

  function jumpToScroll(position) {
    if (lenis) lenis.scrollTo(position, {immediate: true});
    else window.scrollTo(0, position);
    ScrollTrigger.update();
  }

  function jumpToScene(label) {
    jumpToScroll(Math.round(landingTimeline.scrollTrigger.labelToScroll(label)));
    landingTimeline.scrollTrigger.getTween()?.progress(1);
  }

  function followSurfaceLink(event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (landingTimeline && sceneLabels[link?.hash]) {
      event.preventDefault();
      history.pushState(null, '', link.hash);
      jumpToScene(sceneLabels[link.hash]);
      root.querySelector(link.hash + ' h2[tabindex="-1"]')?.focus({preventScroll: true});
    }
  }

  function followSceneHash() {
    const hash = location.hash;
    if (sceneLabels[hash] && landingTimeline) {
      jumpToScene(sceneLabels[hash]);
    } else if (sceneLabels[hash] || hash === '#casos' || hash === '#comparar') {
      root.querySelector(hash).scrollIntoView();
    }
  }
  const initialHashFrame = requestAnimationFrame(followSceneHash);
  window.addEventListener('hashchange', followSceneHash);
  root.addEventListener('click', followSurfaceLink);
  return () => {
    cancelAnimationFrame(initialHashFrame);
    window.removeEventListener('hashchange', followSceneHash);
    media.revert();
    root.removeEventListener('click', followSurfaceLink);
  };
}








