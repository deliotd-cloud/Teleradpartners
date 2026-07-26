import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished Telerad Partners homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Telerad Partners \| Global Teleradiology Reporting<\/title>/i);
  assert.match(html, /Making medicine/);
  assert.match(html, /Subspecialty imaging/);
  assert.match(html, /Global coverage/);
  assert.match(html, /Interactive synthetic medical imaging demonstration/);
  assert.match(html, /Genuine scan ·[\s\S]*?CC0/);
  assert.match(html, /Genuine scan ·[\s\S]*?CC BY 4\.0/);
  assert.match(html, /Clinical image credits and licences/);
  assert.match(html, /telerad-logo\.png/);
  assert.match(html, /Skip to main content/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships production metadata and project assets", async () => {
  const [layout, page, css, packageJson] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /metadataBase:\s*new URL\("https:\/\/teleradpartners\.com"\)/);
  assert.match(layout, /images:\s*\["\/og\.png"\]/);
  assert.match(layout, /themeColor:\s*"#03111d"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(page, /Illustrative synthetic imaging/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/telerad-logo.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/imaging-spine-mri.jpg", import.meta.url)),
    access(new URL("../public/imaging-oncology-petct.jpg", import.meta.url)),
    access(new URL("../public/imaging-prostate-mri.jpg", import.meta.url)),
    access(new URL("../public/imaging-fracture-xray.jpg", import.meta.url)),
    access(new URL("../IMAGING_CREDITS.md", import.meta.url)),
  ]);

  await assert.rejects(access(new URL("../app/_sites-preview", projectRoot)));
});
