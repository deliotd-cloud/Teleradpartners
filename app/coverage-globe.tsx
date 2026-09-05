"use client";

import { useEffect, useRef } from "react";

// Atlas's dotted sphere and travelling routes, in the Monolith brand palette.
// Routes are decorative, not representations of offices or live clinical traffic.
function drawGlobe(ctx: CanvasRenderingContext2D, time: number) {
  const size = 880, centre = 440, radius = 302;
  ctx.clearRect(0, 0, size, size);
  const halo = ctx.createRadialGradient(centre, centre, radius * .55, centre, centre, radius * 1.4);
  halo.addColorStop(0, "#0a1824");
  halo.addColorStop(.65, "#18496540");
  halo.addColorStop(1, "#080b1000");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);
  function project(lat: number, lon: number, r = radius) {
    const x = Math.cos(lat) * Math.cos(lon + time * .095);
    const z = Math.cos(lat) * Math.sin(lon + time * .095);
    return { x: centre + x * r, y: centre + Math.sin(lat) * r * .91 - z * r * .22, z };
  }
  for (let row = -15; row <= 15; row++) {
    for (let col = 0; col < 72; col++) {
      const point = project(row * Math.PI / 32, col * Math.PI / 36);
      ctx.fillStyle = `rgba(144,233,255,${.1 + (point.z + 1) * .27})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.z > 0 ? 1.8 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let route = 0; route < 4; route++) {
    function routePoint(f: number) {
      return project(Math.sin(f * Math.PI) * .7 - .35 + route * .11, f * 2.4 + route * 1.6, radius + Math.sin(f * Math.PI) * 60);
    }
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const point = routePoint(i / 100);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = "rgba(144,233,255,.28)";
    ctx.lineWidth = 1;
    ctx.stroke();
    const point = routePoint((time * .12 + route * .24) % 1);
    ctx.shadowColor = "#90e9ff";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#d1f6ff";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export function CoverageGlobe({ paused }: { paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const phase = useRef(0);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    drawGlobe(ctx, phase.current);
    el.dataset.ready = "true";
    let frame = 0, previous = 0, visible = false;
    function tick(now: number) {
      if (now - previous >= 1000 / 30) {
        phase.current += previous ? Math.min((now - previous) / 1000, .1) : 0;
        previous = now;
        drawGlobe(ctx!, phase.current);
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
    }
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    });
    if (observer) observer.observe(el);
    else { visible = true; sync(); }
    document.addEventListener("visibilitychange", sync);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [paused]);

  return <figure className="coverage-globe" aria-label="Illustration of a connected global reporting network">
    <div className="coverage-planet" aria-hidden="true">
      <svg className="globe-fallback" viewBox="0 0 440 440" fill="none" stroke="currentColor">
        <circle cx="220" cy="220" r="151" /><ellipse cx="220" cy="220" rx="75" ry="151" /><ellipse cx="220" cy="220" rx="151" ry="55" /><path d="M69 220h302M220 69v302" />
      </svg>
      <canvas ref={canvas} className="coverage-canvas" width={880} height={880} />
      <div className="coverage-orbit" />
    </div>
    <div className="coverage-regions"><span>Americas</span><i /><span>Europe</span><i /><span>Asia Pacific</span></div>
    <figcaption>Global network illustration</figcaption>
  </figure>;
}
