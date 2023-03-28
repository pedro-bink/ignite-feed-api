import authRouter from './routes/authRouter';
import commentRouter from './routes/commentRouter';
import postRouter from './routes/postRouter';
import userRouter from './routes/userRouter';

import { app } from './app'
import { router } from './routes';

app.use('/posts', postRouter)
app.use('/users', userRouter)
app.use('/comments', commentRouter)
app.use('/auth', authRouter)
app.use('/', router)

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`O servidor está rodando na porta: ${port}`)
})