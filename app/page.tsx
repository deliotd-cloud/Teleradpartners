"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Modality = "CT" | "MRI" | "PET";
type ViewerPreset = "Soft tissue" | "Bone";

const services = [
  {
    code: "MSK",
    title: "Musculoskeletal Imaging",
    text: "Detailed reporting of joint, spine and soft-tissue studies — from sports injuries to complex orthopaedic pathology.",
    image: "/imaging-spine-mri.jpg",
    alt: "Genuine sagittal T2-weighted MRI of the lumbar spine",
    licence: "CC0",
  },
  {
    code: "ONC",
    title: "Oncology Imaging",
    text: "Staging, surveillance and treatment-response reporting to support confident oncology decision-making.",
    image: "/imaging-oncology-petct.jpg",
    alt: "Genuine whole-body PET/CT study with diffuse metastatic disease",
    licence: "CC BY 3.0",
  },
  {
    code: "URO",
    title: "Urology Imaging",
    text: "Renal, pelvic and genitourinary studies reported with attention to the detail urology teams rely on.",
    image: "/imaging-prostate-mri.jpg",
    alt: "Genuine multiparametric prostate MRI showing T2, ADC, perfusion and prediction-map panels",
    licence: "CC BY 4.0",
  },
  {
    code: "ACU",
    title: "Acute Imaging",
    text: "Priority reporting for emergency and inpatient studies, built around urgency and rapid response.",
    image: "/imaging-fracture-xray.jpg",
    alt: "Genuine wrist radiographs showing a Colles fracture",
    licence: "CC BY 3.0",
  },
] as const;

const reasons = [
  {
    number: "01",
    title: "Subspecialty-matched radiologists",
    text: "Studies are routed to radiologists whose training matches the clinical question.",
  },
  {
    number: "02",
    title: "Global, follow-the-sun model",
    text: "A distributed network of reporting radiologists supports continuous coverage.",
  },
  {
    number: "03",
    title: "Built for partnership",
    text: "Flexible reporting arrangements designed around your department's workflow.",
  },
  {
    number: "04",
    title: "Quality-first process",
    text: "Consistent reporting standards and communication across every study.",
  },
] as const;

const trustPoints = [
  ["SUB", "Subspecialist Reporting", "Reads performed by radiologists trained in the relevant subspecialty, not general coverage."],
  ["24H", "Round-the-Clock Coverage", "A global roster of radiologists spanning time zones for 24/7/365 turnaround."],
  ["SEC", "Secure & Compliant", "Encrypted image transfer and reporting workflows built around data protection standards."],
  ["TAT", "Fast Turnaround", "Streamlined workflows designed to get accurate reports back to you quickly."],
] as const;

const workflow = [
  ["01", "Study received", "Images enter the secure reporting workflow."],
  ["02", "Expert matched", "The study is routed by clinical requirement."],
  ["03", "Human review", "A subspecialist radiologist reviews the imaging."],
  ["04", "Report returned", "The verified report goes back to the clinical team."],
] as const;

