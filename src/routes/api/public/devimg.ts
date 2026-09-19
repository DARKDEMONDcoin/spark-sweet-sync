import { createFileRoute } from "@tanstack/react-router";

/** مؤقت للتطوير فقط — يولّد صورة بنفس مسار المنصة ويعيدها base64. يُحذف بعد الالتقاط. */
export const Route = createFileRoute("/api/public/devimg")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          prompt: string;
          width?: number;
          height?: number;
        };
        const { generateImageBytes } = await import("@/lib/image-gen.server");
        const out = await generateImageBytes(body.prompt, {
          width: body.width ?? 768,
          height: body.height ?? 1344,
        });
        if (!out) return new Response(JSON.stringify({ ok: false }), { status: 500 });
        let bin = "";
        for (const b of out.bytes) bin += String.fromCharCode(b);
        return new Response(
          JSON.stringify({ ok: true, contentType: out.contentType, b64: btoa(bin) }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
