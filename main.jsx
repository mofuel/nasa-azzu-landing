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

function TerrainProfile({step}) {
  return (
    <figure className="terrain-story" data-step={step}>
        <svg viewBox="0 0 600 420" role="img" aria-labelledby={'terrain-story-title-' + step + ' terrain-story-desc-' + step}>
          <title id={'terrain-story-title-' + step}>Tres maneras de comparar el relieve</title>
          <desc id={'terrain-story-desc-' + step}>Un perfil ilustrativo destaca la inclinación típica, los tramos de mayor pendiente y la diferencia de elevación.</desc>
          <defs>
            <linearGradient id={'terrain-fill-' + step} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#81e5db" stopOpacity=".2" /><stop offset="1" stopColor="#81e5db" stopOpacity="0" /></linearGradient>
          </defs>
          <g className="terrain-grid"><path d="M40 90H560M40 160H560M40 230H560M40 300H560M110 55V355M220 55V355M330 55V355M440 55V355M550 55V355" /></g>
          <path className="terrain-fill" style={{fill: 'url(#terrain-fill-' + step + ')'}} d="M40 310 110 290 180 240 240 260 305 210 355 100 410 135 475 230 560 190V355H40Z" />
          <path className="terrain-profile" d="m40 310 70-20 70-50 60 20 65-50 50-110 55 35 65 95 85-40" />
          <g className="terrain-detail terrain-median" aria-hidden="true">
            <path className="terrain-highlight" d="m110 290 70-50" />
            <path className="terrain-guide" d="M110 290H208M158 290Q158 274 150 262" />
            <circle cx="110" cy="290" r="5" /><text x="72" y="355">INCLINACIÓN TÍPICA</text>
          </g>
          <g className="terrain-detail terrain-steep" aria-hidden="true">
            <path className="terrain-highlight" d="m305 210 50-110" />
            <path className="terrain-guide" d="M355 100V65H475" />
            <circle cx="355" cy="100" r="5" /><text x="355" y="48">MAYOR PENDIENTE</text>
          </g>
          <g className="terrain-detail terrain-height" aria-hidden="true">
            <path className="terrain-guide" d="M80 290H520M355 120H520" />
            <path className="terrain-highlight" d="M510 120V290M500 120H520M500 290H520" />
            <text x="450" y="109">P95</text><text x="450" y="318">P5</text>
          </g>
        </svg>
        <figcaption>Un mismo relieve. Tres lecturas.<span>Esquema ilustrativo · sin escala</span></figcaption>
        <div className="terrain-progress" aria-hidden="true"><span /><span /><span /></div>
      </figure>
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
  <p className="surface-transition mars-transition">De Marte a Atacama</p>
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
</section>
<section id="comparar" className="atlas-scene">
  <figure className="atlas-preview">
    <img src={atlasPreview} width="1366" height="786" loading="lazy" alt="Atlas de AZZU con el mapa de candidatos terrestres y el panel de comparación científica" />
  </figure>
  <div className="atlas-method">
    <div className="atlas-stack-stage">
    <p className="label">QUÉ MIDE EL ATLAS</p>
    <h3>Tres formas de leer un terreno.</h3>
    <p>Usamos datos de elevación de NASA (LOLA) y Copernicus (GLO-30) para comparar sectores de 3 km de lado a una resolución común de 60 m en el Atlas.</p>
    <div className="atlas-story" data-step="0">

      <div className="atlas-variables">
        <div className="atlas-story-step" style={{'--card-index': 0}}>
          <dl className="metric-copy">
          <dt data-reveal><span className="story-number" aria-hidden="true">01 / 03</span>Pendiente mediana</dt>
          <dd data-reveal>Primero, la inclinación habitual.<p>La mediana resume la pendiente típica del terreno, en grados. Es el punto de partida para comparar cómo se inclinan dos superficies.</p></dd></dl>
          <TerrainProfile step="0" />
        </div>
        <div className="atlas-story-step" style={{'--card-index': 1}}>
          <dl className="metric-copy">
          <dt data-reveal><span className="story-number" aria-hidden="true">02 / 03</span>Pendiente P90</dt>
          <dd data-reveal>Después, los tramos más exigentes.<p>Esta es la inclinación que solo supera el 10 % del terreno. Permite mirar más allá de la pendiente típica y comparar las zonas más inclinadas.</p></dd></dl>
          <TerrainProfile step="1" />
        </div>
        <div className="atlas-story-step" style={{'--card-index': 2}}>
          <dl className="metric-copy">
          <dt data-reveal><span className="story-number" aria-hidden="true">03 / 03</span>Desnivel P95–P5</dt>
          <dd data-reveal>Por último, cuánto cambia la altura.<p>La diferencia entre los percentiles 95 y 5 de elevación, en metros, describe el contraste de alturas del sector que estamos comparando.</p></dd></dl>
          <TerrainProfile step="2" />
        </div>
      </div>
    </div>
    </div>
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
}

createRoot(document.getElementById('root')).render(<App />);




