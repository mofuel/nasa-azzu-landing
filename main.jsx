import React, {useLayoutEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {setupStory} from './mission.js';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-700.css';
import satellite from './assets/hero-satellite.webp';
import marsOrbit from './assets/mars-orbit.webp';
import curiosity from './assets/curiosity-rover.webp';
import atlasPreview from './assets/tsumi-atlas.webp';
import nasaLogo from './assets/logo-nasa-blanco.svg?raw';
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
    root.inert = false;
    screen.remove();
  });
}

function AtlasLink() {
  return <a className="atlas-link" href="https://nasa.azzu.tech/atlas/">
    <span>Abrir el Atlas</span><span aria-hidden="true">↗</span>
  </a>;
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

function App() {
  const story = useRef(null);
  useLayoutEffect(() => {
    const disposeStory = setupStory(story.current);
    revealLanding();
    return disposeStory;
  }, []);
  return (
    <div ref={story}>
<div className="viewfinder" aria-hidden="true"><i /><i /><i /><i /></div>
<main>
<section id="tierra" className="orbital earth">
  <div className="hero-stars" aria-hidden="true"><canvas /></div>
  <div className="hero-title">
    <h1><span>AZZU</span></h1>
    <p className="hero-premise">De la Tierra a la Luna y Marte.</p>
    <AtlasLink />
  </div>
  <div className="earth-globe" role="img" aria-label="Modelo ilustrativo de la Tierra">
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
        <h2>Un hogar bajo la Luna</h2>
        <p>Las cuevas volcánicas podrían proteger futuras bases lunares. Explora su análogo en California: allí se ensaya cómo encontrar estos refugios con radar.</p>
      </div>
      <h2 id="lunar-scan-title"><span aria-hidden="true">ⓘ</span> Ficha orbital · Luna</h2>
      <dl>
        <div><dt>Rasgo</dt><dd>Tubos de lava</dd></div>
        <div><dt>Ensayo</dt><dd>Radar desde la superficie</dd></div>
        <div><dt>Análogo terrestre</dt><dd>Lava Beds, California</dd></div>
      </dl>
      <a className="lunar-scan-link" href="#lava">Explorar Lava Beds <span aria-hidden="true">↓</span></a>
    </div>
  </aside>
<section className="hero-landing lunar-surface" aria-label="Superficie lunar">
  <p className="lunar-location label"><span aria-hidden="true">⌖</span> Luna</p>
</section>
<Surface id="lava" transition="De la Luna a California">
  <article className="field">
    <p className="label">CALIFORNIA</p>
    <h2 tabIndex={-1}>Lava Beds</h2>
    <p>El radar de TubeX detectó el techo de dos tubos de lava desde la superficie.</p>
    <a href="https://ntrs.nasa.gov/citations/20205000768">Estudio TubeX ↗</a>
  </article>
</Surface>
<div className="cave-passage" aria-hidden="true">
  <div className="cave-wall cave-wall-left" />
  <div className="cave-wall cave-wall-right" />
</div>
<div className="departure-moon" aria-hidden="true" />
<section id="marte" className="orbital mars">
  <img className="planet" src={marsOrbit} alt="Vista ilustrada de Marte" />
  <aside className="lunar-scan mars-scan" aria-labelledby="mars-scan-title">
    <svg className="lunar-scan-line" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      <path className="scan-line-wide" d="M725 490V395L685 210" />
      <path className="scan-line-narrow" d="M725 550V405L560 205" />
    </svg>
    <span className="lunar-scan-point" aria-hidden="true" />
    <div className="lunar-scan-card">
      <h2 id="mars-scan-title"><span aria-hidden="true">ⓘ</span> Ficha orbital · Marte</h2>
      <dl>
        <div><dt>Ensayo</dt><dd>Detección de biofirmas</dd></div>
        <div><dt>Condición</dt><dd>Suelo hiperárido</dd></div>
        <div><dt>Sitio de ensayo</dt><dd>Atacama, Chile</dd></div>
      </dl>
    </div>
  </aside>
  <div className="intro"><p className="label">MARTE</p><h2>Rumbo a Marte, desde la Tierra</h2><p className="summary">Descubre uno de los tantos lugares análogos que pueden existir en la Tierra para prepararnos de camino a Marte.</p><a className="button" href="#suelo-marciano">Descender a Marte <span aria-hidden="true">↓</span></a></div>
</section>
<section id="suelo-marciano" className="surface mars-ground" aria-labelledby="mars-ground-title">
  <div className="landscape" aria-hidden="true" />
  <div className="surface-foreground" aria-hidden="true" />
  <div className="mars-ground-caption">
    <h2 id="mars-ground-title" tabIndex={-1}>Monte Sharp, Marte</h2>
    <a href="https://science.nasa.gov/photojournal/mount-sharp-buttes-and-layers-from-near-darwin/">NASA/JPL-Caltech/MSSS ↗</a>
  </div>
  <figure className="mars-rover">
    <figcaption><strong>Soy Curiosity.</strong> Soy el rover de la NASA que fotografió el Monte Sharp.</figcaption>
    <img src={curiosity} width="248" height="222" alt="Modelo del rover Curiosity de NASA/JPL-Caltech" />
  </figure>
</section>
<Surface id="atacama">
  <div className="mars-passage-rock" aria-hidden="true" />
  <article className="field"><p className="label">NORTE DE CHILE</p><h2 tabIndex={-1}>Desierto de Atacama</h2><p>El rover de prueba ARADS recogió muestras de suelo hiperárido para buscar señales de vida microbiana.</p><a href="https://www.nasa.gov/universe/atacama-rover-astrobiology-drilling-studies-arads/">Ver los ensayos de ARADS ↗</a></article>
  <div className="atacama-orbit" aria-hidden="true">
    <img src={marsOrbit} alt="" />
  </div>
</Surface>
  <div className="atlas-intro">
    <h2>¿Dónde ensayar<br />el próximo recorrido?</h2>
    <p>Con el Atlas de AZZU puedes buscar terrenos en la Tierra parecidos al polo sur lunar y elegir candidatos para ensayos de movilidad.</p>
    <AtlasLink />
  </div>
  <figure className="atlas-preview">
    <img src={atlasPreview} width="1366" height="786" loading="lazy" alt="Atlas de AZZU con el mapa de candidatos terrestres y el panel de comparación científica" />
  </figure>
  <div className="atlas-method">
    <h3>Qué mide el Atlas</h3>
    <p>Usamos datos de elevación de NASA (LOLA) y Copernicus (GLO-30) para comparar sectores de 3 km de lado a una resolución común de 60 m en el Atlas.</p>
    <dl className="atlas-variables">
      <div><dt>Pendiente mediana</dt><dd>La inclinación típica del terreno, en grados.</dd></div>
      <div><dt>Pendiente P90</dt><dd>La inclinación que solo supera el 10 % del terreno.</dd></div>
      <div><dt>Desnivel P95–P5</dt><dd>La diferencia entre los percentiles 95 y 5 de elevación, en metros.</dd></div>
    </dl>
    <p>En la primera ejecución, SP Crater, en Arizona, quedó entre los percentiles 85 y 98. Las coincidencias de relieve ayudan a priorizar sitios para evaluar en campo.</p>
    <a href="https://github.com/77ALDO77/tsumi_nasa_SA/blob/main/analisis/README.md">Ver método y resultados ↗</a>
  </div>
</section>
</main>
<footer>
  <nav id="casos" aria-label="Casos de campo"><a href="#lava">Lava Beds</a><a href="#atacama">Atacama</a></nav>
  <a href="#tierra">Volver a la Tierra ↑</a>
</footer>
    </div>
  );
  <p className="surface-transition mars-transition">De Marte a Atacama</p>
}

createRoot(document.getElementById('root')).render(<App />);




</section>
<section id="comparar" className="atlas-scene">
