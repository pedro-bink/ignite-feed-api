import { PrismaClient } from "@prisma/client";
import { router  as authRouter} from ".";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const secret = process.env.JWT_SECRET

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body

    console.log(email, password)

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

authRouter.post('/signin', async (req, res) => {
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

export default authRouter