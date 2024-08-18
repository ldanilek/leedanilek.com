import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const upload = internalMutation({
  args: { path: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, { path, storageId }) => {
    for await (const existing of ctx.db.query("routes").withIndex("path", q=>q.eq("path", path))) {
      try {
        await ctx.storage.delete(existing.storageId);
      } catch (e) {
        console.error("Failed to delete storage", e);
      }
      await ctx.db.delete(existing._id);
    }
    await ctx.db.insert("routes", { path, storageId });
  },
});

export const uploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const get = internalQuery({
  args: { path: v.string() },
  handler: async (ctx, { path }) => {
    return await ctx.db.query("routes").withIndex("path", q=>q.eq("path", path)).first();
  },
});
