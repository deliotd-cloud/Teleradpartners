"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

export type Modality = "CT" | "MRI" | "PET";
const scans = {
  CT: { file: "ct", width: 268, height: 359, count: 51, delay: 100, title: "CT / HEAD", detail: "Axial cine", credit: "Tafkas · CC BY-SA 3.0", source: "Schaedel-CT.gif" },
  MRI: { file: "mri", width: 256, height: 256, count: 37, delay: 300, title: "MRI / BRAIN", detail: "T1-weighted · axial cine", credit: "L. Hermoye · CC BY-SA 2.5", source: "Brain_MRI_T1_movie.gif" },
  PET: { file: "pet", width: 446, height: 672, count: 32, delay: 200, title: "PET / WHOLE BODY", detail: "FDG · rotating projection", credit: "Jens Maus · Public domain", source: "PET-MIPS-anim.gif" },
};
const Motion = createContext({ paused: true, toggle: () => {} });
const subscribeMotion = (notify: () => void) => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

export function Monolith({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.remove("reveal-pending");
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.06 });
    container.current?.querySelectorAll(".section, .coverage-section, .contact-section").forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("reveal-pending"); observer.observe(el); }
    });
    return () => observer.disconnect();
  }, []);
  const reduced = useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? reduced;
  return <Motion.Provider value={{ paused, toggle: () => setOverride(!paused) }}><div ref={container} className={`monolith ${paused ? "motion-paused" : "motion-active"}`}>{children}</div></Motion.Provider>;
}

export function MotionControls() {
  const { paused, toggle } = useContext(Motion);
  return <div className="motion-controls"><button type="button" onClick={() => window.dispatchEvent(new Event("telerad:intro"))} aria-label="Replay entrance animation">↻ <span>Intro</span></button><button type="button" onClick={toggle} aria-pressed={paused}>{paused ? "▶" : "Ⅱ"} <span>{paused ? "Play motion" : "Pause motion"}</span></button></div>;
}

export function Entrance() {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    function finish() {
      el?.close();
      try { sessionStorage.setItem("telerad-monolith-intro", "seen"); } catch { /* Storage is optional. */ }
    }
    function start() {
      clearTimeout(timer);
      if (el?.open) el.close();
      el?.showModal();
      // The modal takes over the already-visible server-rendered splash in
      // the same task, with no intermediate paint of the homepage.
      document.documentElement.dataset.intro = "ready";
      window.dispatchEvent(new Event("telerad:intro-ready"));
      timer = setTimeout(finish, 2400);
    }
    // If startup expired, was skipped, or was bypassed, never show a late intro.
    if (document.documentElement.dataset.intro === "pending") start();
    window.addEventListener("telerad:intro", start);
    el.addEventListener("cancel", finish);
    el.addEventListener("close", finishTimer);
    function finishTimer() {
      clearTimeout(timer);
      try { sessionStorage.setItem("telerad-monolith-intro", "seen"); } catch { /* Storage is optional. */ }
    }
    return () => { clearTimeout(timer); window.removeEventListener("telerad:intro", start); el.removeEventListener("cancel", finish); el.removeEventListener("close", finishTimer); el.close(); };
  }, []);
  return <dialog ref={dialog} className="entrance" aria-labelledby="entrance-title"><div className="entrance-curtain" aria-hidden="true" /><div className="entrance-copy"><span>TELERAD PARTNERS</span><h2 id="entrance-title">A new perspective.</h2><div className="entrance-progress" aria-hidden="true"><i /></div><p>Making Medicine Global</p></div><form method="dialog"><button className="skip-intro">Skip intro ↗</button></form></dialog>;
}

