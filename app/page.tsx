"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

type Modality = "CT" | "MRI" | "PET";

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

const viewerStudies = {
  CT: {
    src: "/viewer-ct.gif",
    alt: "Genuine animated axial CT sequence of the human head",
    label: "CT HEAD · AXIAL CINE",
    frames: "51 slices",
    credit: "Tafkas · CC BY-SA 3.0",
  },
  MRI: {
    src: "/viewer-mri.gif",
    alt: "Genuine animated T1-weighted axial MRI sequence of a normal brain",
    label: "MRI BRAIN · T1 AXIAL",
    frames: "37 slices",
    credit: "Dr Laurent Hermoye · CC BY-SA 2.5",
  },
  PET: {
    src: "/viewer-pet.gif",
    alt: "Genuine animated whole-body FDG PET maximum intensity projection",
    label: "FDG PET · WHOLE-BODY MIP",
    frames: "32 projections",
    credit: "Jens Maus · Public domain",
  },
} as const;

function ImagingViewer() {
  const [modality, setModality] = useState<Modality>("MRI");
  const [replay, setReplay] = useState(0);
  const study = viewerStudies[modality];

  return (
    <div className="viewer-shell" aria-label="Interactive genuine medical imaging demonstration">
      <div className="viewer-toolbar">
        <div className="viewer-modality" aria-label="Select imaging modality">
          {(["CT", "MRI", "PET"] as const).map((item) => (
            <button
              className={item === modality ? "is-active" : ""}
              type="button"
              aria-pressed={item === modality}
              onClick={() => {
                setModality(item);
                setReplay((current) => current + 1);
              }}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="live-status"><i aria-hidden="true" /> GENUINE CINE</span>
      </div>

      <div className="viewport">
        <Image
          key={`${modality}-${replay}`}
          src={study.src}
          alt={study.alt}
          fill
          unoptimized
          sizes="(max-width: 820px) 100vw, 38rem"
        />
        <div className="crosshair crosshair-x" aria-hidden="true" />
        <div className="crosshair crosshair-y" aria-hidden="true" />
        <div className="scan-sweep" aria-hidden="true" />
        <div className="viewport-data viewport-data-top">
          <span>TELERAD / OPEN CINE</span>
          <span>{study.label}</span>
        </div>
        <div className="viewport-data viewport-data-bottom">
          <span>Genuine de-identified imaging</span>
          <span>{study.frames}</span>
        </div>
        <div className="image-credit">
          {study.credit}
        </div>
      </div>

      <div className="viewer-controls">
        <button
          className="play-button"
          type="button"
          onClick={() => setReplay((current) => current + 1)}
          aria-label="Replay scan animation"
        >
          ↻
        </button>
        <div className="cine-track" aria-hidden="true"><i key={`${modality}-${replay}`} /></div>
        <span className="slice-count">{study.frames}</span>
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
          <Image src="/telerad-logo.png" width="1114" height="748" alt="" priority />
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
            <h1>Making Medicine <em>Global</em></h1>
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
              Explore genuine open-license CT, MRI and PET cine sequences. Switch modality to see real scan slices
              and whole-body molecular imaging in motion.
            </p>
            <div className="viewer-disclaimer">
              <b aria-hidden="true">i</b>
              <span>These are genuine de-identified clinical images presented for demonstration. This is not a diagnostic viewer.</span>
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
          <Image src="/telerad-logo.png" width="1114" height="748" alt="" />
          <div><span>Making Medicine Global</span></div>
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
            <p>
              Animated head CT — Tafkas,
              {" "}<a href="https://commons.wikimedia.org/wiki/File:Schaedel-CT.gif" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
              {" "}<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>.
            </p>
            <p>
              Animated T1 brain MRI — Dr Laurent Hermoye / Imagilys,
              {" "}<a href="https://commons.wikimedia.org/wiki/File:Brain_MRI_T1_movie.gif" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
              {" "}<a href="https://creativecommons.org/licenses/by-sa/2.5/" target="_blank" rel="noreferrer">CC BY-SA 2.5</a>.
            </p>
            <p>
              Animated whole-body FDG PET — Jens Maus,
              {" "}<a href="https://commons.wikimedia.org/wiki/File:PET-MIPS-anim.gif" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
              {" "}public domain.
            </p>
            <p>Images are displayed with responsive web cropping. Licensors do not endorse Telerad Partners.</p>
          </div>
        </details>
      </footer>
    </>
  );
}
