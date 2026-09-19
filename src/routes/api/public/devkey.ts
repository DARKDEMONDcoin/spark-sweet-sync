import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/public/devkey")({
  server: { handlers: { GET: async () => {
    const { providerKeys } = await import("@/lib/provider-keys.server");
    const k = await providerKeys();
    return new Response(JSON.stringify(Object.fromEntries(Object.entries(k).map(([a,b])=>[a, b? "set":"missing"]))), { headers: { "content-type": "application/json" } });
  } } },
});
