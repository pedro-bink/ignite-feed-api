import { PrismaClient } from "@prisma/client";
import { router as postRouter } from ".";
import { requireAuth } from "../middlewares/authMiddeware";

const prisma = new PrismaClient()

postRouter.get('/posts', requireAuth, async (req, res) => {

    try {
        const posts = await prisma.post.findMany({
            include: {
                author: true,
                comments: {
                    include: {
                        author: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                },
            orderBy: {
                publishedAt: 'desc'
            }
        })
        const postsWithoutAuthorPassword = posts.map(post => {
            const { author: { password, ...authorWithoutPassword }, comments, ...rest } = post;

            const commentsWithoutAuthorPassword = comments.map(comment => {
              const { author: { password, ...authorWithoutPassword }, ...commentRest } = comment;
              return {
                ...commentRest,
                author: authorWithoutPassword,
              };
            });
            return {
              ...rest,
              author: authorWithoutPassword,
              comments: commentsWithoutAuthorPassword,
            };
          });
        res.status(200).json(postsWithoutAuthorPassword)
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

postRouter.post('/posts', async (req, res) => {
    const {  content, authorId } = req.body

    try {
        const createdPost = await prisma.post.create({
            data: {
                content, 
                authorId
            },
            include: {
                author: true,
            }
            })
        res.status(201).json(createdPost)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

postRouter.put('/posts/:id', async (req, res) => {
    const { content, publishedAt, authorId } = req.body
    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        const editedPost = await prisma.post.update({
            where: {
                id: parsedId
            },
            data: {
                content, 
                publishedAt,
                authorId
            },
              })
        res.status(200).json(editedPost)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

postRouter.delete('/posts/:id', async (req, res) => {
    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        await prisma.post.delete({
            where: {
                id: parsedId
            },
            include: {
                comments: true
            }
            })
        res.status(204).json()
    } catch (error) {
        res.status(500).json({message: error})
    }
})

export default postRouter;

