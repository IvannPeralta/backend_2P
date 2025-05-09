const db = require("../models");
const Cliente = db.Cliente;
const Op = db.Sequelize.Op;

// Crear y guardar un nuevo cliente
exports.create = (req, res) => {

    // Validar la solicitud
    const requiredFields = ["cedula", "nombre", "apellido"];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.status(400).send({ message: `El campo ${field} no puede estar vacío!` });
            return;
        }
    }

    const cliente = {
        cedula: req.body.cedula,
        nombre: req.body.nombre,
        apellido: req.body.apellido
    };

    Cliente.create(cliente)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Ha ocurrido un error al crear el cliente."
        });
    });
};

//obtener todos los clientes
exports.findAll = (req, res) => {
    const nombre = req.query.nombre;
    var condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

    Cliente.findAll({ where: condition })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Ocurrio un error al obtener los clientes."
        });
    });
};

// Obtener un cliente por id
exports.findOne = (req, res) => {
    const id = req.params.id;
    Cliente.findByPk(id)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: "Error al obtener el cliente con id=" + id
        });
    });
};