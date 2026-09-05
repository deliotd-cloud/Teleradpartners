# Telerad Partners

Production website for [teleradpartners.com](https://teleradpartners.com), built with Next.js and deployed automatically to GitHub Pages.

## Included

- Monolith design: full-screen scan triptych, oversized typography and a skippable curtain entrance
- Preserved Telerad Partners logo and brand palette
- Genuine open-license spine MRI, whole-body PET/CT, prostate MRI and fracture radiographs
- Genuine open-license CT, MRI and PET cine sequences in both viewer locations
- Actual source-frame playback, modality switching, pause and frame-by-frame selection
- Global motion toggle; reduced-motion preferences bypass the entrance and pause scan autoplay
- Contact form opens a pre-filled email to eliviontechnologies@gmail.com for the visitor to review and send
- Animated reporting workflow and global-coverage visual
- Accessible keyboard navigation and reduced-motion support
- SEO metadata, canonical URL, sitemap, robots rules and social preview

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Production validation

```bash
npm run lint
npm run build
GITHUB_PAGES=true npm run build:pages
```

## Deployment

Every push to `main` runs `.github/workflows/deploy-pages.yml`, creates a static production export and deploys it to GitHub Pages.

Enable GitHub Pages with **GitHub Actions** as its source under **Settings → Pages**, then set the custom domain to `teleradpartners.com`.

For the apex domain, replace the previous website-hosting records with GitHub Pages’ four `A` records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Keep all email-related MX and TXT records. Add a `www` CNAME pointing to `deliotd-cloud.github.io` if the `www` variant should redirect to the apex domain. Enable **Enforce HTTPS** when GitHub makes the option available.

## Contact and content

The confirmed enquiry address is eliviontechnologies@gmail.com. The form uses `mailto:` and opens the visitor's email app; the visitor must send the email there. It does not submit to a server or claim that an enquiry was delivered. A direct email link is also available. Server-side delivery would require a separate form service or backend.

Keep the existing public service statements and 24/7/365 wording aligned with the organisation's actual offering.

Monolith styles are in `app/monolith.css`, and the entrance, motion controls and imaging player are in `app/monolith.tsx`. The entrance runs once per browser tab session unless replayed, and is bypassed for reduced-motion visitors and direct section links. Static scan posters remain available while the canvas player loads or if JavaScript is disabled.

The imaging viewer uses genuine, de-identified clinical sequences sourced under commercial-compatible open licences. It is clearly labelled as a demonstration and is not a diagnostic viewer.

The service-card imaging is genuine clinical material. Full source and commercial-reuse licence details are recorded in `IMAGING_CREDITS.md` and displayed in the website footer.
