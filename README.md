# Análogos planetarios

Landing de scrollytelling para el reto NASA Space Apps **Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars**.

```powershell
npm ci
npm run dev
```

Abre la URL que indica Vite. Para generar y revisar la versión de producción, usa `npm run build` y `npm run preview`.

React organiza el recorrido y GSAP ScrollTrigger fija las escenas orbitales y de superficie mientras su animación avanza o retrocede con el scroll. Los globos usan proyección esférica en Canvas 2D. Los paisajes de Lava Beds y Atacama son ilustraciones generadas. Sus fichas enlazan a las fuentes de NASA.

Para probar el recorrido en escritorio y móvil:

```powershell
npx playwright install chromium
npm test
```

Playwright guarda capturas del inicio, acercamiento orbital, aterrizaje y fichas en `test-results/`.
