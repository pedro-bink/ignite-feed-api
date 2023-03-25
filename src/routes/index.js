"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const client_1 = require(".prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
exports.router = (0, express_1.Router)();
const secret = process.env.JWT_SECRET || 'defaultSecret';
// middleware that is specific to this router
exports.router.use((req, res, next) => {
    console.log('Time: ', Date.now());
    next();
});
exports.router.get('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany({
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
        });
        const postsWithoutAuthorPassword = posts.map(post => {
            const _a = post.author, { password } = _a, authorWithoutPassword = __rest(_a, ["password"]), { comments } = post, rest = __rest(post, ["author", "comments"]);
            const commentsWithoutAuthorPassword = comments.map(comment => {
                const _a = comment.author, { password } = _a, authorWithoutPassword = __rest(_a, ["password"]), commentRest = __rest(comment, ["author"]);
                return Object.assign(Object.assign({}, commentRest), { author: authorWithoutPassword });
            });
            return Object.assign(Object.assign({}, rest), { author: authorWithoutPassword, comments: commentsWithoutAuthorPassword });
        });
        res.status(200).json(postsWithoutAuthorPassword);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}));
exports.router.post('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, authorId } = req.body;
    try {
        const createdPost = yield prisma.post.create({
            data: {
                content,
                authorId
            },
            include: {
                author: true,
            }
        });
        res.status(201).json(createdPost);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.put('/posts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, publishedAt, authorId } = req.body;
    const { id } = req.params;
    const parsedId = parseInt(id);
    try {
        const editedPost = yield prisma.post.update({
            where: {
                id: parsedId
            },
            data: {
                content,
                publishedAt,
                authorId
            },
        });
        res.status(200).json(editedPost);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.delete('/posts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const parsedId = parseInt(id);
    try {
        yield prisma.post.delete({
            where: {
                id: parsedId
            },
            include: {
                comments: true
            }
        });
        res.status(204).json();
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
// users routers
exports.router.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.get('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const parsedId = parseInt(id);
    try {
        const user = yield prisma.user.findUnique({
            where: {
                id: parsedId
            },
        });
        const _a = user || {}, { password } = _a, userResponseDTO = __rest(_a, ["password"]);
        res.status(200).json(userResponseDTO);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.put('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { treatedAvatarUrl, treatedBannerUrl, treatedName, treatedRole } = req.body;
    const { id } = req.params;
    const parsedId = parseInt(id);
    try {
        const updatedUser = yield prisma.user.update({
            where: {
                id: parsedId
            },
            data: {
                avatarUrl: treatedAvatarUrl,
                bannerUrl: treatedBannerUrl,
                name: treatedName,
                role: treatedRole,
            },
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const parsedId = parseInt(id);
    try {
        yield prisma.user.delete({
            where: {
                id: parsedId
            },
        });
        res.status(204).json();
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
// comments routers
exports.router.get('/comments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield prisma.comment.findMany({
            include: {
                author: true
            }
        });
        res.status(200).json(comments);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.post('/comments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, authorId, postId } = req.body;
    try {
        const createdComment = yield prisma.comment.create({
            data: {
                content,
                authorId,
                postId
            },
        });
        res.status(201).json(createdComment);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.put('/comments/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, authorId, postId } = req.body;
    const { id } = req.params;
    const parsedId = parseInt(id);
    try {
        const updatedComment = yield prisma.comment.update({
            where: {
                id: parsedId
            },
            data: {
                content,
                authorId,
                postId
            },
        });
        res.status(200).json(updatedComment);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.delete('/comments/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const parsedId = parseInt(id);
    try {
        yield prisma.comment.delete({
            where: {
                id: parsedId
            },
        });
        res.status(204).json();
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
//auth routes
exports.router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: { email: email }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordCorrect = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.log(err);
            }
            const _a = user || {}, { password } = _a, userResponseDTO = __rest(_a, ["password"]);
            res.status(200).json({ auth: true, token, userResponseDTO });
        });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
exports.router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const cryptPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const createdUser = yield prisma.user.create({
            data: {
                name,
                email,
                password: cryptPassword
            },
        });
        res.status(201).json(createdUser);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
