import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { router as userRouter } from ".";
import { requireAuth } from "../middlewares/authMiddeware";
import { buildData, UploadedFiles } from "../types/types";
import fs from 'fs';
import { upload } from "../middlewares/imageUploadMiddlware";

const prisma = new PrismaClient()

const supabaseUrl = 'https://zlwhfurpnrfwvbrcastz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsd2hmdXJwbnJmd3ZicmNhc3R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3OTE4NzQ0MiwiZXhwIjoxOTk0NzYzNDQyfQ.By1OGEAMTMPY9pVaP1lK35j1aYuzNNwGh5GExyKK8TU'
const supabase = createClient(supabaseUrl, supabaseKey)

userRouter.get('/users', requireAuth, async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

userRouter.get('/users/:id', requireAuth, async (req, res) => {
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

userRouter.put('/users/:id', requireAuth, upload, async (req, res) => {
    const { name, role } = req.body
    const { id } = req.params
    const parsedId = parseInt(id);

    try {
        const files = req.files as UploadedFiles;

        const avatarImageName = files.avatarFile ? files.avatarFile[0].originalname : undefined
        const bannerImageName = files.bannerFile ? files.bannerFile[0].originalname : undefined

        if (files.avatarFile) {
            const avatarBuffer = fs.readFileSync(files.avatarFile[0].path)
            await supabase.storage.from('images').upload(`avatars/${avatarImageName}`, avatarBuffer, {
                contentType: 'image/jpeg'
            })
            fs.unlinkSync(files.avatarFile[0].path)
        }   

        if (files.bannerFile) {
            const bannerBuffer = fs.readFileSync(files.bannerFile[0].path)
            await supabase.storage.from('images').upload(`banners/${bannerImageName}`, bannerBuffer, {
                contentType: 'image/jpeg'
            })
            fs.unlinkSync(files.bannerFile[0].path)
        }

        const { data: avatarUrl } = await supabase
        .storage
        .from('images')
        .getPublicUrl(`avatars/${avatarImageName}`)

        const { data: bannerUrl } = await supabase
        .storage
        .from('images')
        .getPublicUrl(`banners/${bannerImageName}`)

        let builtData:buildData = {
            name,
            role
        }

        if (files.avatarFile) {
            builtData = {...builtData, avatarUrl: avatarUrl.publicUrl}
        }
        if (files.bannerFile) {
            builtData = {...builtData, bannerUrl: bannerUrl.publicUrl}
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: parsedId
            },
            data: builtData
        })
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

userRouter.delete('/users/:id', requireAuth, async (req, res) => {
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

export default userRouter