import express from 'express'
import cors from 'cors'
import multer from 'multer'

const app = express()
const upload = multer({ dest: 'uploads/' })

app.use(cors())

app.get('/', (req, res) => {
    return res.json({ Status: 'Chal Raha Hai' })
})

// Corrected: upload.single('pdf') as middleware, then handler
app.post('/upload/pdf', upload.single('pdf'), (req, res) => {
    return res.json({ message: 'uploaded' })
})

app.listen(8000, () => {
    console.log(`Server running on PORT:${8000}`)
})
