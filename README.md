# Telerad Partners

Production website for [teleradpartners.com](https://teleradpartners.com), built with Next.js and deployed automatically to GitHub Pages.

## Included

- Responsive, cinematic single-page experience
- Preserved Telerad Partners logo and brand palette
- Genuine open-license spine MRI, whole-body PET/CT, prostate MRI and fracture radiographs
- Genuine open-license CT, MRI and PET cine sequences in both viewer locations
- Interactive modality switching and replay controls
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
npm run build:pages
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

## Before connecting the main domain

1. Connect the contact form to the organisation's confirmed inbox or form endpoint.
2. Confirm the existing public service statements and 24/7/365 wording.
3. Keep the current host live until GitHub Pages has deployed and the DNS change has propagated.

The imaging viewer uses genuine, de-identified clinical sequences sourced under commercial-compatible open licences. It is clearly labelled as a demonstration and is not a diagnostic viewer.

The service-card imaging is genuine clinical material. Full source and commercial-reuse licence details are recorded in `IMAGING_CREDITS.md` and displayed in the website footer.
