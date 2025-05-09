module.exports = (sequelize, Sequelize) => {
    const Reserva = sequelize.define("Reserva", {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        id_hotel: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
                model: 'Hotels',
                key: 'id'
            }
        },
        id_habitacion: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
                model: 'Habitacions',
                key: 'id'
            }
        },
        fecha_ingreso: {
            type: Sequelize.DATE,
            allowNull: false
        },
        fecha_salida: {
            type: Sequelize.DATE,
            allowNull: false
        },
        
        id_cliente: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
                model: 'Clientes',
                key: 'id'
            }
        },
        cantidad_personas: {
            type: Sequelize.INTEGER
        }
    });
    return Reserva;
}