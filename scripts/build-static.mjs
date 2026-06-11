import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public");

const data = JSON.parse(readFileSync(join(root, "data", "sample.json"), "utf8"));

Handlebars.registerHelper("equals", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

function render(filePath, context) {
  const template = Handlebars.compile(readFileSync(filePath, "utf8"));
  return template(context);
}

function write(relPath, html) {
  const filePath = join(outDir, relPath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html, "utf8");
}

const lpContext = {
  requestNumber: data.lead.requestNumber,
  inquiryDetails: data.inquiryDetails,
  advisorName: data.advisorName,
};

write("lp/feedback.html", render(join(root, "pages", "feedback-lp.html"), lpContext));
write("lp/reklamation.html", render(join(root, "pages", "reklamation-lp.html"), lpContext));
write("email/neu.html", render(join(root, "templates", "neue-anfrage.html"), data));
write("email/alt.html", render(join(root, "templates", "neue-anfrage-alt.html"), data));

write(
  "index.html",
  `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Rekla-Quote & Lead-Qualität</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #f2f4f7;
      color: #48453b;
    }
    main {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    h1 { color: #98c44c; font-size: 28px; margin: 0 0 12px; }
    p { line-height: 1.6; margin: 0 0 24px; }
    .links { display: grid; gap: 12px; }
    a {
      display: block;
      padding: 16px 20px;
      background: #fff;
      border: 1px solid #d1d9e0;
      border-radius: 6px;
      color: #4c8ba5;
      text-decoration: none;
      font-weight: bold;
    }
    a:hover { border-color: #4c8ba5; }
    .hint {
      margin-top: 32px;
      font-size: 13px;
      color: #6b6b6b;
    }
  </style>
</head>
<body>
  <main>
    <h1>Rekla-Quote & Lead-Qualität</h1>
    <p>Demo und Vorschau der E-Mail- und Landingpage-Änderungen.</p>
    <div class="links">
      <a href="lp/feedback.html?from=email">Neue Version – Feedback-Seite</a>
      <a href="lp/reklamation.html">Alte Version – Reklamations-Seite</a>
      <a href="email/neu.html">E-Mail – Neu</a>
      <a href="email/alt.html">E-Mail – Alt</a>
    </div>
    <p class="hint">Lokale Entwicklung mit Live-Vorschau: <code>npm run dev</code></p>
  </main>
</body>
</html>`
);

console.log("Statische Seiten erstellt in public/");
