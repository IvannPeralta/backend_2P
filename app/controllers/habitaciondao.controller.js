const db = require("../models");
const Habitacion = db.Habitacion;
const Op = db.Sequelize.Op;

// Crear y guardar una nueva habitacion
exports.create = (req, res) => {

    // Validar la solicitud
    const requiredFields = ["numero", "hotelId", "posicion_x", "posicion_y", "piso", "capacidad"];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.status(400).send({ message: `El campo ${field} no puede estar vacío!` });
            return;
        }
    }

    const habitacion = {
        numero: req.body.numero,
        hotelId: req.body.hotelId,
        posicion_x: req.body.posicion_x,
        posicion_y: req.body.posicion_y,
        piso: req.body.piso,
        capacidad: req.body.capacidad,
        caracteristicas: req.body.caracteristicas
    };

    Habitacion.create(habitacion)
    .then(data => {
        res.send(data);
})
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Ha ocurrido un error al crear la habitacion."
        });
    });
};

// Obtener  una habitacion por id
exports.findOne = (req, res) => {
    const id = req.params.id;
    Habitacion.findByPk(id)
    .then(data => {
        if (data === null) {
            res.status(404).send({
                message: `No se puede encontrar la habitacion con id=${id}.`
            });
            return;
        }
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: "Error al obtener la habitacion con id=" + id
        });
    });
};

// Obtener todas las habitaciones
exports.findAll = (req, res) => {
    const hotelId = req.query.hotelId;
    var condition = hotelId ? { hotelId: { [Op.iLike]: `%${hotelId}%` } } : null;

    Habitacion.findAll({ where: condition })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Ocurrio un error al obtener las habitaciones."
        });
    });
}

// Actualizar una habitacion por id
exports.update = (req, res) => {
    const id = req.params.id;

    Habitacion.update(req.body, {
        where: { id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({
                message: "Habitacion actualizada correctamente."
            });
        } else {
            res.send({
                message: `No se puede actualizar la habitacion con id=${id}. Tal vez no fue encontrada o req.body esta vacio!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "Error al actualizar la habitacion con id=" + id
        });
    });
};

// Eliminar una habitacion por id
exports.delete = (req, res) => {
    const id = req.params.id;

    Habitacion.destroy({
        where: { id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({
                message: "Habitacion eliminada correctamente!"
            });
        } else {
            res.send({
                message: `No se puede eliminar la habitacion con id=${id}. Tal vez no fue encontrada!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "No se puede eliminar la habitacion con id=" + id
        });
    });
};

