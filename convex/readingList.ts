import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("readingList").collect();
    return items.sort((a, b) => a.order - b.order);
  },
});

export const swapOrder = mutation({
  args: {
    firstItemId: v.id("readingList"),
    secondItemId: v.id("readingList"),
  },
  handler: async (ctx, { firstItemId, secondItemId }) => {
    const firstItem = await ctx.db.get(firstItemId);
    const secondItem = await ctx.db.get(secondItemId);
    
    if (!firstItem || !secondItem) {
      throw new Error("One or both items not found");
    }

    // Swap the orders in a single transaction
    await ctx.db.patch(firstItemId, { order: secondItem.order });
    await ctx.db.patch(secondItemId, { order: firstItem.order });
  },
}); 