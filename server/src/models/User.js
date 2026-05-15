const { DataTypes, DATE } = require('sequelize')
const { sequelize } = require('../config/database')
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password:
    {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    avatarURL: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user',
        allowNull: false,
        validate: {
            isIn: [['user', 'admin']]
        }
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    }
},
    {
        tableName: 'users',
        timestamps: true
    })
module.exports = User