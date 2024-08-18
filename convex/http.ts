import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  pathPrefix: "/",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const route = await ctx.runQuery(internal.routes.get, { path: url.pathname });
    if (!route) {
      return new Response("Not found", { status: 404 });
    }
    const body = await ctx.storage.get(route.storageId);
    if (!body) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(body, { status: 200 });
  }),
});

export default http;