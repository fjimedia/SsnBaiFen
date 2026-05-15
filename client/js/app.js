const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'public')));

app.get('/api', (req, res) => {
    res.json({ message: 'SanBaiFen API работает' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await testConnection();
    await syncDatabase();

    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
    });
};

startServer();