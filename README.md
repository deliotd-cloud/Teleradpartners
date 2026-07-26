# Telerad Partners

Production website for [teleradpartners.com](https://teleradpartners.com), built with Next.js-compatible Vinext and designed for Cloudflare Workers.

## Included

- Responsive, cinematic single-page experience
- Preserved Telerad Partners logo and brand palette
- Genuine open-license spine MRI, whole-body PET/CT, prostate MRI and fracture radiographs
- Procedurally generated CT, MRI and PET imaging demo (no patient data)
- Interactive slice controls and CT viewing presets
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
```

## Deployment

The project is configured for OpenAI Sites / Cloudflare Worker-compatible hosting. Publishing through Sites builds and deploys the exact committed source.

GitHub remains the source repository. If the domain currently points to another host, update the DNS records only after the new production preview has been approved. Keep the existing host live until the DNS change has propagated.

## Before connecting the main domain

1. Connect the contact form to the organisation's confirmed inbox or form endpoint.
2. Confirm the existing public service statements and 24/7/365 wording.
3. Add the production domain to the hosting project and apply the returned DNS records.

The imaging viewer is deliberately labelled as illustrative and procedurally generated. It contains no patient data and is not a diagnostic viewer.

The service-card imaging is genuine clinical material. Full source and commercial-reuse licence details are recorded in `IMAGING_CREDITS.md` and displayed in the website footer.
