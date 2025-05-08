module.exports = app => {
    const cliente = require("../controllers/clientedao.controller.js");
    var router = require("express").Router();

    // Crear un nuevo cliente
    router.post("/", cliente.create);

    // Obtener todos los clientes o un cliente por id
    router.get("/:id", cliente.findOne);

    // Obtener todos los clientes
    router.get("/", cliente.findAll);

    app.use('/api/cliente', router);
}