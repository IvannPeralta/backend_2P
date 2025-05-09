module.exports = app => {
    const reserva = require("../controllers/reservadao.controller.js");
    var router = require("express").Router();

    // Crear una nueva reserva
    router.post("/", reserva.create);

    // Buscar habitaciones disponibles
    router.post("/buscarDisponibles", reserva.buscarDisponibles);

    router.get("/listReservas", reserva.listReservas);

    app.use('/api/reserva', router);
}