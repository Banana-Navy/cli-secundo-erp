import type { PropertyWithImages } from "@/types";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_CONDITION_LABELS,
  FEATURES_LABELS,
} from "@/types";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getCoverUrl(property: PropertyWithImages): string {
  const cover =
    property.property_images?.find((img) => img.is_cover) ??
    property.property_images?.[0];
  return cover?.url ?? "";
}

function truncate(text: string, max: number): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "...";
}

function getActiveFeatures(property: PropertyWithImages): string[] {
  if (!property.features) return [];
  return Object.entries(property.features)
    .filter(([, v]) => v === true)
    .map(([k]) => FEATURES_LABELS[k] || k)
    .slice(0, 5);
}

function featureTag(label: string): string {
  return `<span style="display:inline-block;background:#f5f0e6;color:#8b7335;font-size:11px;font-weight:600;padding:2px 8px;border-radius:12px;margin:0 4px 4px 0;">${label}</span>`;
}

function propertyBlock(property: PropertyWithImages): string {
  const coverUrl = getCoverUrl(property);
  const imageHtml = coverUrl
    ? `<img src="${coverUrl}" alt="${property.title}" width="560" height="260" style="width:100%;height:260px;object-fit:cover;display:block;border-radius:8px 8px 0 0;" />`
    : `<div style="width:100%;height:260px;background:#f0f0f0;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px;">Pas de photo</div>`;

  const specs = [];
  if (property.rooms > 0) specs.push(`${property.rooms} pièces`);
  if (property.bedrooms > 0) specs.push(`${property.bedrooms} chambres`);
  if (property.bathrooms > 0) specs.push(`${property.bathrooms} sdb`);
  if (property.surface > 0) specs.push(`${property.surface} m²`);

  const description = truncate(property.description, 200);
  const features = getActiveFeatures(property);
  const typeBadge = PROPERTY_TYPE_LABELS[property.property_type] || "";
  const conditionBadge = PROPERTY_CONDITION_LABELS[property.condition] || "";

  let metaLine = "";
  const metaParts = [];
  if (typeBadge) metaParts.push(typeBadge);
  if (conditionBadge) metaParts.push(conditionBadge);
  if (property.year_built) metaParts.push(`Construit en ${property.year_built}`);
  if (metaParts.length > 0) {
    metaLine = `<p style="margin:0 0 8px;font-size:12px;color:#888;">${metaParts.join(" &bull; ")}</p>`;
  }

  return `
    <tr>
      <td style="padding:8px 0;">
        <div style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
          ${imageHtml}
          <div style="padding:16px 20px;">
            <!-- Price + location -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:22px;font-weight:bold;color:#d4a843;">${formatPrice(property.price)}</p>
                </td>
                <td style="text-align:right;vertical-align:top;">
                  ${property.reference ? `<span style="font-size:11px;color:#aaa;background:#f5f5f5;padding:2px 8px;border-radius:4px;">${property.reference}</span>` : ""}
                </td>
              </tr>
            </table>
            <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#333;">${property.title}</p>
            <p style="margin:0 0 10px;font-size:13px;color:#666;">
              📍 ${property.location_city}${property.location_region ? `, ${property.location_region}` : ""}
            </p>

            <!-- Specs -->
            ${specs.length > 0 ? `
            <p style="margin:0 0 10px;font-size:13px;color:#555;background:#fafafa;padding:8px 12px;border-radius:6px;">
              ${specs.join(" &nbsp;&bull;&nbsp; ")}
            </p>` : ""}

            <!-- Type / condition / year -->
            ${metaLine}

            <!-- Description -->
            ${description ? `
            <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.5;">
              ${description}
            </p>` : ""}

            <!-- Features tags -->
            ${features.length > 0 ? `
            <div style="margin:0 0 4px;">
              ${features.map(featureTag).join("")}
            </div>` : ""}
          </div>
        </div>
      </td>
    </tr>
  `;
}

export function generateEmailHTML(properties: PropertyWithImages[]): string {
  const propertyRows = properties.map(propertyBlock).join("\n");

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <title>Secundo — Sélection de biens</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f5f5f5; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <center>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
      <tr>
        <td align="center" style="padding:20px 0;">
          <!-- Email container -->
          <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background-color:#d4a843;padding:28px 32px;text-align:center;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="padding-right:8px;vertical-align:middle;">
                      <div style="width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-bottom:10px solid #ffffff;display:inline-block;"></div>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:26px;font-weight:bold;color:#ffffff;letter-spacing:1px;">SECUNDO</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:10px 0 0;font-size:15px;color:#ffffff;opacity:0.9;">
                  Découvrez notre sélection de biens en Espagne
                </p>
              </td>
            </tr>

            <!-- Intro text -->
            <tr>
              <td style="padding:24px 24px 8px;">
                <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                  Bonjour,<br/><br/>
                  Nous avons le plaisir de vous présenter ${properties.length > 1 ? `une sélection de <strong>${properties.length} biens</strong>` : "<strong>un bien</strong>"} qui ${properties.length > 1 ? "pourraient" : "pourrait"} correspondre à vos critères de recherche. ${properties.length > 1 ? "Chaque propriété a été soigneusement sélectionnée par notre équipe." : "Cette propriété a été soigneusement sélectionnée par notre équipe."}
                </p>
              </td>
            </tr>

            <!-- Properties -->
            <tr>
              <td style="padding:8px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${propertyRows}
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding:16px 24px 24px;text-align:center;">
                <p style="margin:0 0 16px;font-size:14px;color:#555;">
                  Intéressé(e) par un de ces biens ? Contactez-nous pour organiser une visite ou obtenir plus d'informations.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;text-align:center;background-color:#fafafa;border-top:1px solid #eee;">
                <p style="margin:0 0 4px;font-size:12px;color:#999;font-weight:600;">Secundo — Résidences secondaires en Espagne</p>
                <p style="margin:0;font-size:11px;color:#bbb;">Cet email a été envoyé via Secundo ERP</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}
