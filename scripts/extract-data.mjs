import { readFileSync, writeFileSync } from "fs";
import XLSX from "xlsx";

// The .xls file is actually HTML encoded in Latin-1
const buf = readFileSync(
  "C:/Users/PMFwe/Downloads/export-biens-2026-03-13-16-24-24.xls"
);
const html = buf.toString("latin1");

// Parse the HTML table with xlsx
const wb = XLSX.read(html, { type: "string" });
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);

function slugify(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const usedSlugs = { fr: new Set(), nl: new Set(), en: new Set() };
function uniqueSlug(base, lang) {
  if (!base) return "";
  let slug = base;
  let counter = 2;
  while (usedSlugs[lang].has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  usedSlugs[lang].add(slug);
  return slug;
}

const clean = (v) => (v == null ? "" : String(v).trim());

const data = rows.map((row) => ({
  reference: clean(row["Reference"]),
  title: clean(row["Titre FR"]),
  title_nl: clean(row["Titre NL"]),
  title_en: clean(row["Titre EN"]),
  description: clean(row["Description FR"]),
  description_nl: clean(row["Description NL"]),
  description_en: clean(row["Description EN"]),
  price: parseFloat(row["Prix"]) || 0,
  slug_fr: uniqueSlug(slugify(row["Titre FR"] || row["Reference"] || ""), "fr"),
  slug_nl: row["Titre NL"]
    ? uniqueSlug(slugify(row["Titre NL"]), "nl")
    : "",
  slug_en: row["Titre EN"]
    ? uniqueSlug(slugify(row["Titre EN"]), "en")
    : "",
  images: clean(row["Images"]),
}));

// Encoding check
const sample = data[0].description;
const hasBadChars = sample.includes("\ufffd") || sample.includes("ï¿½");
console.log(`Extracted ${data.length} records`);
console.log(`Encoding check: ${hasBadChars ? "STILL BAD" : "OK"}`);
console.log(`Sample: ${sample.substring(0, 200)}`);

writeFileSync("scripts/import-data.json", JSON.stringify(data));
