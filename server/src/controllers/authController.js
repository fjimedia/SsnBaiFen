const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models/User');
const { where } = require('sequelize');
const register = async (req, res) => {
    try {
        const { email, password, username } = req.body
        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Все поля обязательны' })
        }
        const existingUser = await User.findOne({ where: { email } })

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь уже существует' })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            email,
            password: hashedPassword,
            username
        });
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.status(201).json({
            message: 'Регистрация успешна',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        })

    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' })
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' })
        }
        const user = await User.findOne({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' })
        }
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        await User.update(
            { lastLogin: new Date() },
            { where: { id: user.id } }
        )
        res.json({
            message: 'Вход выполнен',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        })
    }catch (error){
        res.status(500).json({error: 'Ошибка Сервера'}) 
    }
};
const getProfile = async (req,res)=>{
    try{
        const user =await User.findByPk(req.userId,{
    attributes:['id','email', 'username', 'avatarUrl', 'role', 'createdAt', 'lastLogin']
})
if (!user){
    return res.status(404).json({error:'Пользователь не найден'})
}
res.json({user})
}catch(error){
    res.status(500).json({error: 'Ошибка сервера'})
}}
module.exports = {register,login,getProfile}