const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Configuración de la conexión MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'upn_jac2024'
});

// Verificar la conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

// Endpoint para obtener todas las inscripciones
router.get('/inscripciones', (req, res) => {
    const sql = 'SELECT * FROM inscripciones';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results);
    });
});

// Endpoint para agregar una inscripción
router.post('/agregar', (req, res) => {
    const { Nombre, Prefix, Tipo, formateo, Fecha } = req.body;

    // Primero, obtener el último ID
    const sqlGetLastID = 'SELECT MAX(ID) AS lastID FROM inscripciones';
    
    db.query(sqlGetLastID, (err, results) => {
        if (err) {
            console.error('Error al obtener el último ID:', err);
            res.status(500).send('Error en el servidor');
            return;
        }

        const lastID = results[0].lastID || 0; // Si no hay registros, se empezará en 0
        const newID = lastID + 1; // Asignar el nuevo ID

        // Ahora, insertar el nuevo registro
        const sqlInsert = 'INSERT INTO inscripciones (ID, Nombre, Prefix, Tipo, Actividad, Fecha) VALUES (?, ?, ?, ?, ?, ?)';
        
        db.query(sqlInsert, [newID, Nombre, Prefix, Tipo, formateo, Fecha], (err, results) => {
            if (err) {
                console.error('Error al insertar inscripción:', err);
                res.status(500).send('Error en el servidor');
                return;
            }
            res.status(201).send('Inscripción agregada exitosamente');
        });
    });
});


// Endpoint para eliminar inscripciones
router.delete('/borrar', (req, res) => {
    const { ids } = req.body;
    const sql = 'DELETE FROM inscripciones WHERE ID IN (?)';

    db.query(sql, [ids], (err, results) => {
        if (err) {
            console.error('Error al eliminar inscripciones:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.status(200).send('Inscripciones eliminadas exitosamente');
    });
});

module.exports = router;