function seededNoise(x: number, y: number, seed: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

function drawSyntheticScan(
  canvas: HTMLCanvasElement,
  modality: Modality,
  slice: number,
  preset: ViewerPreset,
) {
  const size = 420;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;
  const image = ctx.createImageData(size, size);
  const phase = (slice / 95) * Math.PI * 2;
  const sliceScale = 0.84 + Math.sin((slice / 95) * Math.PI) * 0.13;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const nx = (x - size / 2) / (size * 0.39 * sliceScale);
      const ny = (y - size / 2) / (size * 0.455 * sliceScale);
      const radius = Math.sqrt(nx * nx + ny * ny);
      const noise = seededNoise(x, y, slice) - 0.5;
      let red = 2;
      let green = 9;
      let blue = 15;

      if (radius < 1) {
        const ventricleA = ((nx + 0.105) / 0.12) ** 2 + ((ny + 0.03) / 0.19) ** 2 < 1;
        const ventricleB = ((nx - 0.105) / 0.12) ** 2 + ((ny + 0.03) / 0.19) ** 2 < 1;
        const tissueWave = Math.sin(nx * 24 + phase) * 6 + Math.cos(ny * 29 - phase) * 5;

        if (modality === "CT") {
          let density = preset === "Bone" ? 40 : 72;
          density += noise * (preset === "Bone" ? 34 : 22) + tissueWave;
          if (radius > 0.86) density = preset === "Bone" ? 244 : 188;
          if (radius > 0.8 && radius <= 0.86) density = 28;
          if (ventricleA || ventricleB) density = 24 + noise * 5;
          const calcification = (nx + 0.3) ** 2 + (ny - 0.18) ** 2 < 0.0035;
          if (calcification) density = 220;
          red = green = blue = Math.max(0, Math.min(255, density));
        } else if (modality === "MRI") {
          let density = 88 + noise * 42 + tissueWave * 1.6;
          const whiteMatter = (nx / 0.65) ** 2 + ((ny + 0.02) / 0.72) ** 2 < 1;
          if (whiteMatter) density += 38;
          if (radius > 0.9) density = 18 + noise * 8;
          if (ventricleA || ventricleB) density = 8 + noise * 3;
          red = density * 0.93;
          green = density * 0.98;
          blue = density * 1.06;
        } else {
          const spots = [
            [0.0, -0.2, 0.2, 1.0],
            [-0.32, 0.12, 0.16, 0.7],
            [0.35, 0.15, 0.18, 0.78],
            [0.05, 0.48, 0.13, 0.65],
          ] as const;
          let heat = 0.05;
          for (const [sx, sy, spread, intensity] of spots) {
            const distance = (nx - sx) ** 2 + (ny - sy) ** 2;
            heat += Math.exp(-distance / (spread * spread)) * intensity;
          }
          heat = Math.min(1, heat + noise * 0.08);
          red = Math.min(255, heat * 390);
          green = Math.min(255, Math.max(0, (heat - 0.2) * 310));
          blue = Math.min(255, Math.max(12, (0.62 - heat) * 220));
        }
      }

      image.data[i] = Math.max(0, Math.min(255, red));
      image.data[i + 1] = Math.max(0, Math.min(255, green));
      image.data[i + 2] = Math.max(0, Math.min(255, blue));
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const vignette = ctx.createRadialGradient(210, 210, 80, 210, 210, 300);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,8,16,.72)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);
}

function ImagingViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modality, setModality] = useState<Modality>("MRI");
  const [slice, setSlice] = useState(48);
  const [playing, setPlaying] = useState(true);
  const [preset, setPreset] = useState<ViewerPreset>("Soft tissue");

  useEffect(() => {
    if (!canvasRef.current) return;
    drawSyntheticScan(canvasRef.current, modality, slice, preset);
  }, [modality, slice, preset]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSlice((current) => (current >= 95 ? 0 : current + 1));
    }, 110);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className="viewer-shell" aria-label="Interactive synthetic medical imaging demonstration">
      <div className="viewer-toolbar">
        <div className="viewer-modality" aria-label="Select imaging modality">
          {(["CT", "MRI", "PET"] as const).map((item) => (
            <button
              className={item === modality ? "is-active" : ""}
              type="button"
              aria-pressed={item === modality}
              onClick={() => setModality(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="live-status"><i aria-hidden="true" /> DEMO SERIES</span>
      </div>

      <div className="viewport">
        <canvas ref={canvasRef} aria-label={`${modality} synthetic axial scan, slice ${slice + 1} of 96`} />
        <div className="crosshair crosshair-x" aria-hidden="true" />
        <div className="crosshair crosshair-y" aria-hidden="true" />
        <div className="scan-sweep" aria-hidden="true" />
        <div className="viewport-data viewport-data-top">
          <span>TELERAD / DEMO</span>
          <span>{modality} AXIAL</span>
        </div>
        <div className="viewport-data viewport-data-bottom">
          <span>Illustrative synthetic imaging</span>
          <span>SL {String(slice + 1).padStart(2, "0")} / 96</span>
        </div>
      </div>

      <div className="viewer-controls">
        <button
          className="play-button"
          type="button"
          onClick={() => setPlaying((current) => !current)}
          aria-label={playing ? "Pause scan animation" : "Play scan animation"}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>
        <label>
          <span className="sr-only">Imaging slice</span>
          <input
            type="range"
            min="0"
            max="95"
            value={slice}
            onChange={(event) => {
              setPlaying(false);
              setSlice(Number(event.target.value));
            }}
          />
        </label>
        <span className="slice-count">{String(slice + 1).padStart(2, "0")} / 96</span>
      </div>

      <div className="viewer-footer">
        <span>Window preset</span>
        <div>
          {(["Soft tissue", "Bone"] as const).map((item) => (
            <button
              type="button"
              aria-pressed={preset === item}
              className={preset === item ? "is-active" : ""}
              onClick={() => setPreset(item)}
              key={item}
              disabled={modality !== "CT"}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("Thank you. The contact delivery endpoint is ready to be connected before launch.");
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="Telerad Partners home">
          <Image src="/telerad-logo.png" width="48" height="48" alt="" priority />
          <span>Telerad <b>Partners</b></span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#viewer">Imaging demo</a>
          <a href="#why-us">Why us</a>
          <a href="#coverage">Global coverage</a>
        </nav>
        <a className="header-cta" href="#contact">Start a conversation <span aria-hidden="true">↗</span></a>
        <button
          className="menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span /><span />
        </button>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {[
              ["Services", "#services"],
              ["Imaging demo", "#viewer"],
              ["Why us", "#why-us"],
              ["Global coverage", "#coverage"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </nav>
        )}
      </header>

      <main id="main">
        <section className="hero" id="home">
          <div className="ambient-grid" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow"><span /> Global Teleradiology Reporting</p>
            <h1>Making medicine <em>global.</em></h1>
            <p className="hero-lede">
              Telerad Partners connects hospitals and imaging centres with subspecialist radiologists for accurate,
              timely reporting across musculoskeletal, oncology, urology and acute imaging — backed by a global
              network built for round-the-clock coverage.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#services">Explore our services <span aria-hidden="true">↓</span></a>
              <a className="button button-secondary" href="#contact">Contact us <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-proof" aria-label="Service overview">
              <div><strong>24 / 7 / 365</strong><span>Global coverage model</span></div>
              <div><strong>4</strong><span>Core reporting areas</span></div>
              <div><strong>1</strong><span>Connected partnership</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="orbit orbit-one" aria-hidden="true" />
            <div className="orbit orbit-two" aria-hidden="true" />
            <ImagingViewer />
            <div className="floating-note note-top" aria-hidden="true">
              <span>STUDY STATUS</span>
              <strong>Ready for review</strong>
            </div>
            <div className="floating-note note-bottom" aria-hidden="true">
              <span>ROUTING</span>
              <strong>Subspecialty matched</strong>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Telerad Partners service strengths">
          {trustPoints.map(([code, title, text]) => (
            <article key={title}>
              <span className="trust-code">{code}</span>
              <div><h2>{title}</h2><p>{text}</p></div>
            </article>
          ))}
        </section>

        <section className="section services-section" id="services">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> What we report</p>
              <h2>Subspecialty imaging <em>coverage.</em></h2>
            </div>
            <p>Focused expertise across the areas that demand it most.</p>
          </div>
          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.title}>
                <div className={`service-image service-image-${index + 1}`}>
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1150px) 50vw, 25vw"
                  />
                  <span className="service-modality">{service.code}</span>
                  <span className="scan-badge">Genuine scan · {service.licence}</span>
                  <i />
                </div>
                <div className="service-content">
                  <span className="service-number">0{index + 1}</span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section viewer-section" id="viewer">
          <div className="viewer-copy">
            <p className="eyebrow"><span /> Interactive imaging</p>
            <h2>A familiar workflow, <em>reimagined for the web.</em></h2>
            <p>
              Explore a synthetic, anonymised-style imaging series. Switch modality, move through slices and adjust
              the CT window preset — a concise demonstration of the medical-imaging language behind the service.
            </p>
            <div className="viewer-disclaimer">
              <b aria-hidden="true">i</b>
              <span>This is an illustrative interface using procedurally generated imagery. It is not a diagnostic viewer.</span>
            </div>
          </div>
          <ImagingViewer />
        </section>

        <section className="section workflow-section" aria-labelledby="workflow-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> Connected workflow</p>
              <h2 id="workflow-title">From study to <em>verified report.</em></h2>
            </div>
            <p>A clear route from imaging acquisition to clinical review.</p>
          </div>
          <div className="workflow">
            <div className="workflow-line" aria-hidden="true"><i /></div>
            {workflow.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <div className="workflow-node" aria-hidden="true"><i /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section why-section" id="why-us">
          <div className="why-intro">
            <p className="eyebrow"><span /> Why Telerad Partners</p>
            <h2>Reporting you can build a <em>service around.</em></h2>
            <p>
              Designed to work as an extension of your team, with the specialist focus and operational consistency
              modern imaging services need.
            </p>
            <a href="#contact">Discuss your reporting needs <span aria-hidden="true">↗</span></a>
          </div>
          <div className="reason-list">
            {reasons.map((reason) => (
              <article key={reason.number}>
                <span>{reason.number}</span>
                <div><h3>{reason.title}</h3><p>{reason.text}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="coverage-section" id="coverage">
          <div className="coverage-copy">
            <p className="eyebrow"><span /> Global coverage</p>
            <h2>Reporting across time zones, <em>without the gaps.</em></h2>
            <p>
              Our network of subspecialist radiologists spans multiple regions, allowing studies to be picked up and
              reported around the clock — so your department isn&apos;t limited by a single time zone or on-call rota.
            </p>
            <div className="coverage-stat"><strong>24</strong><span>/ 7 / 365<br />coverage model</span></div>
          </div>
          <div className="radar" aria-label="Animated illustration of global coverage">
            <div className="radar-grid" aria-hidden="true" />
            <div className="radar-sweep" aria-hidden="true" />
            <span className="radar-point point-one">Americas</span>
            <span className="radar-point point-two">Europe</span>
            <span className="radar-point point-three">Asia Pacific</span>
            <div className="radar-centre" aria-hidden="true"><i /></div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy">
            <p className="eyebrow"><span /> Get in touch</p>
            <h2>Let&apos;s talk about your <em>reporting needs.</em></h2>
            <p>Tell us about your department and we&apos;ll get back to you.</p>
            <div className="operations-card">
              <span>RADIOLOGY OPERATIONS</span>
              <strong><i /> Online</strong>
              <p>Secure workflows · Global coverage · Built for partnership</p>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleContact}>
            <div className="field-row">
              <label>Name<input name="name" type="text" autoComplete="name" required /></label>
              <label>Email<input name="email" type="email" autoComplete="email" required /></label>
            </div>
            <label>Organisation<input name="organisation" type="text" autoComplete="organization" required /></label>
            <label>Message<textarea name="message" rows={5} required /></label>
            <button className="button button-primary" type="submit">Send message <span aria-hidden="true">↗</span></button>
            <p className="form-status" role="status" aria-live="polite">{formMessage}</p>
          </form>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <Image src="/telerad-logo.png" width="64" height="64" alt="" />
          <div><strong>Telerad Partners</strong><span>Making Medicine Global</span></div>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#services">Services</a>
          <a href="#viewer">Imaging demo</a>
          <a href="#why-us">Why us</a>
          <a href="#coverage">Global coverage</a>
          <a href="#contact">Contact</a>
        </nav>
        <p>© 2026 Telerad Partners. All rights reserved.</p>
        <details className="imaging-credits">
          <summary>Clinical image credits and licences</summary>
          <div>
            <p>
              Lumbar spine MRI — Stillwaterising,
              {" "}<a href="https://commons.wikimedia.org/wiki/File:Lumbar_MRI_t2-tse-rst-sagittal_10.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
              {" "}CC0.
            </p>
            <p>
              Whole-body PET/CT with diffuse metastases — Myohan,
              {" "}<a href="https://commons.wikimedia.org/wiki/File:Abnl_petct.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
              {" "}<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>.
            </p>
            <p>
              Multiparametric prostate MRI — Shijun Wang et al.,
              {" "}<a href="https://commons.wikimedia.org/wiki/File:Prostata_RM_multiparametrica.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
              {" "}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.
            </p>
            <p>
              Colles fracture radiographs — Ashish j29,
              {" "}<a href="https://commons.wikimedia.org/wiki/File:Colles_fracture.JPG" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
              {" "}<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>.
            </p>
            <p>Images are displayed with responsive web cropping. Licensors do not endorse Telerad Partners.</p>
          </div>
        </details>
      </footer>
    </>
  );
}
