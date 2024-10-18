import asyncHandler from "express-async-handler";
import { prisma } from "../app.mjs";

// @desc    Get all tags with post count
// @route   GET /api/tag
// @access  Public
const getTagsController = asyncHandler(async (req, res) => {
  const results = await prisma.blogTag.findMany({
    select: {
      tag: true,
      posts: { select: { isDeleted: true, published: true } },
    },
  });

  // count the number of posts for each tag.
  const countPosts = results
    .map((item) => {
      // count posts by tag
      return {
        tag: item.tag,
        count: item.posts.filter((post) => !post.isDeleted && post.published)
          .length,
      };
    })
    .filter((item) => item.count > 0) // remove tags with no posts
    .sort((a, b) => b.count - a.count); // sort by count

  return res.json(countPosts);
});

export { getTagsController };
