import React, {useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {setupStory} from './mission.js';
import {copy, defaultLanguage, languageKey} from './copy.js';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-700.css';
import satellite from './assets/hero-satellite.webp';
import marsOrbit from './assets/mars-orbit.webp';
import curiosity from './assets/curiosity-rover.webp';
import atlasPreview from './assets/tsumi-atlas.png';
import nasaLogo from './assets/logo-nasa-blanco.svg?raw';
import launchMark from './assets/logo-nasa-blanco.svg';
import './style.css';

function animateLogoSparks(paths) {
  const trails = paths.map(path => ({path, length: path.getTotalLength()}))
    .sort((a, b) => b.length - a.length)
    .slice(0, 2)
    .map(({path, length}) => {
      const spark = document.createElementNS(path.namespaceURI, 'g');
      spark.setAttribute('class', 'logo-spark');
      spark.setAttribute('opacity', '0');
      spark.innerHTML = `
        <g class="logo-spark-trail">
          <circle r="104"/><circle r="85"/><circle r="69"/>
          <circle r="56"/><circle r="44"/><circle r="33"/>
        </g>
        <circle class="logo-spark-halo" r="345"/>
        <polygon points="0,-390 85,-85 295,0 85,85 0,390 -85,85 -295,0 -85,-85"/>
        <circle class="logo-spark-glint" cx="350" cy="220" r="64"/>
        <circle class="logo-spark-glint" cx="-315" cy="140" r="52"/>
        <circle class="logo-spark-glint" cx="-190" cy="-345" r="75"/>
      `;
      path.parentNode.append(spark);
      return {path, length, spark, dust: [...spark.querySelectorAll('.logo-spark-trail circle')]};
    });

  function followTrace() {
    if (!paths[0].isConnected) return;
    const {strokeDashoffset, strokeOpacity} = getComputedStyle(paths[0]);
    const progress = 1 - Number.parseFloat(strokeDashoffset);
    for (const {path, length, spark, dust} of trails) {
      const distance = length * progress;
      const point = path.getPointAtLength(distance);
      spark.setAttribute('transform', `translate(${point.x} ${point.y})`);
      spark.setAttribute('opacity', strokeOpacity);
      dust.forEach((particle, index) => {
        const trailingDistance = distance - 230 * (index + 1);
        const earlier = path.getPointAtLength(trailingDistance);
        const x = earlier.x - point.x;
        const y = earlier.y - point.y;
        const visible = trailingDistance > 0 && Math.hypot(x, y) < 1500;
        particle.setAttribute('cx', x);
        particle.setAttribute('cy', y + (index % 2 ? -1 : 1) * (index + 1) * 30);
        particle.setAttribute('opacity', visible ? 1 - index * .14 : 0);
      });
    }
    if (Number(strokeOpacity) > 0) requestAnimationFrame(followTrace);
  }

  requestAnimationFrame(followTrace);
}

function revealLanding() {
  const screen = document.getElementById('loading-screen');
  const root = document.getElementById('root');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.inert = false;
    screen.remove();
    return;
  }

  const svg = new DOMParser().parseFromString(nasaLogo, 'image/svg+xml').documentElement;
  svg.setAttribute('aria-hidden', 'true');
  const paths = [...svg.querySelectorAll('path')];
  paths.forEach(path => path.setAttribute('pathLength', '1'));
  screen.querySelector('.loading-logo').append(svg);
  if (!location.hash || location.hash === '#tierra') root.classList.add('is-launching');
  screen.classList.add('is-drawing');
  animateLogoSparks(paths);
  screen.addEventListener('animationend', event => {
    if (event.target !== screen) return;
    root.classList.remove('is-launching');
    root.inert = false;
    screen.remove();
  });
}

function AtlasLink({label, showMark = true}) {
  return <a className="atlas-link" href="https://nasa.azzu.tech/atlas/">
    <span>{label}</span>{showMark && <img src={launchMark} alt="" width="36" height="36" />}
  </a>;
}

function LanguageSwitch({language, label, onChange}) {
  return <div className="language-switch" role="group" aria-label={label}>
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="8.5" /><ellipse cx="12" cy="12" rx="4" ry="8.5" /><path d="M4 12h16" />
    </svg>
    <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => onChange('en')}>EN</button>
    <button type="button" lang="es" aria-label="Español" aria-pressed={language === 'es'} onClick={() => onChange('es')}>ES</button>
  </div>;
}

