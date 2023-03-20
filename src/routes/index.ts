import { PrismaClient } from ".prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()

export const router = Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})

router.get('/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: true,
                comments: true
            },
        })
        res.status(200).json(posts)
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

router.post('/posts', async (req, res) => {

    const {  content, publishedAt, authorId } = req.body

    try {
        const createdPost = await prisma.post.create({
            data: {
                content, 
                publishedAt,
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

router.put('/posts/:id', async (req, res) => {

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

router.delete('/posts/:id', async (req, res) => {

    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        await prisma.post.delete({
            where: {
                id: parsedId
            },
            })
        res.status(204).json()
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// users routers
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

router.post('/users', async (req, res) => {
    const { avatarUrl, name, role } = req.body

    try {
        const createdUser = await prisma.user.create({
            data: {
                avatarUrl,
                name, 
                role
            },
          })
        res.status(201).json(createdUser)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

router.put('/users/:id', async (req, res) => {
    const { avatarUrl, name, role } = req.body
    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: parsedId
            },
            data: {
                avatarUrl,
                name, 
                role
            },
        })
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        await prisma.user.delete({
            where: {
                id: parsedId
            },
            })
        res.status(204).json()
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// comments routers
router.get('/comments', async (req, res) => {
    try {
        const comments = await prisma.comment.findMany()
        res.status(200).json(comments)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

router.post('/comments', async (req, res) => {
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

router.put('/comments/:id', async (req, res) => {
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

router.delete('/comments/:id', async (req, res) => {
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
