import asyncHandler from "express-async-handler";
import { prisma } from "../app.mjs";

// @desc    Get all tags with post count
// @route   GET /api/tag
// @access  Public
const getTagsController = asyncHandler(async (req, res) => {
  const tags = await prisma.blogTag.findMany({
    select: {
      tag: true,
      _count: { select: { posts: true } },
    },
    orderBy: { posts: { _count: "desc" } },
  });

  // Generate a DAO from a tag entity.
  const generateDao = (tag) => {
    return {
      tag: tag.tag,
      count: tag._count.posts,
    };
  };

  const dao = tags.map((tag) => generateDao(tag));
  return res.json(dao);
});

export { getTagsController };
