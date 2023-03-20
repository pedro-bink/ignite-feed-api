import express from 'express'
import cors from 'cors'

// Cria o app
export const app = express()

// Configuração dos middlewares
app.use(express.json())
app.use(cors())