import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSQL, validateSQL, generateAnswer } from "@/lib/ai/assistant";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await request.json();
    const { question } = body as { question: string };

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Le champ question est requis" },
        { status: 400 }
      );
    }

    // 1. Generate SQL from the natural language question
    const rawSql = await generateSQL(question);
    // Strip trailing semicolons and markdown fences that LLMs sometimes add
    const sql = rawSql
      ?.replace(/^```sql\s*/i, "")
      .replace(/```\s*$/, "")
      .replace(/;\s*$/, "")
      .trim();

    if (!sql) {
      return NextResponse.json(
        { error: "Impossible de generer une requete SQL pour cette question" },
        { status: 422 }
      );
    }

    // 2. Validate the SQL (only SELECT allowed)
    const validation = validateSQL(sql);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 422 }
      );
    }

    // 3. Execute the read-only SQL via Supabase RPC
    const { data, error: rpcError } = await supabase.rpc(
      "execute_readonly_sql",
      { query: sql }
    );

    if (rpcError) {
      return NextResponse.json(
        { error: `Erreur SQL: ${rpcError.message}` },
        { status: 500 }
      );
    }

    // 4. Generate the natural language answer
    const answer = await generateAnswer(question, sql, data);

    return NextResponse.json({ answer, sql, data });
  } catch (error) {
    console.error("[AI Assistant]", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
}
