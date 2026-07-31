// @ts-expect-error - API routes are available in latest start plugin but TS may not resolve it here
import { createAPIFileRoute } from "@tanstack/react-start/api";

const MODEL_PROXY_PREFIX = "/api/hf-model/";
const ALLOWED_MODEL_PREFIX = "MicahB/roberta-base-go_emotions/";

function responseHeaders(upstream: Response) {
  const headers = new Headers();
  const passthroughHeaders = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
  ];

  for (const header of passthroughHeaders) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }

  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return headers;
}

export const APIRoute = createAPIFileRoute("/api/hf-model/$")({
  GET: async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const modelPath = decodeURIComponent(
      url.pathname.slice(MODEL_PROXY_PREFIX.length)
    );

    if (
      !modelPath ||
      modelPath.includes("..") ||
      !modelPath.startsWith(ALLOWED_MODEL_PREFIX)
    ) {
      return new Response("Not found", { status: 404 });
    }

    const upstreamUrl = `https://huggingface.co/${modelPath}`;
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range) headers.set("range", range);

    const upstream = await fetch(upstreamUrl, { headers });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders(upstream),
    });
  },
});
