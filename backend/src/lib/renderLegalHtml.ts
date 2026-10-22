import type { LegalDocument } from "../content/legal";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal public legal page for Play Console / in-app HTTPS links. */
export function renderLegalHtml(doc: LegalDocument): string {
  const sections = doc.sections
    .map((section) => {
      const body = section.paragraphs
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join("\n");
      return `<section><h2>${escapeHtml(section.title)}</h2>\n${body}</section>`;
    })
    .join("\n");

  const other =
    doc.slug === "privacy"
      ? `<a href="/terms">Terms of Service</a>`
      : `<a href="/privacy">Privacy Policy</a>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(doc.title)} · Cardweave</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #14201b;
      background: #f6f4ef;
    }
    main {
      max-width: 42rem;
      margin: 0 auto;
      padding: 2.5rem 1.25rem 4rem;
    }
    header { margin-bottom: 2rem; }
    .brand {
      font-weight: 700;
      letter-spacing: -0.02em;
      font-size: 1.125rem;
      color: #0f3d2e;
      text-decoration: none;
    }
    h1 {
      margin: 0.75rem 0 0.35rem;
      font-size: 2rem;
      letter-spacing: -0.03em;
    }
    .meta { color: #5b6b63; font-size: 0.95rem; }
    section { margin-top: 1.75rem; }
    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    p { margin: 0 0 0.75rem; }
    nav { margin-top: 2.5rem; font-size: 0.95rem; }
    a { color: #0f3d2e; }
  </style>
</head>
<body>
  <main>
    <header>
      <a class="brand" href="/">Cardweave</a>
      <h1>${escapeHtml(doc.title)}</h1>
      <p class="meta">Last updated ${escapeHtml(doc.lastUpdated)}</p>
    </header>
    <p>${escapeHtml(doc.intro)}</p>
    ${sections}
    <nav>${other}</nav>
  </main>
</body>
</html>`;
}
