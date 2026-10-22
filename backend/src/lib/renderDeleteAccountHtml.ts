function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Public account-deletion instructions for Google Play / web visitors. */
export function renderDeleteAccountHtml(options?: {
  privacyUrl?: string;
  supportEmail?: string;
}): string {
  const privacyUrl = options?.privacyUrl ?? "/privacy";
  const supportEmail = options?.supportEmail ?? "privacy@cardweave.app";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Delete your Cardweave account</title>
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
    h2 {
      margin: 1.75rem 0 0.5rem;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .meta { color: #5b6b63; font-size: 0.95rem; }
    p, li { margin: 0 0 0.75rem; }
    ol { padding-left: 1.25rem; }
    a { color: #0f3d2e; }
    nav { margin-top: 2.5rem; font-size: 0.95rem; }
  </style>
</head>
<body>
  <main>
    <header>
      <a class="brand" href="/">Cardweave</a>
      <h1>Delete your account</h1>
      <p class="meta">Cardweave · package com.cardweave.app</p>
    </header>

    <p>
      You can permanently delete your Cardweave account and associated study data
      (decks, flashcards, review history, and progress) at any time.
    </p>

    <h2>Delete from the Cardweave app (recommended)</h2>
    <ol>
      <li>Open Cardweave and sign in.</li>
      <li>Go to <strong>Profile → Settings</strong>.</li>
      <li>Tap <strong>Delete account</strong> and confirm.</li>
    </ol>
    <p>
      This removes your study data from our servers and closes your
      authentication account. The change is permanent.
    </p>

    <h2>Delete without the app</h2>
    <p>
      Email
      <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>
      from the address on your Cardweave account and request deletion.
      We process requests within 30 days.
    </p>

    <h2>What we delete</h2>
    <p>
      Profile information stored for Cardweave, decks, flashcards, spaced-repetition
      scheduling, streaks, and study session history. Authentication records are
      removed via our identity provider (Clerk). Backups may retain residual copies
      for a limited period before rotation.
    </p>

    <nav>
      <a href="${escapeHtml(privacyUrl)}">Privacy Policy</a>
      ·
      <a href="/terms">Terms of Service</a>
    </nav>
  </main>
</body>
</html>`;
}
