import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function setupStory(root) {
  const chapters = [...root.querySelectorAll('nav a')];
  const sceneLabels = {'#luna': 'lunarReading', '#lava': 'lavaReading', '#casos': 'fieldReading', '#marte': 'marsReading'};
  let landingTimeline;
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
    const select = gsap.utils.selector(hero);
    const moon = hero.querySelector('.hero-moon');
    const centerX = () => (hero.clientWidth - moon.offsetWidth) / 2 - moon.offsetLeft;
    const lowerCenterY = () => hero.clientHeight * .73 - moon.offsetHeight / 2 - moon.offsetTop;
    const landing = hero.querySelector('#luna');
    const lava = hero.querySelector('#lava');
    const rock = lava.querySelector('.occlusion');
    const lavaView = lava.querySelector('.landscape');
    const lavaForeground = lava.querySelector('.surface-foreground');
    const transitionTitle = lava.querySelector('.surface-transition');
    const lavaDetails = lava.querySelector('.field');
    const fieldSites = hero.querySelector('#casos');
    const sandFar = hero.querySelector('.sand-far');
    const sandNear = hero.querySelector('.sand-near');
    const mars = hero.querySelector('#marte');
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
      // Keep the opening readable while the scroll-controlled approach catches up.
      .fromTo(select('.hero-title'), {y: () => hero.clientHeight * .07},
        {y: 0, duration: .08, ease: 'sine.out'}, 0)
      .to(select('.hero-flyby'), {autoAlpha: 0, duration: .035}, .105)
      .to(select('.hero-title'), {y: () => -hero.clientHeight * .3, duration: .52}, .18)
      .to(select('.earth-globe'), {y: () => -hero.clientHeight * 1.13, scale: 1.42, duration: .74, ease: 'power1.out'}, .14)
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
        scale: 1.42,
        rotation: -24, duration: .22, ease: 'power1.in'
      }, .74)
      .to(select('.earth-globe'), {x: () => hero.clientWidth * .12, duration: .49, ease: 'sine.inOut'}, .39)
      .to(select('.hero-ridge'), {y: () => -hero.clientHeight * .42, duration: .34, ease: 'sine.inOut'}, .55)
      .fromTo(landing, {autoAlpha: 0}, {autoAlpha: 1, duration: .065}, .935)
      .to(select('.caption'), {autoAlpha: 0, duration: .065}, .935)
      .addLabel('lunarArrival', 1)
      .fromTo(landing.querySelector('.intro'), {autoAlpha: 0, y: 22},
        {autoAlpha: 1, y: 0, duration: .12, ease: 'sine.out'}, 1.025)
      .fromTo(landing.querySelector('.lunar-terrain'), {yPercent: 85, autoAlpha: 0},
        {yPercent: -24, autoAlpha: 1, duration: .18}, 1.10)
      .addLabel('lunarReading', 1.16)
      .set([lavaView, lavaForeground, lavaDetails, transitionTitle, lava.querySelector('.art-credit')],
        {autoAlpha: 0}, 0)
      .fromTo(rock, {yPercent: 86}, {yPercent: 3, duration: .17}, 1.28)
      .to(landing, {yPercent: -6, duration: .12}, 1.33)
      .to(landing.querySelector('.intro'), {autoAlpha: 0, duration: .055}, 1.36)
      .set([lavaView, lavaForeground], {autoAlpha: 1}, 1.45)
      .to(transitionTitle, {autoAlpha: 1, duration: .045}, 1.45)
      .to(rock, {yPercent: -110, duration: .24}, 1.54)
      .to(transitionTitle, {yPercent: -175, autoAlpha: 0, duration: .17}, 1.55)
      .fromTo(lavaView, {yPercent: 5, scale: 1.08},
        {yPercent: -2, scale: 1, duration: .28}, 1.54)
      .fromTo(lavaForeground, {yPercent: 45},
        {yPercent: -8, duration: .22}, 1.60)
      .fromTo([lavaDetails, lava.querySelector('.art-credit')], {y: 24, autoAlpha: 0},
        {y: 0, autoAlpha: 1, duration: .10}, 1.72)
      .addLabel('lavaReading', 1.86)
      .set(fieldSites, {autoAlpha: 0, '--field-shade': .12}, 0)
      .fromTo(sandFar, {autoAlpha: 0, xPercent: -11, yPercent: 12},
        {autoAlpha: .62, xPercent: -2, yPercent: 1, duration: .24, ease: 'sine.inOut'}, 1.94)
      .fromTo(sandNear, {autoAlpha: 0, xPercent: -14, yPercent: 14},
        {autoAlpha: 1, xPercent: 0, yPercent: 0, duration: .20, ease: 'sine.inOut'}, 1.98)
      .to(lavaView, {yPercent: -8, duration: .19}, 1.99)
      .to(lavaForeground, {yPercent: -28, duration: .19}, 1.99)
      .to([lavaDetails, lava.querySelector('.art-credit')], {y: -28, autoAlpha: 0, duration: .12}, 2.03)
      .set(fieldSites, {autoAlpha: 1}, 2.18)
      .to(sandNear, {autoAlpha: 0, xPercent: 14, yPercent: -14, duration: .22, ease: 'sine.inOut'}, 2.23)
      .to(sandFar, {autoAlpha: 0, xPercent: 12, yPercent: -9, duration: .29, ease: 'sine.inOut'}, 2.23)
      .to(fieldSites, {'--field-shade': 1, duration: .19}, 2.40)
      .fromTo([...fieldSites.children], {y: 28, autoAlpha: 0},
        {y: 0, autoAlpha: 1, duration: .12}, 2.47)
      .addLabel('fieldReading', 2.60)
      .set([mars, marsIntro], {autoAlpha: 0}, 0)
      .to([...fieldSites.children], {autoAlpha: 0, duration: .12}, 2.73)
      .to(fieldSites, {'--field-shade': .42, duration: .22}, 2.73)
      .to(mars, {autoAlpha: 1, duration: .22, ease: 'sine.inOut'}, 2.87)
      .addLabel('marsArrival', 3.02)
      .set(fieldSites, {visibility: 'hidden'}, 3.09)
      .to(marsIntro, {autoAlpha: 1, duration: .10}, 3.09)
      .to(mars.querySelector('.planet'), {scale: 1.08, duration: .27}, 2.93)
      .addLabel('marsReading', 3.195);

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

    return () => {
      landingTimeline = null;
      currentWorld = '#tierra';
      updateNavigation();
    };
  }, root);

  function jumpToLunarScene(label) {
    if (!landingTimeline) return;
    window.scrollTo(0, Math.round(landingTimeline.scrollTrigger.labelToScroll(label)));
    ScrollTrigger.update();
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
    window.scrollTo(0, trigger.end - 2);
    ScrollTrigger.update();
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








