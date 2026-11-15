export function startStarfield(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const glow = document.createElement('canvas');
  glow.width = glow.height = 32;
  const glowContext = glow.getContext('2d');
  const light = glowContext.createRadialGradient(16, 16, 0, 16, 16, 16);
  light.addColorStop(0, '#ffffff');
  light.addColorStop(.20, '#f8fbff');
  light.addColorStop(.46, '#dbe9ff80');
  light.addColorStop(1, '#dbe9ff00');
  glowContext.fillStyle = light;
  glowContext.fillRect(0, 0, 32, 32);

  function seed(star, depth) {
    star.x = (Math.random() - .5) * depth;
    star.y = (Math.random() - .5) * depth;
    star.z = depth;
    star.size = .28 + Math.random() * .46;
    star.phase = Math.random() * Math.PI * 2;
    star.pulse = 1.3 + Math.random() * 2.7;
    star.glow = Math.random() < .11;
    if (star.glow) star.size *= 1.25;
    return star;
  }

  const stars = Array.from({length: 462}, () => seed({}, .16 + Math.random() * .84));
  let frame;
  let previous;
  let lastPaint;

  function resize() {
    const ratio = Math.min(1, 1400 / canvas.clientWidth);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
  }

  function paint(time) {
    frame = requestAnimationFrame(paint);
    if (lastPaint !== undefined && time - lastPaint < 30) return;
    const elapsed = previous === undefined ? 0 : Math.min((time - previous) / 1000, .05);
    previous = lastPaint = time;
    const {width, height} = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';

    for (const star of stars) {
      star.z -= elapsed * .145;
      const x = width * (.50 + star.x / star.z);
      const y = height * (.48 + star.y / star.z);
      if (star.z < .075 || x < -12 || x > width + 12 || y < -12 || y > height + 12) {
        seed(star, 1);
        continue;
      }
      const size = Math.min(star.size / star.z, 5);
      if (star.glow) {
        const twinkle = .77 + Math.sin(time / 1000 * star.pulse + star.phase) * .23;
        const radius = size * 3;
        ctx.globalAlpha = twinkle;
        ctx.drawImage(glow, x - radius, y - radius, radius * 2, radius * 2);
      }
      const core = Math.max(1, Math.round(star.glow ? size * .6 : size));
      ctx.globalAlpha = 1;
      ctx.fillRect(Math.round(x - core / 2), Math.round(y - core / 2), core, core);
    }
  }

  resize();
  const dimensions = new ResizeObserver(resize);
  dimensions.observe(canvas);
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (frame === undefined) frame = requestAnimationFrame(paint);
    } else {
      cancelAnimationFrame(frame);
      frame = previous = lastPaint = undefined;
    }
  });
  visibility.observe(canvas);

  return () => {
    visibility.disconnect();
    dimensions.disconnect();
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
