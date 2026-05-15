const { sequelize } = require('../config/database');
const User = require('./User')
const Card = require('./Card')
User.hasMany(Card,{
    foreignKey: 'userId',
    as: 'cards'
});
Card.belongsTo(User,{
    foreignKey: 'userId',
    as:'user'
})
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Таблицы созданы успешно');
    } catch (error) {
        console.error('Ошибка создания таблиц:', error);
    }
};
module.exports = {
    sequelize,
    User,
    Card,
    syncDatabase
}