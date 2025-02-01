import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSelectedScreenshot = query({
  args: {
    appName: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.query("iosSelectedScreenshots")
      .withIndex("by_app_name", (q) => q.eq("appName", args.appName))
      .unique();
    return doc?.selectedScreenshot;
  },
});

export const setSelectedScreenshot = mutation({
  args: {
    appName: v.string(),
    selectedScreenshot: v.string(),
  },
  handler: async (ctx, args) => {
    const existingScreenshot = await ctx.db.query("iosSelectedScreenshots")
      .withIndex("by_app_name", (q) => q.eq("appName", args.appName))
      .unique();

    if (existingScreenshot) {
      await ctx.db.patch(existingScreenshot._id, {
        selectedScreenshot: args.selectedScreenshot,
      });
    } else {
      await ctx.db.insert("iosSelectedScreenshots", {
        appName: args.appName,
        selectedScreenshot: args.selectedScreenshot,
      });
    }
  },
});
