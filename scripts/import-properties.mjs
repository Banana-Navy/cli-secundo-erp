/**
 * Import properties from the client's XLS export.
 *
 * Usage: node scripts/import-properties.mjs <path-to-xls>
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import XLSX from "xlsx";
import { readFileSync } from "fs";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- Helpers ---

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanText(text) {
  if (!text) return "";
  return String(text).trim();
}

// --- Ensure unique slug (append -2, -3, etc.) ---

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

// --- Main ---

async function main() {
  const filePath =
    process.argv[2] ||
    "C:/Users/PMFwe/Downloads/export-biens-2026-03-13-16-24-24.xls";

  console.log(`Reading ${filePath}...`);
  // File is HTML disguised as .xls, encoded in Latin-1
  const buf = readFileSync(filePath);
  const html = buf.toString("latin1");
  const wb = XLSX.read(html, { type: "string" });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(ws);
  console.log(`Parsed ${rows.length} properties.`);

  // Check current DB state
  const { count: existingCount } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true });
  console.log(`Existing properties in DB: ${existingCount ?? 0}`);

  let inserted = 0;
  let imgInserted = 0;
  const errors = [];

  // Process in batches of 50
  const BATCH_SIZE = 50;

  for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
    const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);

    const propertyRecords = batch.map((row) => {
      const titleFr = cleanText(row["Titre FR"]);
      const titleNl = cleanText(row["Titre NL"]);
      const titleEn = cleanText(row["Titre EN"]);
      const descFr = cleanText(row["Description FR"]);
      const descNl = cleanText(row["Description NL"]);
      const descEn = cleanText(row["Description EN"]);
      const reference = cleanText(row["Reference"]);
      const price = parseFloat(row["Prix"]) || 0;

      const slugFr = uniqueSlug(slugify(titleFr || reference), "fr");
      const slugNl = titleNl ? uniqueSlug(slugify(titleNl), "nl") : "";
      const slugEn = titleEn ? uniqueSlug(slugify(titleEn), "en") : "";

      return {
        reference,
        title: titleFr,
        title_nl: titleNl,
        title_en: titleEn,
        description: descFr,
        description_nl: descNl,
        description_en: descEn,
        price,
        slug_fr: slugFr,
        slug_nl: slugNl,
        slug_en: slugEn,
        // Defaults for required fields not in the XLS
        surface: 0,
        rooms: 0,
        bedrooms: 0,
        bathrooms: 0,
        property_type: "appartement",
        condition: "bon_etat",
        status: "disponible",
        location_city: "",
        location_region: "",
        location_address: "",
        features: {},
        energy_rating: "",
        published: false,
        // Temp field for images
        _images: row["Images"] || "",
      };
    });

    // Separate images data before insert
    const imagesByRef = {};
    const insertRecords = propertyRecords.map((r) => {
      const { _images, ...record } = r;
      imagesByRef[r.reference] = _images;
      return record;
    });

    const { data: insertedProps, error } = await supabase
      .from("properties")
      .upsert(insertRecords, { onConflict: "reference" })
      .select("id, reference");

    if (error) {
      console.error(`Batch error at ${batchStart}:`, error.message);
      errors.push({ batch: batchStart, error: error.message });
      continue;
    }

    inserted += insertedProps.length;

    // Insert images for each property
    const imageRecords = [];
    for (const prop of insertedProps) {
      const imagesStr = imagesByRef[prop.reference];
      if (!imagesStr) continue;

      const urls = String(imagesStr).split("|").filter(Boolean);
      urls.forEach((url, idx) => {
        imageRecords.push({
          property_id: prop.id,
          url: url.trim(),
          alt: "",
          sort_order: idx,
          is_cover: idx === 0,
        });
      });
    }

    if (imageRecords.length > 0) {
      // Delete existing images for these properties first (in case of re-import)
      const propIds = insertedProps.map((p) => p.id);
      await supabase
        .from("property_images")
        .delete()
        .in("property_id", propIds);

      const { error: imgError } = await supabase
        .from("property_images")
        .insert(imageRecords);

      if (imgError) {
        console.error(`Image batch error:`, imgError.message);
        errors.push({ batch: batchStart, type: "images", error: imgError.message });
      } else {
        imgInserted += imageRecords.length;
      }
    }

    process.stdout.write(
      `  Batch ${batchStart + 1}-${batchStart + batch.length}: ${insertedProps.length} props, ${imageRecords.length} images\n`
    );
  }

  console.log("\n--- Import Summary ---");
  console.log(`Properties inserted/updated: ${inserted}`);
  console.log(`Images inserted: ${imgInserted}`);
  if (errors.length > 0) {
    console.log(`Errors: ${errors.length}`);
    errors.forEach((e) => console.log("  ", e));
  }

  // Final count
  const { count: finalCount } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true });
  console.log(`Total properties in DB now: ${finalCount}`);
}

main().catch(console.error);
