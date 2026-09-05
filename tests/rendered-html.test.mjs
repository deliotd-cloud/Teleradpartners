import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const projectRoot = new URL("../", import.meta.url);

test("splash gate runs before the body, honours bypasses and cannot trap visitors", async () => {
  const html = await (await render()).text();
  const bootstrap = html.match(/<script id="intro-bootstrap">([\s\S]*?)<\/script>/);
  assert.ok(bootstrap, "pre-paint bootstrap must be present in server HTML");
  assert.ok(html.indexOf(bootstrap[0]) < html.indexOf("<body"), "gate must run before visible content");
  function start({ seen = false, reduced = false, hash = "" } = {}) {
    const dataset = {}, events = new Map(), timers = new Map(), stored = new Map();
    vm.runInNewContext(bootstrap[1], {
      document: { documentElement: { dataset }, addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) },
      window: { addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) },
      sessionStorage: { getItem: () => seen ? "seen" : null, setItem: (key, value) => stored.set(key, value) },
      location: { hash }, matchMedia: () => ({ matches: reduced }),
      setTimeout: (fn, delay) => { timers.set(delay, fn); return delay; }, clearTimeout: id => timers.delete(id),
    });
    return { dataset, events, timers, stored };
  }
  const first = start();
  assert.equal(first.dataset.intro, "pending");
  first.events.get("click")({ target: { closest: () => true }, preventDefault() {} });
  assert.equal(first.dataset.intro, "skipped");
  assert.equal(first.stored.get("telerad-monolith-intro"), "seen");
  assert.equal(first.timers.size, 0);
  const escape = start();
  escape.events.get("keydown")({ key: "Escape", preventDefault() {} });
  assert.equal(escape.dataset.intro, "skipped");
  for (const options of [{ seen: true }, { reduced: true }, { hash: "#contact" }]) {
    const bypass = start(options);
    assert.equal(bypass.dataset.intro, undefined);
    assert.equal(bypass.timers.size, 0);
  }
  const failed = start();
  failed.timers.get(6000)();
  assert.equal(failed.dataset.intro, "expired");
  assert.equal(failed.events.size, 0);
  const ready = start();
  ready.dataset.intro = "ready";
  ready.events.get("telerad:intro-ready")();
  assert.equal(ready.timers.size, 0);
  assert.equal(ready.events.size, 0);
});

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
  assert.match(html, /Making Medicine[\s\S]*?Global/);
  assert.match(html, /Subspecialty imaging/);
  assert.match(html, /Global coverage/);
  assert.match(html, /Interactive genuine medical imaging demonstration/);
  assert.match(html, /Genuine de-identified imaging/);
  assert.match(html, /Genuine scan ·[\s\S]*?CC0/);
  assert.match(html, /Genuine scan ·[\s\S]*?CC BY 4\.0/);
  assert.match(html, /Clinical image credits and licences/);
  assert.match(html, /telerad-logo\.png/);
  assert.match(html, /Skip to main content/);
  assert.match(html, /film-triptych/);
  assert.match(html, /aria-valuetext="Frame 1 of 37"/);
  assert.match(html, /mailto:eliviontechnologies@gmail\.com/);
  assert.match(html, /Compose email/);
  assert.doesNotMatch(html, /contact delivery endpoint is ready/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships production metadata and project assets", async () => {
  const [layout, page, css, packageJson] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/monolith.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/monolith.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /metadataBase:\s*new URL\("https:\/\/teleradpartners\.com"\)/);
  assert.match(layout, /images:\s*\["\/og\.png"\]/);
  assert.match(layout, /themeColor:\s*"#03111d"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(page, /Genuine de-identified imaging/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/telerad-logo.png", import.meta.url)),
    access(new URL("../public/telerad-icon.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/imaging-spine-mri.jpg", import.meta.url)),
    access(new URL("../public/imaging-oncology-petct.jpg", import.meta.url)),
    access(new URL("../public/imaging-prostate-mri.jpg", import.meta.url)),
    access(new URL("../public/imaging-fracture-xray.jpg", import.meta.url)),
    access(new URL("../public/viewer-ct.gif", import.meta.url)),
    access(new URL("../public/viewer-mri.gif", import.meta.url)),
    access(new URL("../public/viewer-pet.gif", import.meta.url)),
    ...["ct", "mri", "pet"].flatMap((name) => [
      access(new URL(`../public/${name}-frames.png`, import.meta.url)),
      access(new URL(`../public/${name}-poster.webp`, import.meta.url)),
    ]),
    access(new URL("../IMAGING_CREDITS.md", import.meta.url)),
  ]);

  await assert.rejects(access(new URL("../app/_sites-preview", projectRoot)));
});
