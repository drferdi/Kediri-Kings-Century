import { readFileSync } from "node:fs";
import path from "node:path";

const htmlPath = path.resolve(
  "apps",
  "web",
  ".next",
  "server",
  "app",
  "journey.html",
);
const html = readFileSync(htmlPath, "utf8");

const forbidden = [
  "Naskah editorial untuk peninjauan",
  "/api/editorial-preview/",
];
const leaked = forbidden.filter((marker) => html.includes(marker));

const canonicalSceneOrder = [
  "879-first-mark",
  "921-kadhiri",
  "1015-name-endures",
  "1042-river-divides-kingdom",
  "daha-centre-of-power",
  "1135-panjalu-jayati",
  "1157-words-become-monuments",
  "panji-story-left-kediri",
  "1222-ganter",
  "1292-the-return",
  "1293-last-kingdom",
  "jayabaya-after-jayabaya",
  "shadow-archive",
  "1678-river-fortress",
  "sugar-changes-land",
  "1869-brantas-bridge",
  "1906-city-on-paper",
  "1912-bridge-lift",
  "people-between-monuments",
  "1942-world-war-arrives",
  "1947-1948-sugar-weapons",
  "1950-city-republic",
  "1958-from-1000-square-metres",
  "1990-kediri-to-market",
  "two-bridges-two-centuries",
  "2024-2026-river-to-runway",
];

const sceneCount = (html.match(/class="scene"/gu) ?? []).length;
const readyMediaCount = (html.match(/data-media-state="ready"/gu) ?? []).length;

let lastIndex = -1;
const missingOrOutOfOrder = [];
for (const slug of canonicalSceneOrder) {
  const index = html.indexOf(`id="${slug}"`);
  if (index < 0 || index <= lastIndex) {
    missingOrOutOfOrder.push(slug);
  } else {
    lastIndex = index;
  }
}

if (sceneCount !== canonicalSceneOrder.length) {
  console.error(
    `Production Journey boundary failed: expected ${canonicalSceneOrder.length} scenes, found ${sceneCount}.`,
  );
  process.exit(1);
}

if (missingOrOutOfOrder.length > 0) {
  console.error(
    `Production Journey boundary failed: missing/out-of-order scene(s): ${missingOrOutOfOrder.join(", ")}`,
  );
  process.exit(1);
}

if (readyMediaCount < canonicalSceneOrder.length) {
  console.error(
    `Production Journey boundary failed: expected at least ${canonicalSceneOrder.length} ready media slots, found ${readyMediaCount}.`,
  );
  process.exit(1);
}

if (leaked.length > 0) {
  console.error(
    `Production Journey boundary failed: editorial marker(s) leaked: ${leaked.join(", ")}`,
  );
  process.exit(1);
}

console.log(
  `Production Journey boundary passed: ${sceneCount} canonical scenes in order, ${readyMediaCount} ready media slots, 0 editorial-preview routes.`,
);
