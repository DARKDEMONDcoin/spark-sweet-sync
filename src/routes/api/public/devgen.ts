import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { runEmployeeTurn } from "@/lib/ai.functions";

/** مسار مؤقت لتوليد أمثلة حقيقية من الموظفين — يُحذف بعد الالتقاط. */
function supabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (key.startsWith("sb_secret_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export const Route = createFileRoute("/api/public/devgen")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
        const body = (await request.json()) as {
          workspaceId: string;
          conversationId: string;
          employeeId: string;
          message: string;
        };
        const supabase = createClient<Database>(url, key, {
          global: { fetch: supabaseFetch(key), headers: { Authorization: `Bearer ${key}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        try {
          const result = await runEmployeeTurn(
            { ...body, imageMode: "off" } as never,
            { supabase },
          );
          return new Response(JSON.stringify(result), {
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
        }
      },
    },
  },
});
