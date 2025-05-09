const db = require("../models");
const Reserva = require("./reserva.model.js");
module.exports = (sequelize, Sequelize) => {
    const Cliente = sequelize.define("Cliente", {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        cedula: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        apellido: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Clientes' 
    });
    Cliente.associate = (models) => {
        Cliente.hasMany(models.Reserva, {
            foreignKey: 'id_cliente',
       
        });
    };
    return Cliente;
    };