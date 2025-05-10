const db = require("../models");
const Reserva = db.Reserva;
const Habitacion = db.Habitacion;
const Cliente = db.Cliente;
const Hotel = db.Hotel;
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
    
    Habitacion.findByPk(req.body.id_habitacion)
        .then(habitacion => {
            if (!habitacion) {
                res.status(404).send({ message: "La habitación especificada no existe." });
                return;
            }

            if (req.body.cantidad_personas > habitacion.capacidad) {
                res.status(400).send({ message: "La cantidad de personas excede la capacidad de la habitación." });
                return;
            }
        }
    )
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


// Buscar habitaciones disponibles
exports.buscarDisponibles = (req, res) => {

    // Validar la solicitud
    const requiredFields = ["fecha_ingreso", "fecha_salida"];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.status(400).send({ message: `El campo ${field} no puede estar vacío!` });
            return;
        }
    }

    const fecha_ingreso = req.body.fecha_ingreso;
    const fecha_salida = req.body.fecha_salida;
    const capacidad = req.body.capacidad || 1;

    Reserva.findAll({
        where: {
            [Op.and]: [
                {
                    fecha_ingreso: {
                    [Op.lt]: fecha_salida
                    }
                },
                {
                    fecha_salida: {
                    [Op.gt]: fecha_ingreso
                    }
                }
            ]
        }
    })
    .then(reservas => {
        const habitacionesOcupadas = reservas.map(reserva => reserva.id_habitacion);

        Habitacion.findAll()
            .then(habitaciones => {
                // Filtrar habitaciones disponibles
                const habitacionesDisponibles = habitaciones.filter(habitacion => {
                    return !habitacionesOcupadas.includes(habitacion.id) && habitacion.capacidad >= capacidad;
                });

                if (habitacionesDisponibles.length === 0) {
                    return res.status(404).send({ message: "No hay habitaciones disponibles para las fechas seleccionadas." });
                }
                const habitacionesSinTimestamps = habitacionesDisponibles.map(habitacion => {
                    const { createdAt, updatedAt, ...rest } = habitacion.toJSON();
                    return rest;
                });
                res.status(200).send(habitacionesSinTimestamps);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Ha ocurrido un error al buscar habitaciones disponibles."
                });
            });
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Ha ocurrido un error al buscar reservas."
        });
    });
};

// Obtener las reservas 
exports.listReservas = (req, res) => {

    // Validar la solicitud
    const { id_hotel, fecha_ingreso, fecha_salida, id_cliente } = req.query;
    const requiredFields = ["id_hotel","fecha_ingreso"];
    for (const field of requiredFields) {
        if (!req.query[field]) {
            res.status(400).send({ message: `El campo ${field} no puede estar vacío!` });
            return;
        }
    }

    try{
        /* Formar las condiciones de la solicitud */
        const where = {
            id_hotel: id_hotel,
            fecha_ingreso: fecha_ingreso,
        };

        /* si existen estos parametros, agregar al criterio de la condicion */
        if (fecha_salida) {
            where.fecha_salida = fecha_salida;
        }
        if (id_cliente) {
            where.id_cliente = id_cliente;
        }
        console.log(Reserva.associations);

        Reserva.findAll({
            where,
            include: [
                {
                    model: Habitacion,
                   
                },
                {
                    model: Cliente,
                   
                },
                {
                    model: Hotel,
                   
                }
            ],
            order: [
                ['fecha_ingreso', 'ASC'],
                [{ model: Habitacion }, 'piso', 'ASC'],
                [{ model: Habitacion }, 'numero', 'ASC']
            ]
        }).then(reservas => {
            if (!reservas || reservas.length === 0) {
                return res.status(404).send({ message: "No se encontraron reservas para los filtros proveidos" });
            }
            res.status(200).send(reservas);
        }).catch(error => {
            res.status(500).send({
                message: "Error al obtener las reservas: " + error.message
            });
        });
    } catch (error) {
        res.status(500).send({
            message: "Error al procesar la solicitud: " + error.message
        });
    }
};