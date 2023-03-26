export interface UploadedFiles {
    avatarFile?: Express.Multer.File[];
    bannerFile?: Express.Multer.File[];
}

export interface SupabaseFile extends File {
    buffer: Buffer
    readonly lastModified: number
    readonly name: string
    readonly webkitRelativePath: string
    readonly type: string
}

export interface buildData {
    name: string,
    role: string,
    avatarUrl?: string,
    bannerUrl?: string,
}