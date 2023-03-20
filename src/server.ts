import { app } from './app'
import { router } from './routes/index'

const port = process.env.PORT || 3000

app.use('/', router)

app.listen(port, () => {
  console.log(`O servidor está rodando na porta: ${port}`)
})