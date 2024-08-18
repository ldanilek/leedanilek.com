import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),
  portfolio: defineTable({
    link: v.string(),
    linkText: v.string(),
    text: v.string(),
    cool: v.optional(v.number()),
  }).index("cool", ["cool"]),
  routes: defineTable({
    path: v.string(),
    storageId: v.id("_storage"),
  }).index("path", ["path"]),
});
