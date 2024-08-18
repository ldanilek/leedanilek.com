import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("portfolio").withIndex("cool").order("desc").collect();
  },
});

export const voteCool = mutation({
  args: {
    id: v.id("portfolio"),
  },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    await ctx.db.patch(id, {
      cool: (doc?.cool ?? 0) + 1,
    });
  },
});