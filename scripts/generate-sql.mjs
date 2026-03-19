import { readFileSync, writeFileSync } from "fs";

const data = JSON.parse(readFileSync("scripts/import-data.json", "utf-8"));

function esc(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

const BATCH = 25;
const batches = [];

for (let i = 0; i < data.length; i += BATCH) {
  const batch = data.slice(i, i + BATCH);

  // Properties INSERT
  const propValues = batch
    .map(
      (r) =>
        `(${esc(r.reference)}, ${esc(r.title)}, ${esc(r.title_nl)}, ${esc(r.title_en)}, ${esc(r.description)}, ${esc(r.description_nl)}, ${esc(r.description_en)}, ${r.price}, ${esc(r.slug_fr)}, ${esc(r.slug_nl)}, ${esc(r.slug_en)}, 0, 0, 0, 0, 'appartement', 'bon_etat', 'disponible', '', '', '', '{}', '', false)`
    )
    .join(",\n");

  let sql = `INSERT INTO properties (reference, title, title_nl, title_en, description, description_nl, description_en, price, slug_fr, slug_nl, slug_en, surface, rooms, bedrooms, bathrooms, property_type, condition, status, location_city, location_region, location_address, features, energy_rating, published)
VALUES
${propValues}
ON CONFLICT (reference) DO UPDATE SET
  title = EXCLUDED.title,
  title_nl = EXCLUDED.title_nl,
  title_en = EXCLUDED.title_en,
  description = EXCLUDED.description,
  description_nl = EXCLUDED.description_nl,
  description_en = EXCLUDED.description_en,
  price = EXCLUDED.price,
  slug_fr = EXCLUDED.slug_fr,
  slug_nl = EXCLUDED.slug_nl,
  slug_en = EXCLUDED.slug_en;\n\n`;

  // Images INSERT (via subquery on reference)
  const imgRows = [];
  for (const r of batch) {
    if (!r.images) continue;
    const urls = r.images.split("|").filter(Boolean);
    urls.forEach((url, idx) => {
      imgRows.push(`(${esc(r.reference)}, ${esc(url.trim())}, ${idx}, ${idx === 0})`);
    });
  }

  if (imgRows.length > 0) {
    sql += `DELETE FROM property_images WHERE property_id IN (SELECT id FROM properties WHERE reference IN (${batch.map((r) => esc(r.reference)).join(",")}));\n\n`;
    sql += `INSERT INTO property_images (property_id, url, sort_order, is_cover)
SELECT p.id, v.url, v.sort_order, v.is_cover
FROM (VALUES
${imgRows.join(",\n")}
) AS v(reference, url, sort_order, is_cover)
JOIN properties p ON p.reference = v.reference;\n`;
  }

  batches.push(sql);
}

// Write each batch to separate file
for (let i = 0; i < batches.length; i++) {
  writeFileSync(`scripts/batch-${i}.sql`, batches[i]);
}

console.log(`Generated ${batches.length} SQL batch files`);
console.log(`Total properties: ${data.length}`);
console.log(`Total images: ${data.reduce((sum, r) => sum + (r.images ? r.images.split("|").filter(Boolean).length : 0), 0)}`);
