const express = require('express')
const cors = require('cors')
require('dotenv').config
const { testConnection } = require('./config/database')
const { syncDatabase } = require('./models');
const authRoutes = require('./routes/authRoutes');
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
    res.json({ message: 'SanBaiFen API работает' })
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})
const PORT = process.env.PORT || 3000
const startServer = async () => {
    await testConnection()
    await syncDatabase()
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
    })
}
startServer()