function ScrollMark() {
  return <svg width="24" height="25" viewBox="0 0 24 25" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 13 12 5l8 8m-12 4 4-4 4 4" />
  </svg>;
}

function Surface({id, transition, children}) {
  return (
    <section id={id} className={'surface ' + id}>
      <div className="landscape" aria-hidden="true" />
      {id !== 'lava' && <div className="surface-foreground" aria-hidden="true" />}
      {transition && <>
        <div className="occlusion" aria-hidden="true" />
        <div className="surface-transition" aria-hidden="true">{transition}</div>
      </>}
      {children}
    </section>
  );
}

function TerrainProfile({step, t}) {
  return (
    <figure className="terrain-story" data-step={step}>
        <svg viewBox="0 0 600 420" role="img" aria-labelledby={'terrain-story-title-' + step + ' terrain-story-desc-' + step}>
          <title id={'terrain-story-title-' + step}>{t('profileTitle')}</title>
          <desc id={'terrain-story-desc-' + step}>{t('profileDescription')}</desc>
          <defs>
            <linearGradient id={'terrain-fill-' + step} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#81e5db" stopOpacity=".2" /><stop offset="1" stopColor="#81e5db" stopOpacity="0" /></linearGradient>
          </defs>
          <g className="terrain-grid"><path d="M40 90H560M40 160H560M40 230H560M40 300H560M110 55V355M220 55V355M330 55V355M440 55V355M550 55V355" /></g>
          <path className="terrain-fill" style={{fill: 'url(#terrain-fill-' + step + ')'}} d="M40 310 110 290 180 240 240 260 305 210 355 100 410 135 475 230 560 190V355H40Z" />
          <path className="terrain-profile" pathLength="1" d="m40 310 70-20 70-50 60 20 65-50 50-110 55 35 65 95 85-40" />
          <g className="terrain-detail terrain-median" aria-hidden="true">
            <path className="terrain-highlight" pathLength="1" d="m110 290 70-50" />
            <path className="terrain-guide" d="M110 290H208M158 290Q158 274 150 262" />
            <circle cx="110" cy="290" r="5" /><text x="72" y="355">{t('profileMedian')}</text>
          </g>
          <g className="terrain-detail terrain-steep" aria-hidden="true">
            <path className="terrain-highlight" pathLength="1" d="m305 210 50-110" />
            <path className="terrain-guide" d="M355 100V65H475" />
            <circle cx="355" cy="100" r="5" /><text x="355" y="48">{t('profileP90')}</text>
          </g>
          <g className="terrain-detail terrain-height" aria-hidden="true">
            <path className="terrain-guide" d="M80 290H520M355 120H520" />
            <path className="terrain-highlight" pathLength="1" d="M510 120V290M500 120H520M500 290H520" />
            <text x="450" y="109">P95</text><text x="450" y="318">P5</text>
          </g>
        </svg>
      </figure>
  );
}

