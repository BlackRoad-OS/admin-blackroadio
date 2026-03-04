import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Minimal Cloudflare Worker shim ──────────────────────────────────────────
// The worker expects a Request with `cf` property, a URL, and an `env` object.
function makeRequest(path, method = "GET") {
  return {
    method,
    url: `https://admin.blackroad.io${path}`,
    cf: { colo: "DFW" },
  };
}

// Import the worker module
let worker;

before(async () => {
  // Dynamic import so the module loads fresh
  worker = await import("../src/index.js");
});

// ── Worker Route Tests ──────────────────────────────────────────────────────

describe("Cloudflare Worker — src/index.js", () => {
  describe("OPTIONS (CORS preflight)", () => {
    it("returns CORS headers with 200", async () => {
      const req = makeRequest("/", "OPTIONS");
      const res = await worker.default.fetch(req, {});
      assert.equal(res.status, 200);
      assert.equal(
        res.headers.get("Access-Control-Allow-Origin"),
        "*"
      );
      assert.equal(
        res.headers.get("Access-Control-Allow-Methods"),
        "GET, POST, OPTIONS"
      );
    });
  });

  describe("GET /health", () => {
    it("returns JSON with status ok", async () => {
      const req = makeRequest("/health");
      const res = await worker.default.fetch(req, {});
      const body = JSON.parse(await res.text());
      assert.equal(res.status, 200);
      assert.equal(body.status, "ok");
      assert.equal(body.region, "DFW");
      assert.ok(body.timestamp);
    });

    it("uses env.WORKER_NAME when provided", async () => {
      const req = makeRequest("/health");
      const res = await worker.default.fetch(req, {
        WORKER_NAME: "custom-worker",
      });
      const body = JSON.parse(await res.text());
      assert.equal(body.worker, "custom-worker");
    });

    it("falls back to default worker name", async () => {
      const req = makeRequest("/health");
      const res = await worker.default.fetch(req, {});
      const body = JSON.parse(await res.text());
      assert.equal(body.worker, "blackroad-worker");
    });

    it("includes security headers", async () => {
      const req = makeRequest("/health");
      const res = await worker.default.fetch(req, {});
      assert.equal(res.headers.get("X-Frame-Options"), "DENY");
      assert.equal(res.headers.get("X-Content-Type-Options"), "nosniff");
      assert.ok(res.headers.get("Strict-Transport-Security"));
      assert.ok(res.headers.get("Content-Security-Policy"));
    });
  });

  describe("GET /robots.txt", () => {
    it("returns text/plain with Disallow /api/", async () => {
      const req = makeRequest("/robots.txt");
      const res = await worker.default.fetch(req, {});
      const text = await res.text();
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("Content-Type"), "text/plain");
      assert.ok(text.includes("User-agent: *"));
      assert.ok(text.includes("Disallow: /api/"));
    });
  });

  describe("GET /", () => {
    it("returns HTML with 200", async () => {
      const req = makeRequest("/");
      const res = await worker.default.fetch(req, {});
      const body = await res.text();
      assert.equal(res.status, 200);
      assert.ok(
        res.headers.get("Content-Type").includes("text/html")
      );
      assert.ok(body.includes("BlackRoad OS"));
    });

    it("includes security headers", async () => {
      const req = makeRequest("/");
      const res = await worker.default.fetch(req, {});
      assert.equal(res.headers.get("X-Frame-Options"), "DENY");
      assert.equal(
        res.headers.get("Permissions-Policy"),
        "camera=(), microphone=(), geolocation=()"
      );
    });
  });

  describe("GET /nonexistent", () => {
    it("returns 404 JSON", async () => {
      const req = makeRequest("/nonexistent");
      const res = await worker.default.fetch(req, {});
      const body = JSON.parse(await res.text());
      assert.equal(res.status, 404);
      assert.equal(body.error, "not_found");
      assert.equal(body.path, "/nonexistent");
    });
  });
});

// ── Static HTML Tests ───────────────────────────────────────────────────────

describe("Static Site — index.html", () => {
  let html;

  before(async () => {
    html = await readFile(join(ROOT, "index.html"), "utf-8");
  });

  it("is valid HTML5 (has doctype and lang)", () => {
    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes('lang="en"'));
  });

  it("has required meta tags", () => {
    assert.ok(html.includes('charset="UTF-8"'));
    assert.ok(html.includes("viewport"));
  });

  it("has a title", () => {
    assert.match(html, /<title>.+<\/title>/);
  });

  it("shows operational status", () => {
    assert.ok(html.includes("Operational"));
  });

  it("links to blackroad.io", () => {
    assert.ok(html.includes("https://blackroad.io"));
  });
});

// ── Brand Compliance Tests ──────────────────────────────────────────────────

describe("Brand Compliance", () => {
  const FORBIDDEN_COLORS = [
    "#FF9D00",
    "#FF6B00",
    "#FF0066",
    "#FF006B",
    "#D600AA",
    "#7700FF",
    "#0066FF",
  ];

  const FILES_TO_CHECK = ["index.html", "styles.css", "src/index.js"];

  for (const file of FILES_TO_CHECK) {
    it(`${file} contains no forbidden colors`, async () => {
      const content = await readFile(join(ROOT, file), "utf-8");
      for (const color of FORBIDDEN_COLORS) {
        assert.ok(
          !content.includes(color),
          `Found forbidden color ${color} in ${file}`
        );
      }
    });
  }

  it("worker HTML uses official BlackRoad gradient colors", async () => {
    const content = await readFile(join(ROOT, "src/index.js"), "utf-8");
    assert.ok(content.includes("#F5A623"), "Missing Amber #F5A623");
    assert.ok(content.includes("#FF1D6C"), "Missing Hot Pink #FF1D6C");
    assert.ok(content.includes("#9C27B0"), "Missing Violet #9C27B0");
    assert.ok(content.includes("#2979FF"), "Missing Electric Blue #2979FF");
  });
});

// ── styles.css Tests ────────────────────────────────────────────────────────

describe("Stylesheet — styles.css", () => {
  let css;

  before(async () => {
    css = await readFile(join(ROOT, "styles.css"), "utf-8");
  });

  it("defines official color variables", () => {
    assert.ok(css.includes("--amber: #F5A623"));
    assert.ok(css.includes("--pink: #FF1D6C"));
    assert.ok(css.includes("--blue: #2979FF"));
  });

  it("sets black background", () => {
    assert.ok(css.includes("background: #000"));
  });
});
