module.exports = app => {
    const hotel = require("../controllers/hoteldao.controller.js");
    var router = require("express").Router();

    // Crear un nuevo hotel
    router.post("/", hotel.create);

    // Obtener todos los hoteles o un hotel por id
    router.get("/:id", hotel.findOne);

    // Obtener todos los hoteles
    router.get("/", hotel.findAll);

    // Actualizar un hotel por id
    router.put("/:id", hotel.update);

    // Eliminar un hotel por id
    router.delete("/:id", hotel.delete);

    app.use('/api/hotel', router);
};