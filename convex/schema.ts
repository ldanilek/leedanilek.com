import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    category: v.string(),
    order: v.number(),
  }),
  readingList: defineTable({
    title: v.string(),
    type: v.union(v.literal("book"), v.literal("video")),
    url: v.optional(v.string()),
    order: v.number(),
  }),
  iosSelectedScreenshots: defineTable({
    appName: v.string(),
    selectedScreenshot: v.string(),
  }).index("by_app_name", ["appName"]),
}); 