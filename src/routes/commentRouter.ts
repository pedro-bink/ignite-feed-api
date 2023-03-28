import { PrismaClient } from "@prisma/client";
import { router as commentRouter} from ".";
import { requireAuth } from "../middlewares/authMiddeware";

const prisma = new PrismaClient()

commentRouter.get('/comments', requireAuth, async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            include: {
                author: true
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
    const { content, authorId, postId } = req.body
    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        const updatedComment = await prisma.comment.update({
            where: {
                id: parsedId
            },
            data: {
                content,
                authorId, 
                postId
            },
        })
        res.status(200).json(updatedComment)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

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

// commentRouter.patch('/comments/:id', requireAuth, async (req, res) => {
//     const { content, authorId, postId, likeCount, deslikeCount } = req.body
//     const { id } = req.params
//     const parsedId = parseInt(id);

//     try {
//         const updatedComment = await prisma.comment.update({
//             where: {
//                 id: parsedId
//             },
//             data: {
//                 content,
//                 authorId, 
//                 postId,
//                 likeCount,
//                 deslikeCount
//             },
//         })
//         res.status(200).json(updatedComment)
//     } catch (error) {
//         res.status(500).json({message: error})
//     }
// })

export default commentRouter