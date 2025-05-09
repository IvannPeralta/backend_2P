module.exports = (sequelize, Sequelize) => {
    const Habitacion = sequelize.define("Habitacion", {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        numero: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        hotelId: {
            type: Sequelize.BIGINT,
            references: {
                model: 'Hotels',
                key: 'id'
            },
            allowNull: false
        },
        posicion_x: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        posicion_y: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        piso: { 
            type: Sequelize.STRING,
            allowNull: false
        },
        capacidad: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        caracteristicas: {
            type: Sequelize.TEXT
        }
    });
    return Habitacion;
    };