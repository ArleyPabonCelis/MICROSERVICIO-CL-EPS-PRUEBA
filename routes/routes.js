const express = require('express');
const {MongoClient, ObjectId} = require('mongodb');
const router = express.Router();
require('dotenv').config();
const bases = process.env.DATABASE;

router.get('/home' , async(req, res) =>{
    try {
        res.json('SI FUNCIONA')
    } catch (error) {
        res.json('NO FUNCIONA')
    }
    
});

// *********** ENDPOINTS *********** //
// 1. Obtener todos los pacientes de manera alfabética.
router.get('/ejercicio1', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('usuario');
        const result = await coleccion.find().sort({ "nombre": 1, "primerApellidoUsuar": 1 }).toArray();
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 2. Obtener las citas de una fecha en específico , donde se ordene los pacientes de manera alfabética.
router.get('/ejercicio2', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');
        const result = await coleccion.find(
            {
              "fecha": new Date("2023-09-15T00:00:00.000Z")
            }
          ).sort({
            "datosUsuario.nombre": 1,
            "datosUsuario.primerApellidoUsuar": 1
          }).toArray();   
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 3. Obtener todos los médicos de una especialidad en específico (por ejemplo, ‘Cardiología’).
router.get('/ejercicio3', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('medico');
        const result = await coleccion.find({
            "especialidad": new ObjectId("65033bc510ccabbb22786411")
          }).toArray()
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 4. Encontrar la próxima cita para un paciente en específico (por ejemplo, el paciente con user_id 1).
router.get('/ejercicio4', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');
        const result = await coleccion.find({
            "datosUsuario": new ObjectId("650338df10ccabbb22786407"),
            "fecha": {$gte: new Date() }
        }).sort({"fecha": 1 }).limit(1).toArray();
        
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 5. Encontrar la próxima cita para un paciente en específico (por ejemplo, el paciente con user_id 1).
router.get('/ejercicio5', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');
        const result = await coleccion.aggregate([
            {
                $lookup: {
                    from: "usuario",
                    localField: "datosUsuario",
                    foreignField: "_id",
                    as: "paciente"
                }
            },
            {
                $lookup: {
                    from: "medico",
                    localField: "medico",
                    foreignField: "_id",
                    as: "medico"
                }
            },
            {
                $match: {
                    "medico._id": new ObjectId("65033d9e10ccabbb22786426")
                }
            },
            {
                $unwind: "$paciente"
            },
            {
                $project: {
                    "nombrePaciente": "$paciente.nombre",
                    "apellidoPaciente": "$paciente.primerApellidoUsuar",
                    "telefonoPaciente": "$paciente.telefono",
                    "direccionPaciente": "$paciente.direccion"
                }
            }
        ]).toArray();
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 6. Encontrar todas las citas de un día en específico (por ejemplo, ‘2023-07-12’).
router.get('/ejercicio6', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');
        const result = await coleccion.find({
            "fecha": {
               "$gte": new Date("2023-09-15T00:00:00.000Z"),
               "$lt": new Date("2023-09-18T00:00:00.000Z")
            }
        }).toArray();
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 7. Obtener todos los médicos con sus consultorios correspondientes.
router.get('/ejercicio7', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('medico');
        const result = await coleccion.aggregate([
            {
               $lookup: {
                  from: "consultorio", 
                  localField: "consultorio",
                  foreignField: "_id",
                  as: "consultorio_info"
               }
            },
            {
               $unwind: "$consultorio_info" 
            },
            {
               $project: {
                  _id: 1,
                  nombreCompleto: 1,
                  especialidad: 1,
                  consultorio: "$consultorio_info.nombre" 
               }
            }
        ]).toArray();
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 8. Contar el número de citas que un médico tiene en un día específico
router.get('/ejercicio8', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');     
        const result = await coleccion.aggregate([
            {
               $match: {
                  "fecha": {
                     $gte: new Date("2023-09-15T00:00:00.000Z"),
                     $lt: new Date("2023-09-25T00:00:00.000Z")
                  },
                  "medico": new ObjectId("65033d9e10ccabbb2278642d")
               }
            },
            {
               $count: "totalCitas"
            }
        ]).toArray();
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});

// 8. Contar el número de citas que un médico tiene en un día específico
router.get('/ejercicio8', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');     
        const result = await coleccion.aggregate([
            {
               $match: {
                  "fecha": {
                     $gte: new Date("2023-09-15T00:00:00.000Z"),
                     $lt: new Date("2023-09-25T00:00:00.000Z")
                  },
                  "medico": new ObjectId("65033d9e10ccabbb2278642d")
               }
            },
            {
               $count: "totalCitas"
            }
        ]).toArray();
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 9. Contar el número de citas que un médico tiene en un día específico
router.get('/ejercicio9', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');     
        const result = await coleccion.aggregate([
            {
                $lookup: {
                    from: "consultorio",
                    localField: "medico",
                    foreignField: "_id",
                    as: "consultorio_info"
                }
            },
            {
                $lookup: {
                    from: "usuario",
                    localField: "datosUsuario",
                    foreignField: "_id",
                    as: "usuario_info"
                }
            },
            {
                $match: {
                    "usuario_info.nombre": "Carlos" 
                }
            },
            {
                $project: {
                    "consultorio_info.nombre": 1
                }
            }
        ]).toArray();
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 10. Obtener todas las citas realizadas por los pacientes de acuerdo al género registrado, siempre y cuando el estado de la cita se encuentra registrada como “Atendida”
router.get('/ejercicio10', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');     
        const result = await coleccion.aggregate([
            {
                $lookup: {
                    from: "usuario",
                    localField: "datosUsuario",
                    foreignField: "_id",
                    as: "usuario_info"
                }
            },
            {
                $lookup: {
                    from: "estado_cita",
                    localField: "estadoCita",
                    foreignField: "_id",
                    as: "estadoCita_info"
                }
            },
            {
                $match: {
                    "estadoCita_info.nombre": "Atendida"
                }
            },
            {
                $unwind: "$usuario_info"
            },
            {
                $group: {
                    _id: "$usuario_info.genero",
                    citas: { $push: "$$ROOT" }
                }
            }
        ]).toArray();
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});


// 12. Mostrar todas las citas que fueron canceladas de un mes en específico. Dicha consulta deberá mostrar la fecha de la cita, el nombre del usuario y el médico designado.
router.get('/ejercicio12', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const dataBase = client.db('microservicioClEps');
        const coleccion = dataBase.collection('cita');     
        const result = await coleccion.aggregate([
            {
                $lookup: {
                    from: "usuario",
                    localField: "datosUsuario",
                    foreignField: "_id",
                    as: "usuario_info"
                }
            },
            {
                $lookup: {
                    from: "medico",
                    localField: "medico",
                    foreignField: "_id",
                    as: "medico_info"
                }
            },
            {
                $lookup: {
                    from: "estado_cita",
                    localField: "estadoCita",
                    foreignField: "_id",
                    as: "estadoCita_info"
                }
            },
            {
                $match: {
                    "estadoCita_info.nombre": "Cancelada",
                    "fecha": {
                        $gte: new Date("2023-09-01T00:00:00.000Z"),
                        $lt: new Date("2023-10-01T00:00:00.000Z")
                    }
                }
            },
            {
                $project: {
                    "_id": 0,
                    "fecha": 1,
                    "nombreUsuario": "$usuario_info.nombre",
                    "nombreMedico": "$medico_info.nombreCompleto"
                }
            }
        ]).toArray(); 
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json("No se encontro los datos");
    }
});








module.exports = router





