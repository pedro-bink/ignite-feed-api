import { PrismaClient } from ".prisma/client"
import { Router } from "express"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

export const router = Router()

const secret = process.env.JWT_SECRET || 'defaultSecret';

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
                comments: {
                    include: {
                        author: true
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

router.post('/posts', async (req, res) => {

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
            include: {
                comments: true
            }
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

router.get('/users/:id', async (req, res) => {

    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        const user = await prisma.user.findUnique(
            {
                where: {
                id: parsedId
            },
        }
        )
        const { password, ...userResponseDTO } = user || {};
        res.status(200).json(userResponseDTO)
    } catch (error) {
        res.status(500).json({message: error})
    }
})


router.put('/users/:id', async (req, res) => {
    const { treatedAvatarUrl, treatedBannerUrl, treatedName, treatedRole } = req.body
    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: parsedId
            },
            data: {
                avatarUrl: treatedAvatarUrl,
                bannerUrl: treatedBannerUrl,
                name: treatedName, 
                role: treatedRole,
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

//auth routes
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try{
        const user = await prisma.user.findUnique(
            {
                where: {email: email}
            }
        )

        if(!user){
            return res.status(404).json({message: "User not found"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"})
        }

        jwt.sign({userId: user.id}, secret, {expiresIn: '1h'}, (err, token) => {
            if(err){
                console.log(err)
            }
            const { password, ...userResponseDTO } = user || {};

            res.status(200).json({auth: true, token, userResponseDTO})
        }
        )

    }catch(error){
        res.status(500).json({message: error})
    }
})

router.post('/signin', async (req, res) => {
    const { name, email, password } = req.body

    const cryptPassword = await bcrypt.hash(password, 10)

    try {
        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                password: cryptPassword
            },
          })
        res.status(201).json(createdUser)
    } catch (error) {
        res.status(500).json({message: error})
    }
})