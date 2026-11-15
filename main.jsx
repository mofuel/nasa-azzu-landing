import React, {useLayoutEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {setupStory} from './mission.js';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-700.css';
import satellite from './assets/hero-satellite.webp';
import marsOrbit from './assets/mars-orbit.webp';
import './style.css';

function Surface({id, children}) {
  return (
    <section id={id} className={'surface ' + id}>
      <div className="landscape" aria-hidden="true" />
      {id !== 'lava' && <div className="surface-foreground" aria-hidden="true" />}
      <div className="occlusion" aria-hidden="true" /><div className="surface-transition" aria-hidden="true">{id === 'lava' ? 'Bajo la superficie' : 'Hacia el desierto'}</div>
      {children}
    </section>
  );
}

function App() {
  const story = useRef(null);
  useLayoutEffect(() => setupStory(story.current), []);
  return (
    <div ref={story}>
<header className="hud">
  <a className="brand" href="#tierra"><span aria-hidden="true">◉</span> ANÁLOGOS<br /> PLANETARIOS</a>
  <nav aria-label="Capítulos">
    <a href="#tierra" aria-current="location">Tierra</a><a href="#luna">Luna</a><a href="#marte">Marte</a><a href="#comparar">Comparar</a>
  </nav>
</header><div className="viewfinder" aria-hidden="true"><i /><i /><i /><i /></div>
<main>
<section id="tierra" className="orbital earth">
  <div className="hero-stars" aria-hidden="true"><canvas /></div>
  <div className="hero-title">
    <h1>Antes de<br />despegar</h1>
    <p className="hero-premise">Antes de buscar refugio en la Luna o rastros de vida en Marte, podemos poner a prueba nuestras herramientas aquí, en la Tierra.</p>
  </div>
  <div className="earth-globe" role="img" aria-label="Modelo ilustrativo de la Tierra">
    <div className="hero-flyby" aria-hidden="true"><img src={satellite} alt="" /></div>
  </div>
  <div className="hero-moon" aria-hidden="true" />
  <aside className="lunar-scan" aria-labelledby="lunar-scan-title">
    <svg className="lunar-scan-line" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      <path className="scan-line-wide" d="M430 550H500L580 628" />
      <path className="scan-line-narrow" d="M430 550V455L520 390" />
    </svg>
    <span className="lunar-scan-point" aria-hidden="true" />
    <div className="lunar-scan-card">
      <h2 id="lunar-scan-title"><span aria-hidden="true">ⓘ</span> Ficha orbital · Luna</h2>
      <dl>
        <div><dt>Tipo</dt><dd>Satélite natural</dd></div>
        <div><dt>Diámetro</dt><dd>3 475 km</dd></div>
        <div><dt>Gravedad</dt><dd>1,62 m/s²</dd></div>
        <div><dt>Análogo</dt><dd>Lava Beds, California</dd></div>
      </dl>
    </div>
  </aside>
  <div className="caption"><span><b>01 / TIERRA</b><br />VISTA ORBITAL</span><a href="#casos">Explorar análogos ↓</a></div>
<section id="luna" className="hero-landing lunar-surface">
  <div className="intro lunar-intro"><p className="label">02 / LUNA</p><h2>Descenso lunar</h2><p className="summary">Imagina que llegas a la Luna y necesitas un refugio. Bajo tus pies podría haber un túnel de lava. Antes de acercarte, tendrías que encontrarlo sin entrar en él.</p><a className="button" href="#lava">Explorar Lava Beds <span aria-hidden="true">↓</span></a></div>
</section>
<Surface id="lava">
  <article className="field"><p className="label">TIERRA → LUNA</p><h2 tabIndex={-1}>Lava Beds</h2><p>En Lava Beds, California, los equipos prueban instrumentos para detectar túneles desde la superficie. Encontrar una cavidad lunar sería solo el primer paso. Después habría que comprobar si es estable y si se puede entrar.</p><a href="https://science.nasa.gov/solar-system/planetary-analogs/">Consultar investigación de NASA ↗</a></article>
  <small className="art-credit">ILUSTRACIÓN DE SUPERFICIE</small>
</Surface>
<section id="casos" className="sites">
  <div><p className="label">TRABAJO DE CAMPO</p><h2>De buscar refugio<br />a buscar rastros</h2><p className="summary">En California miramos bajo la roca para encontrar un lugar donde resguardarnos. En el norte de Chile volvemos a mirar el suelo, esta vez para averiguar qué rastros pueden sobrevivir a la aridez.</p></div>
  <div className="site-links">
    <a href="#lava"><small>CALIFORNIA, EE. UU. · LUNA</small><strong>Lava Beds</strong><span aria-hidden="true">↗</span></a>
    <a href="#atacama"><small>NORTE DE CHILE · MARTE</small><strong>Desierto de Atacama</strong><span aria-hidden="true">↗</span></a>
  </div>
</section>
<div className="cave-passage" aria-hidden="true">
  <div className="cave-moon" />
  <div className="cave-terrain">
    <div className="cave-astronaut" />
  </div>
  <div className="cave-shadow" />
  <div className="lunar-eyelids" />
  <div className="cave-wall cave-wall-left" />
  <div className="cave-wall cave-wall-right" />
</div>
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
        <div><dt>Tipo</dt><dd>Planeta rocoso</dd></div>
        <div><dt>Diámetro ecuatorial</dt><dd>6 792 km</dd></div>
        <div><dt>Gravedad</dt><dd>3,7 m/s²</dd></div>
        <div><dt>Análogo</dt><dd>Atacama, Chile</dd></div>
      </dl>
    </div>
  </aside>
  <div className="intro"><p className="label">03 / MARTE</p><h2>Huellas en<br />el desierto.</h2><p className="summary">Ahora imagina que tienes una muestra de suelo marciano. Si allí hubo vida, ¿qué rastro podría quedar? En el Atacama se ensaya cómo reconocer esas señales en un suelo extremadamente seco.</p><a className="button" href="#atacama">Explorar Atacama <span aria-hidden="true">↓</span></a></div>
</section>
</section>
<Surface id="atacama">
  <article className="field"><p className="label">TIERRA → MARTE</p><h2 tabIndex={-1}>Desierto de Atacama</h2><p>Los suelos hiperáridos de Chile son un campo de pruebas para estudiar la conservación y detección de biofirmas. La comparación se centra en la aridez y el suelo. La atmósfera y la radiación de Marte son distintas.</p><a href="https://astrobiology.nasa.gov/research-locations/">Consultar investigación de NASA ↗</a></article>
  <small className="art-credit">ILUSTRACIÓN DE SUPERFICIE</small>
</Surface>
<section id="comparar" className="compare">
  <p className="label">RESUMEN DE CAMPO</p><h2>Qué podemos<br />ensayar en la Tierra</h2>
  <div className="comparison"><article><p className="label">LUNA · CALIFORNIA</p><h3>¿Dónde hay cavidades?</h3><p>En Lava Beds se ensayan técnicas para detectar tubos volcánicos.</p><a href="#lava">Volver a Lava Beds ↗</a></article><article><p className="label">MARTE · CHILE</p><h3>¿Cómo buscar biofirmas?</h3><p>En el Atacama se estudian muestras de suelos sometidos a aridez extrema.</p><a href="#atacama">Volver al Atacama ↗</a></article></div>
</section>
</main>
<footer><span>ANÁLOGOS PLANETARIOS</span><a href="#tierra">Volver a la Tierra ↑</a></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);




