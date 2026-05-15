const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Card = sequelize.define('Card', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
     chinese: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pinyin: {
        type: DataTypes.STRING,
        allowNull: false
    },
    translation: {
        type: DataTypes.STRING,
        allowNull: false
    },
      example: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    exampleTranslation: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    audioUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hskLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
        min: 1,
        max: 9
    }
},
 difficultyLevel: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 5
        }
    },
    tags:{
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: true
    },
    isPublic:{
type: DataTypes.BOOLEAN,
defaultValue: true
    },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
        }
    },{
          tableName: 'cards',
    timestamps: true
    }
)
module.exports = Card;