export function Cine({ modality, stopped = false, requestedFrame, onFrame }: { modality: Modality; stopped?: boolean; requestedFrame?: number; onFrame?: (frame: number) => void }) {
  const { paused } = useContext(Motion);
  const canvas = useRef<HTMLCanvasElement>(null);
  const playback = useRef({ paused, stopped, time: 0, requestedFrame, dirty: true });
  const study = scans[modality];
  useEffect(() => { playback.current.paused = paused; playback.current.stopped = stopped; }, [paused, stopped]);
  useEffect(() => {
    if (requestedFrame !== undefined) { playback.current.time = requestedFrame * study.delay; playback.current.dirty = true; }
  }, [requestedFrame, study.delay]);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    el.dataset.ready = "false";
    const context = el.getContext("2d", { alpha: false });
    if (!context) return;
    const sheet = new window.Image();
    let visible = false, disposed = false, raf = 0, last = 0, drawn = -1;
    playback.current.time = 0;
    playback.current.dirty = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !sheet.src) sheet.src = `/${study.file}-frames.png`;
    }, { rootMargin: "80px" });
    observer.observe(el);
    function paint(now: number) {
      if (disposed || !el || !context) return;
      raf = requestAnimationFrame(paint);
      if (now - last < 40) return;
      const delta = Math.min(now - last, 80); last = now;
      if (!visible || document.hidden || !sheet.complete || !sheet.naturalWidth) return;
      const state = playback.current;
      if (!state.paused && !state.stopped) state.time += delta;
      const frame = Math.floor(state.time / study.delay) % study.count;
      if (frame === drawn && !state.dirty) return;
      const scale = Math.min(640 / study.width, 640 / study.height);
      const w = study.width * scale, h = study.height * scale;
      context.fillStyle = "#030508"; context.fillRect(0, 0, 640, 640);
      context.drawImage(sheet, frame % 8 * study.width, Math.floor(frame / 8) * study.height, study.width, study.height, (640-w)/2, (640-h)/2, w, h);
      el.dataset.ready = "true";
      drawn = frame; state.dirty = false; onFrame?.(frame);
    }
    raf = requestAnimationFrame(paint);
    return () => { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); };
  }, [study, onFrame]);
  return <div className="scan-media"><div className="scan-poster" style={{ backgroundImage: `url(/${study.file}-poster.webp)` }} aria-hidden="true" /><canvas ref={canvas} className="cine" width={640} height={640} role="img" aria-label={`Genuine de-identified imaging: ${study.title}, ${study.detail}`} /><div className="media-status"><span>{study.title}</span><span>OPEN IMAGING / DEMO</span></div><div className="scan-beam" aria-hidden="true" /><a className="image-credit" href={`https://commons.wikimedia.org/wiki/File:${study.source}`} target="_blank" rel="noreferrer">{study.credit}</a></div>;
}

export function ImagingViewer() {
  const { paused } = useContext(Motion);
  const [modality, setModality] = useState<Modality>("MRI");
  const [stopped, setStopped] = useState(false);
  const [frame, setFrame] = useState(0);
  const [requested, setRequested] = useState<number>();
  const updateFrame = useCallback((value: number) => setFrame(value), []);
  const study = scans[modality];
  return <div className="viewer-shell" aria-label="Interactive genuine medical imaging demonstration"><div className="viewer-toolbar"><span>IMAGING EXPLORER</span><span className="signal-dot" aria-hidden="true" /></div><div className="viewer-image"><Cine modality={modality} stopped={stopped} requestedFrame={requested} onFrame={updateFrame} /></div><div className="viewer-controls"><div className="viewer-modality" role="group" aria-label="Select imaging modality">{(["CT", "MRI", "PET"] as const).map(m => <button key={m} type="button" aria-pressed={modality === m} onClick={() => { setModality(m); setFrame(0); setRequested(undefined); }}>{m}</button>)}</div><button type="button" onClick={() => { setStopped(!stopped); setRequested(undefined); }} disabled={paused} aria-pressed={stopped || paused}>{paused ? "Motion paused" : stopped ? "▶ Play scan" : "Ⅱ Pause scan"}</button></div><div className="frame-control"><label htmlFor="scan-frame">Explore frames</label><input id="scan-frame" type="range" min={0} max={study.count - 1} value={frame} aria-valuetext={`Frame ${frame + 1} of ${study.count}`} onChange={e => { const value = Number(e.target.value); setFrame(value); setRequested(value); setStopped(true); }} /><output htmlFor="scan-frame">{String(frame + 1).padStart(2, "0")} / {study.count}</output></div><p className="viewer-caption">{study.detail}</p></div>;
}
