import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "12"), 50);
  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "created_at";
  const order = searchParams.get("order") ?? "desc";

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const VALID_TYPES = ["appartement", "maison", "villa", "terrain", "commercial"];
  if (type && !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Type de bien invalide" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("*, property_images(*)", { count: "exact" })
    .eq("published", true);

  if (type) query = query.eq("property_type", type);
  if (city) query = query.ilike("location_city", `%${city}%`);
  if (minPrice) query = query.gte("price", parseFloat(minPrice));
  if (maxPrice) query = query.lte("price", parseFloat(maxPrice));

  const validSortCols = ["price", "surface", "created_at", "bedrooms"];
  const sortCol = validSortCols.includes(sort) ? sort : "created_at";

  query = query
    .order(sortCol, { ascending: order === "asc" })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(
    {
      data,
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
