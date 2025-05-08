module.exports = (sequelize, Sequelize) => {
    const Hotel = sequelize.define("Hotel", {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        direccion: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Hotel;
    };