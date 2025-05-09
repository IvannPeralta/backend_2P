const db = require("../models");
const Reserva = db.Reserva;
const Habitacion = db.Habitacion;
const Op = db.Sequelize.Op;

// Crear y guardar una nueva reserva
exports.create = (req, res) => {
    // Validar la solicitud
    const requiredFields = ["id_hotel", "id_habitacion", "fecha_ingreso", "fecha_salida", "id_cliente"];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.status(400).send({ message: `El campo ${field} no puede estar vacío!` });
            return;
        }
    }

    const reserva = {
        id_hotel: req.body.id_hotel,
        id_habitacion: req.body.id_habitacion,
        fecha_ingreso: req.body.fecha_ingreso,
        fecha_salida: req.body.fecha_salida,
        id_cliente: req.body.id_cliente,
        cantidad_personas: req.body.cantidad_personas || 1
    };

    Reserva.create(reserva)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Ha ocurrido un error al crear la reserva."
            });
        });
};


exports.buscarDisponibles = (req, res) => {
    const requiredFields = ["fecha_ingreso", "fecha_salida"];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.status(400).send({ message: `El campo ${field} no puede estar vacío!` });
            return;
        }
    }

    // buscar habitaciones disponibles
    const fecha_ingreso = req.body.fecha_ingreso;
    const fecha_salida = req.body.fecha_salida;
    const capacidad = req.body.capacidad || 1; // Default to 1 if not provided

    const habitaciones = Habitacion.findAll({
        where: {
            id: {
                [Op.notIn]: Sequelize.literal(`(
                    SELECT id_habitacion FROM Reservas
                    WHERE (fecha_ingreso <= '${fecha_salida}' AND fecha_salida >= '${fecha_ingreso}')
                )`)
            }
        }
    });

    // verificar la capacidad de las habitaciones
    const habitacionesDisponibles = habitaciones.filter(habitacion => habitacion.capacidad >= capacidad);

    if (habitacionesDisponibles.length === 0) {
        return res.status(404).send({ message: "No hay habitaciones disponibles para las fechas seleccionadas." });
    }
    res.status(200).send(habitacionesDisponibles);
};