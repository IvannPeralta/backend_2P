const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const db = require("./app/models");
db.sequelize.sync();

var corsOptions = {
    origin: "http://localhost:9091"
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// simple route
app.get("/", (req, res) => {
    res.json({ message: "Bienvenido Node backend 2020" });
});
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

// set port, listen for requests
const PORT = process.env.PORT || 9090;
// routes
require("./app/routes/hotel.routes.js")(app);
require("./app/routes/habitacion.routes.js")(app);
require("./app/routes/cliente.routes.js")(app);
require("./app/routes/reserva.routes.js")(app);

app.listen(PORT, () => {
    console.log('Servidor corriendo en puerto 9090.');
});