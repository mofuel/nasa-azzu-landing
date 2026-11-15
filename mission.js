import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {startStarfield} from './starfield.js';
gsap.registerPlugin(ScrollTrigger);

export function setupStory(root) {
  const chapters = [...root.querySelectorAll('nav a')];
  const sceneLabels = {'#luna': 'lunarReading', '#lava': 'lavaReading', '#casos': 'fieldReading', '#marte': 'marsReading'};
  let landingTimeline;
  let lenis;
  let currentWorld = '#tierra';
  function updateNavigation() {
    let active = chapters[0];
    for (const link of chapters) {
      if (landingTimeline && (link.hash === '#luna' || link.hash === '#marte')) {
        if (link.hash === currentWorld) active = link;
      } else if (root.querySelector(link.hash).getBoundingClientRect().top <= innerHeight * .45) {
        active = link;
      }
    }
    for (const link of chapters) {
      if (link === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const hero = root.querySelector('.earth');
    const stopStarfield = startStarfield(hero.querySelector('.hero-stars canvas'));
    const select = gsap.utils.selector(hero);
    const moon = hero.querySelector('.hero-moon');
    const lunarScan = hero.querySelector('.lunar-scan');
    const centerX = () => (hero.clientWidth - moon.offsetWidth) / 2 - moon.offsetLeft;
    const lowerCenterY = () => hero.clientHeight * .73 - moon.offsetHeight / 2 - moon.offsetTop;
    const landing = hero.querySelector('#luna');
    const lava = hero.querySelector('#lava');
    const rock = lava.querySelector('.occlusion');
    const lavaView = lava.querySelector('.landscape');
    const transitionTitle = lava.querySelector('.surface-transition');
    const lavaDetails = lava.querySelector('.field');
    const fieldSites = hero.querySelector('#casos');
    const cave = hero.querySelector('.cave-passage');
    const caveWalls = [...cave.querySelectorAll('.cave-wall')];
    const caveShadow = cave.querySelector('.cave-shadow');
    const eyelids = cave.querySelector('.lunar-eyelids');
    const caveTerrain = cave.querySelector('.cave-terrain');
    const astronaut = caveTerrain.querySelector('.cave-astronaut');
    const caveMoon = cave.querySelector('.cave-moon');
    const mars = hero.querySelector('#marte');
    const marsPlanet = mars.querySelector('.planet');
    const marsScan = mars.querySelector('.mars-scan');
    const marsIntro = mars.querySelector('.intro');
    landingTimeline = gsap.timeline({
      scrollTrigger: {trigger: hero, pin: true, start: 'top top', end: '+=1216%', scrub: .25, invalidateOnRefresh: true},
      onUpdate() {
        const time = this.time();
        const world = time >= this.labels.marsArrival ? '#marte'
          : time >= this.labels.lunarArrival ? '#luna' : '#tierra';
        if (world !== currentWorld) {
          currentWorld = world;
          updateNavigation();
        }
      },
      defaults: {ease: 'none'}
    })
      .to(select('.hero-title'), {y: () => -hero.clientHeight * .3, duration: .52}, .18)
      .to(select('.hero-title'), {autoAlpha: 0, duration: .10, ease: 'sine.inOut'}, .34)
      .to(select('.earth-globe'), {y: () => -hero.clientHeight * 1.13, scale: 1.42, duration: .60, ease: 'power1.out'}, .14)
      .to(moon, {y: () => -moon.offsetHeight * .33, duration: .06}, .49)
      .to(moon, {y: () => -hero.clientHeight * .16, scale: .93, rotation: -7, duration: .08}, .55)
      .to(moon, {
        x: () => centerX() * .52, y: () => lowerCenterY() - hero.clientHeight * .025,
        scale: 1.16, rotation: -14, duration: .06, ease: 'sine.out'
      }, .63)
      .to(moon, {
        x: centerX, y: lowerCenterY, scale: 1.22, rotation: -18, duration: .05, ease: 'sine.inOut'
      }, .69)
      .to(moon, {
        x: () => centerX() - hero.clientWidth * .19,
        y: () => lowerCenterY() + hero.clientHeight * .035,
        scale: () => hero.clientHeight * .82 / moon.offsetWidth,
        rotation: -21, duration: .115, ease: 'sine.inOut'
      }, .74)
      .to(moon, {
        scale: () => hero.clientHeight * 1.24 / moon.offsetWidth,
        duration: .055, ease: 'sine.in'
      }, .855)
      .fromTo(lunarScan, {autoAlpha: 0}, {autoAlpha: 1, duration: .026}, .825)
      .to(lunarScan, {autoAlpha: 0, duration: .023}, .887)
      .to(moon, {
        x: centerX,
        y: () => lowerCenterY() - hero.clientHeight * .23,
        scale: () => Math.hypot(hero.clientWidth, hero.clientHeight) * 1.1 / moon.offsetWidth,
        duration: .04, ease: 'sine.inOut'
      }, .91)
      .to(moon, {
        scale: () => Math.hypot(hero.clientWidth, hero.clientHeight) * 1.23 / moon.offsetWidth,
        duration: .047, ease: 'none'
      }, .95)
      .to(select('.earth-globe'), {autoAlpha: 0, duration: .12, ease: 'sine.inOut'}, .79)
      .to(select('.earth-globe'), {x: () => hero.clientWidth * .12, duration: .35, ease: 'sine.inOut'}, .39)
      .to(select('.earth-globe'), {x: () => hero.clientWidth * .58, duration: .18, ease: 'sine.in'}, .74)
      .to(select('.earth-globe'), {y: () => -hero.clientHeight * 1.43, scale: 1.13, duration: .18, ease: 'sine.in'}, .74)
      .fromTo(landing, {autoAlpha: 0}, {autoAlpha: 1, duration: .044, ease: 'sine.inOut'}, .953)
      .to(select('.caption'), {autoAlpha: 0, duration: .058}, .91)
      .set(moon, {autoAlpha: 0}, .997)
      .addLabel('lunarArrival', 1)
      .fromTo(landing.querySelector('.intro'), {autoAlpha: 0, y: 22},
        {autoAlpha: 1, y: 0, duration: .12, ease: 'sine.out'}, 1.025)
      .addLabel('lunarReading', 1.16)
      .set([lavaView, lavaDetails, transitionTitle, lava.querySelector('.art-credit')],
        {autoAlpha: 0}, 0)
      .fromTo(rock, {yPercent: 86}, {yPercent: 3, duration: .17}, 1.28)
      .to(landing, {yPercent: -100, duration: .16}, 1.29)
      .set(lavaView, {autoAlpha: 1}, 1.45)
      .to(transitionTitle, {autoAlpha: 1, duration: .045}, 1.45)
      .to(rock, {yPercent: -110, duration: .24}, 1.54)
      .to(transitionTitle, {yPercent: -175, autoAlpha: 0, duration: .17}, 1.55)
      .fromTo(lavaView, {yPercent: 5, scale: 1.08},
        {yPercent: -2, scale: 1, duration: .28}, 1.54)
      .fromTo([lavaDetails, lava.querySelector('.art-credit')], {y: 24, autoAlpha: 0},
        {y: 0, autoAlpha: 1, duration: .10}, 1.72)
      .addLabel('lavaReading', 1.86)
      .set([cave, caveMoon, caveTerrain, caveShadow, eyelids, fieldSites, mars, marsIntro, marsScan], {autoAlpha: 0}, 0)
      .to([lavaDetails, lava.querySelector('.art-credit')], {y: -28, autoAlpha: 0, duration: .12}, 1.94)
      .set(cave, {autoAlpha: 1}, 1.96)
      .fromTo(caveWalls, {x: 0, autoAlpha: 0}, {autoAlpha: 1, duration: .04}, 1.96)
      .to(caveWalls, {
        x: (index, wall) => wall.offsetHeight * (index === 0 ? .60 : -.60),
        duration: .19, ease: 'sine.inOut'
      }, 2.00)
      .to(lavaView, {scale: .78, duration: .13, ease: 'sine.inOut'}, 2.06)
      .to(caveShadow, {autoAlpha: 1, duration: .19, ease: 'sine.inOut'}, 2.00)
      .set(lavaView, {autoAlpha: 0}, 2.19)
      .set(caveTerrain, {autoAlpha: 1}, 2.19)
      .set(caveWalls, {autoAlpha: 0}, 2.19)
      .set(eyelids, {autoAlpha: 1}, 2.21)
      .to(caveShadow, {autoAlpha: 0, duration: .055, ease: 'sine.out'}, 2.21)
      .fromTo(eyelids, {'--lid-cover': 1}, {'--lid-cover': 0, duration: .20, ease: 'sine.inOut'}, 2.21)
      .set(astronaut, {'--walk-state': 'running'}, 2.30)
      .set(eyelids, {autoAlpha: 0}, 2.41)
      .set(caveMoon, {autoAlpha: 1}, 2.42)
      .to(caveTerrain, {autoAlpha: 0, scale: .88, duration: .17, ease: 'sine.inOut'}, 2.42)
      .set(astronaut, {'--walk-state': 'paused'}, 2.59)
      .fromTo(caveMoon, {
        scale: () => Math.hypot(hero.clientWidth, hero.clientHeight) * 1.25 / caveMoon.offsetWidth
      }, {scale: .52, y: () => hero.clientHeight * .15, duration: .27, ease: 'sine.inOut'}, 2.42)
      .to(caveMoon, {x: () => -hero.clientWidth * .5 - caveMoon.offsetWidth * .3,
        duration: .24, ease: 'sine.inOut'}, 2.63)
      .to(caveMoon, {y: () => -hero.clientHeight * .55,
        duration: .24, ease: 'power2.in'}, 2.63)
      .to(caveMoon, {scale: .07, duration: .18, ease: 'sine.out'}, 2.69)
      .set(caveMoon, {autoAlpha: 0}, 2.87)
      .set(mars, {autoAlpha: 1}, 2.69)
      .fromTo(marsPlanet, {x: () => hero.clientWidth, scale: .65},
        {x: 0, duration: .19, ease: 'sine.out'}, 2.69)
      .addLabel('marsArrival', 2.89)
      .to(marsPlanet, {x: () => hero.clientWidth * .22, y: () => hero.clientHeight * .30, scale: 1.42,
        duration: .08, ease: 'sine.inOut'}, 2.92)
      .to(marsIntro, {autoAlpha: 1, duration: .08}, 2.92)
      .to(marsScan, {autoAlpha: 1, duration: .05}, 2.95)
      .addLabel('marsReading', 3.00)
      .to(mars, {autoAlpha: 0, duration: .08}, 3.04)
      .to(fieldSites, {autoAlpha: 1, duration: .09}, 3.06)
      .addLabel('fieldReading', 3.195)
      .set(cave, {autoAlpha: 0}, 3.20);

    function animateSurface(scene) {
      const rock = scene.querySelector('.occlusion');
      const landscape = scene.querySelector('.landscape');
      const article = scene.querySelector('.field');
      const foreground = scene.querySelector('.surface-foreground');
      const timeline = gsap.timeline({
        scrollTrigger: {id: scene.id, trigger: scene, pin: true, start: 'top top', end: '+=145%', scrub: .25},
        defaults: {ease: 'none'}
      });
      timeline
        .fromTo(rock, {yPercent: 18}, {yPercent: -108, duration: .8}, .15)
        .fromTo(scene.querySelector('.surface-transition'), {y: 34}, {y: -140, autoAlpha: 0, duration: .55}, .1)
        .fromTo(landscape, {yPercent: 6, scale: 1.09}, {yPercent: -3, scale: 1, duration: 1}, 0)
          .fromTo(foreground, {yPercent: 48, scale: 1.13}, {yPercent: -8, scale: 1, duration: .42}, .58)
        .fromTo(article, {y: 30, autoAlpha: 0}, {y: 0, autoAlpha: 1, duration: .35}, .63);
    }

    root.querySelectorAll('.surface:not(.lava)').forEach(animateSurface);

    const scroller = new Lenis({autoRaf: true, lerp: .12, naiveDimensions: true, stopInertiaOnNavigate: true});
    scroller.on('scroll', ScrollTrigger.update);
    lenis = scroller;

    return () => {
      stopStarfield();
      scroller.destroy();
      lenis = null;
      landingTimeline = null;
      currentWorld = '#tierra';
      updateNavigation();
    };
  }, root);

  function jumpToScroll(position) {
    if (lenis) lenis.scrollTo(position, {immediate: true});
    else window.scrollTo(0, position);
    ScrollTrigger.update();
  }

  function jumpToLunarScene(label) {
    if (!landingTimeline) return;
    jumpToScroll(Math.round(landingTimeline.scrollTrigger.labelToScroll(label)));
    landingTimeline.scrollTrigger.getTween()?.progress(1);
  }

  function followSurfaceLink(event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (landingTimeline && sceneLabels[link?.hash]) {
      event.preventDefault();
      history.pushState(null, '', link.hash);
      jumpToLunarScene(sceneLabels[link.hash]);
      if (link.hash === '#lava') root.querySelector('#lava h2').focus({preventScroll: true});
      return;
    }
    const trigger = link && ScrollTrigger.getById(link.hash.slice(1));
    if (!trigger) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    jumpToScroll(trigger.end - 2);
    trigger.getTween()?.progress(1);
    trigger.trigger.querySelector('h2').focus({preventScroll: true});
  }

  function followLunarHash() {
    if (sceneLabels[location.hash]) jumpToLunarScene(sceneLabels[location.hash]);
  }
  const initialHashFrame = requestAnimationFrame(followLunarHash);
  window.addEventListener('hashchange', followLunarHash);
  root.addEventListener('click', followSurfaceLink);
  updateNavigation();
  window.addEventListener('scroll', updateNavigation, {passive: true});
  window.addEventListener('resize', updateNavigation);
  return () => {
    cancelAnimationFrame(initialHashFrame);
    window.removeEventListener('hashchange', followLunarHash);
    media.revert();
    root.removeEventListener('click', followSurfaceLink);
    window.removeEventListener('scroll', updateNavigation);
    window.removeEventListener('resize', updateNavigation);
  };
}








