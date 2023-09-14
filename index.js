const express = require('express');
const app = express();
const routerDB = require('./routes/routes.js')

require('dotenv').config();
const port = process.env.PORT

app.use('/eps', routerDB);
app.use(express.json());

app.listen(port, () => {
    console.log(`PROYECTO FUNCIONANDO EN EL PUERTO ${port}`);
})