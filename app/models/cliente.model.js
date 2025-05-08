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
        },
        nombre: {
            type: Sequelize.STRING
        },
        apellido: {
            type: Sequelize.STRING
        }

    });
    return Cliente;
    };