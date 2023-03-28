import multer from 'multer';
import fs from 'fs';

const imagesDir = process.env.STATIC_DIR as string

if (!fs.existsSync(imagesDir)){
    fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.STATIC_DIR as string)
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})

export const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 1000000 }})
    .fields(
    [
        {
            name:'avatarFile',
            maxCount:1
        },
        {
            name: 'bannerFile', 
            maxCount:1
        },
    ]
);