function App() {
  const story = useRef(null);
  const [language, setLanguage] = useState(() => {
    try {
      if (localStorage.getItem(languageKey) === 'es') return 'es';
    } catch {
      // The default also works with storage disabled.
    }
    return defaultLanguage;
  });
  const t = key => copy[key][language === 'es' ? 1 : 0];
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.title = t('title');
    document.querySelector('meta[name="description"]').content = t('description');
    document.getElementById('loading-screen')?.setAttribute('aria-label', t('loading'));
    try {
      localStorage.setItem(languageKey, language);
    } catch {
      // Keep the selected language for the current visit.
    }
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(refresh);
  }, [language]);
  useLayoutEffect(() => {
    const disposeStory = setupStory(story.current);
    revealLanding();
    return disposeStory;
  }, []);
  return (
    <div className="landing" ref={story}>
<LanguageSwitch language={language} label={t('language')} onChange={setLanguage} />
<div className="viewfinder" aria-hidden="true"><i /><i /><i /><i /></div>
<div className="journey-progress" role="progressbar" aria-label={t('progress')} aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span /></div>
<div className="hero-stars" aria-hidden="true"><canvas /></div>
<main>
<section id="tierra" className="orbital earth">
  <div className="hero-title">
    <h1><span>AZZU</span>{' '}<span className="hero-atlas-name">Atlas</span></h1>
    <div className="hero-actions">
      <AtlasLink label={t('openAtlas')} />
      <div className="hero-scroll-cue">
        <span>{t('scrollCue')}</span>
        <a className="hero-scroll" href="#luna" data-direction="down" aria-label={t('scroll')}><ScrollMark /></a>
      </div>
    </div>
  </div>
  <div className="earth-globe" role="img" aria-label={t('earthImage')}>
    <div className="hero-flyby" aria-hidden="true"><img src={satellite} alt="" /></div>
  </div>
  <div className="hero-moon" aria-hidden="true" />
  <aside id="luna" className="lunar-scan" aria-labelledby="lunar-scan-title">
    <svg className="lunar-scan-line" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      <path className="scan-line-wide" d="M430 550H500L580 628" />
      <path className="scan-line-narrow" d="M430 550V455L520 390" />
    </svg>
    <span className="lunar-scan-point" aria-hidden="true" />
    <div className="lunar-scan-card">
      <div className="lunar-scan-story">
        <h2>{t('moonTitle')}</h2>
        <p>{t('moonIntro')}</p>
      </div>
      <h2 id="lunar-scan-title"><span aria-hidden="true">ⓘ</span> {t('moonOrbital')}</h2>
      <dl>
        <div><dt>{t('feature')}</dt><dd>{t('lavaTubes')}</dd></div>
        <div><dt>{t('test')}</dt><dd>{t('radar')}</dd></div>
        <div><dt>{t('earthAnalog')}</dt><dd>Lava Beds, California</dd></div>
      </dl>
      <a className="lunar-scan-link" href="#lava">{t('exploreLava')} <span aria-hidden="true">↓</span></a>
    </div>
  </aside>
<section className="hero-landing lunar-surface" aria-label={t('moonSurface')}>
  <article className="field field-location lunar-location">
    <div className="lunar-terrain-pointer" aria-hidden="true">
      <svg viewBox="0 0 360 300" preserveAspectRatio="none"><path d="M360 0H232L0 300" /></svg>
      <span className="lunar-terrain-point" />
    </div>
    <h2>{t('moon')}</h2>
    <p>{t('moonLandscape')}</p>
  </article>
</section>
<Surface id="lava" transition={t('moonToCalifornia')}>
  <article className="field field-location">
    <p className="label">CALIFORNIA</p>
    <h2 tabIndex={-1}>Lava Beds</h2>
    <p>{t('lavaDescription')}</p>
    <a href="https://ntrs.nasa.gov/citations/20205000768">{t('tubeStudy')} ↗</a>
  </article>
</Surface>
<div className="cave-passage" aria-hidden="true">
  <div className="cave-wall cave-wall-left" />
  <div className="cave-wall cave-wall-right" />
</div>
<div className="departure-moon" aria-hidden="true" />
<section id="marte" className="orbital mars">
  <img className="planet" src={marsOrbit} alt={t('marsImage')} />
  <aside className="lunar-scan mars-scan" aria-labelledby="mars-scan-title">
    <svg className="lunar-scan-line" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      <path className="scan-line-wide" d="M725 490V395L685 210" />
      <path className="scan-line-narrow" d="M725 550V405L560 205" />
    </svg>
    <span className="lunar-scan-point" aria-hidden="true" />
    <div className="lunar-scan-card">
      <h2 id="mars-scan-title"><span aria-hidden="true">ⓘ</span> {t('marsOrbital')}</h2>
      <dl>
        <div><dt>{t('test')}</dt><dd>{t('biosignatures')}</dd></div>
        <div><dt>{t('condition')}</dt><dd>{t('drySoil')}</dd></div>
        <div><dt>{t('testSite')}</dt><dd>Atacama, Chile</dd></div>
      </dl>
    </div>
  </aside>
  <div className="intro"><p className="label">{t('mars')}</p><h2>{t('marsTitle')}</h2><p className="summary">{t('marsIntro')}</p></div>
</section>
<section id="suelo-marciano" className="surface mars-ground" aria-labelledby="mars-ground-title">
  <div className="landscape" aria-hidden="true" />
  <div className="surface-foreground" aria-hidden="true" />
  <article className="field field-location mars-ground-caption">
    <p className="label">{t('gale')}</p>
    <h2 id="mars-ground-title" tabIndex={-1}>{t('mountSharp')}</h2>
    <p>{t('mountDescription')}</p>
    <a href="https://science.nasa.gov/photojournal/mount-sharp-buttes-and-layers-from-near-darwin/">NASA/JPL-Caltech/MSSS ↗</a>
  </article>
  <figure className="mars-rover">
    <figcaption><strong>{t('curiosity')}</strong> {t('curiosityDescription')}</figcaption>
    <img src={curiosity} width="248" height="222" alt={t('curiosityImage')} />
  </figure>
</section>
<Surface id="atacama">
  <div className="mars-passage-rock" aria-hidden="true" />
  <p className="surface-transition mars-transition">{t('marsToAtacama')}</p>
  <article className="field field-location"><p className="label">{t('northernChile')}</p><h2 tabIndex={-1}>{t('atacama')}</h2><p>{t('atacamaDescription')}</p><a href="https://www.nasa.gov/universe/atacama-rover-astrobiology-drilling-studies-arads/">{t('arads')} ↗</a></article>
  <div className="atacama-orbit" aria-hidden="true">
    <img src={marsOrbit} alt="" />
  </div>
</Surface>
  <div className="atlas-intro">
    <h2>{t('searchLine1')}<br />{t('searchLine2')}</h2>
    <p>{t('searchDescription')}</p>
    <svg className="atlas-search-symbol" viewBox="0 0 184 82" fill="none" aria-hidden="true">
      <path d="M1 41h182M92 1v80" />
      <ellipse cx="92" cy="41" rx="89" ry="37" />
      <ellipse cx="92" cy="41" rx="61" ry="26" />
      <ellipse cx="92" cy="41" rx="32" ry="14" />
      <path className="atlas-search-signal" d="M92 41 147 20m-55 21L55 62" />
      <circle cx="92" cy="41" r="5" /><circle cx="147" cy="20" r="4" /><circle cx="55" cy="62" r="3" />
    </svg>
  </div>
</section>
<section id="comparar" className="atlas-scene" aria-label={t('atlasSection')}>
  <figure className="atlas-preview">
    <div className="atlas-laptop-body">
      <div className="atlas-laptop-base" aria-hidden="true"><span /></div>
      <div className="atlas-laptop-lid">
        <div className="atlas-laptop-screen">
          <div className="atlas-laptop-display">
            <img src={atlasPreview} width="1802" height="873" loading="lazy" alt={t('atlasImage')} />
          </div>
        </div>
      </div>
    </div>
  </figure>
  <div className="atlas-variables">
    <div className="atlas-story-step">
      <TerrainProfile t={t} step="0" />
      <dl className="metric-copy">
        <dt>{t('median')} <span>°</span></dt>
        <dd>{t('medianDescription')}</dd>
      </dl>
    </div>
    <div className="atlas-story-step">
      <TerrainProfile t={t} step="1" />
      <dl className="metric-copy">
        <dt>{t('p90')} <span>°</span></dt>
        <dd>{t('p90Description')}</dd>
      </dl>
    </div>
    <div className="atlas-story-step">
      <TerrainProfile t={t} step="2" />
      <dl className="metric-copy">
        <dt>{t('relief')} <span>m</span></dt>
        <dd>{t('reliefDescription')}</dd>
      </dl>
    </div>
  </div>
  <div className="atlas-selection">
    <div className="atlas-selection-copy">
      <h3>{t('fieldWork')}</h3>
      <p>{t('fieldDescription')}</p>
    </div>
    <ol className="atlas-selection-flow" aria-label={t('selectionCriteria')}>
      <li><span>{t('terrain')}</span><strong>{t('threeMetrics')}</strong></li>
      <li><span>{t('vegetation')}</span><strong>{t('modis')}</strong></li>
      <li><span>{t('result')}</span><strong>{t('candidate')}</strong></li>
    </ol>
  </div>
</section>
</main>
<footer id="casos" className="mission-footer">
  <div className="footer-horizon" aria-hidden="true"></div>
  <div className="footer-main">
    <h2><span>{t('footerLine1')}</span>{' '}<span>{t('footerLine2')}</span></h2>
    <AtlasLink label={t('openAtlas')} showMark={false} />
    <div className="footer-brand">
      <span>AZZU</span>
      <img src={launchMark} alt="" width="66" height="66" />
    </div>
  </div>
  <div className="footer-links">
    <a href="https://github.com/77ALDO77/tsumi_nasa_SA">{t('atlasGithub')} <span aria-hidden="true">↗</span></a>
    <a href="https://github.com/mofuel/nasa-azzu-landing">{t('landingGithub')} <span aria-hidden="true">↗</span></a>
  </div>
</footer>
<a className="back-to-top" href="#tierra" aria-label={t('back')} title={t('back')} hidden><ScrollMark /></a>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);




