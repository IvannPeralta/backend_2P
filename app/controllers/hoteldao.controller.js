const db = require("../models");
const Hotel = db.Hotel;
const Op = db.Sequelize.Op;

// Crear y guardar un nuevo hotel
exports.create = (req, res) => {

    // Validar la solicitud
    const requiredFields = ["nombre","direccion"];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.status(400).send({ message: `El campo ${field} no puede estar vacío!` });
            return;
        }
    }

    const hotel = {
        nombre: req.body.nombre,
        direccion: req.body.direccion
    };

    Hotel.create(hotel)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Ha ocurrido un error al crear el hotel."
        });
    });
};

// Obtener un hotel por id sin los campos createdAt y updatedAt
exports.findOne = (req, res) => {
    const id = req.params.id;
    Hotel.findByPk(id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    })
    .then(data => {
        if (data == null) {
            res.status(404).send({
                message: "No se encontró el hotel con id=" + id
            });
            return;
        }
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: "Error al obtener el hotel con id=" + id
        });
    });
};

// Obtener todos los hoteles sin los campos createdAt y updatedAt
exports.findAll = (req, res) => {
    const nombre = req.query.nombre;
    var condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

    Hotel.findAll({ 
        where: condition,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Ocurrio un error al obtener los hoteles."
        });
    });
};

// Actualizar un hotel por id
exports.update = (req, res) => {
    const id = req.params.id;

    Hotel.update(req.body, {
        where: { id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({
                message: "El hotel fue actualizado exitosamente."
            });
        } else {
            res.status(400).send({
                message: `No se puede actualizar el hotel con id=${id}. Quizas no existe o el body esta vacio!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "Error al actualizar el hotel con id=" + id
        });
    });
};

// Eliminar un hotel por id
exports.delete = (req, res) => {
    const id = req.params.id;

    Hotel.destroy({
        where: { id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({
                message: "El hotel fue eliminado exitosamente!"
            });
        }
        else {
            res.status(400).send({
                message: `No se puede eliminar el hotel con id=${id}. Quizas no existe!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "No se puede eliminar el hotel con id=" + id
        });
    });
};

