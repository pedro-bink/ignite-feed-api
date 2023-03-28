import { Prisma, PrismaClient } from "@prisma/client";
import { router as commentRouter} from ".";
import { requireAuth } from "../middlewares/authMiddeware";
import { buildDataCommentUpdate } from "../types/types";

const prisma = new PrismaClient()

commentRouter.get('/comments', requireAuth, async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            include: {
                author: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        res.status(200).json(comments)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

commentRouter.post('/comments', async (req, res) => {
    const { content, authorId, postId } = req.body

    try {
        const createdComment = await prisma.comment.create({
            data: {
                content,
                authorId, 
                postId
            },
          })
        res.status(201).json(createdComment)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

commentRouter.put('/comments/:id', requireAuth, async (req, res) => {
    const { content, hasLiked, hasDisliked } = req.body;
const { id } = req.params;
const parsedId = parseInt(id);

try {
  const comment = await prisma.comment.findUnique({
    where: {
      id: parsedId,
    },
  });

  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }

  let builtData: buildDataCommentUpdate = {
    content,
  };

  if (hasLiked !== undefined) {
    builtData = { ...builtData, hasLiked };
  }

  if (hasDisliked !== undefined) {
    builtData = { ...builtData, hasDisliked };
  }

  const data: Prisma.CommentUpdateInput = {
    ...builtData,
  };

  if (hasLiked === true && comment.hasLiked === false) {
    data.like = comment.like + 1;
  } else if (hasLiked === false && comment.hasLiked === true) {
    data.like = comment.like - 1;
  }

  if (hasDisliked === true && comment.hasDisliked === false) {
    data.dislike = comment.dislike + 1;
  } else if (hasDisliked === false && comment.hasDisliked === true) {
    data.dislike = comment.dislike - 1;
  }

  const updatedComment = await prisma.comment.update({
    where: {
      id: parsedId,
    },
    data,
  });

  res.status(200).json(updatedComment);
} catch (error) {
  res.status(500).json({ message: error });
}
  });

commentRouter.delete('/comments/:id', requireAuth, async (req, res) => {
    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        await prisma.comment.delete({
            where: {
                id: parsedId
            },
            })
        res.status(204).json()
    } catch (error) {
        res.status(500).json({message: error})
    }
})

export default commentRouter