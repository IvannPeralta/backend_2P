module.exports = app => {
    const habitacion = require("../controllers/habitaciondao.controller.js");
    var router = require("express").Router();

    // Crear una nueva habitacion
    router.post("/", habitacion.create);

    // Obtener todas las habitaciones o una habitacion por id
    router.get("/:id", habitacion.findOne);

    // Obtener todas las habitaciones
    router.get("/", habitacion.findAll);

    // Actualizar una habitacion por id
    router.put("/:id", habitacion.update);

    // Eliminar una habitacion por id
    router.delete("/:id", habitacion.delete);

    app.use('/api/habitacion', router);
}