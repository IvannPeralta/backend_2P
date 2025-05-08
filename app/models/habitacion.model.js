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
            }
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
            type: Sequelize.STRING
        },
        capacidad: {
            type: Sequelize.INTEGER
        },
        caracteristicas: {
            type: Sequelize.TEXT
        }
    });
    return Habitacion;
    };