const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Configuración de la conexión MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crm_upn22a'
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
    const sql = 'SELECT * FROM jacys2024';
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
    const { Nombre, Rol, Prefix, Tipo, formateo, Fecha } = req.body;

    // Primero, obtener el último ID
    const sqlGetLastID = 'SELECT MAX(ID) AS lastID FROM jacys2024';
    
    db.query(sqlGetLastID, (err, results) => {
        if (err) {
            console.error('Error al obtener el último ID:', err);
            res.status(500).send('Error en el servidor');
            return;
        }

        const lastID = results[0].lastID || 0; // Si no hay registros, se empezará en 0
        const newID = lastID + 1; // Asignar el nuevo ID

        // Ahora, insertar el nuevo registro
        const sqlInsert = 'INSERT INTO jacys2024 (ID, Nombre, Rol, Prefix, Tipo, Actividad, Fecha) VALUES (?, ?, ?, ?, ?, ?, ?)';
        
        db.query(sqlInsert, [newID, Nombre, Rol, Prefix, Tipo, formateo, Fecha], (err, results) => {
            if (err) {
                console.error('Error al insertar inscripción:', err);
                res.status(500).send('Error en el servidor');
                return;
            }
            res.status(201).send('Inscripción agregada exitosamente');
        });
    });
});

// Endpoint para obtener una inscripción por ID
router.get('/inscripciones/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM jacys2024 WHERE ID = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Inscripción no encontrada');
            return;
        }
        res.json(results[0]);
    });
});

// Endpoint para modificar un registro por ID
router.put('/modificar/:id', (req, res) => {
    const { id } = req.params; // Obtener el ID del registro a modificar
    const { Nombre, Rol ,Prefix, Tipo, Actividad, Fecha } = req.body; // Datos actualizados

    console.log(`ID recibido en el backend: ${id}`);
    console.log(`Datos recibidos: ${JSON.stringify(req.body)}`);

    // Consulta para actualizar el registro
    const sqlUpdate = 'UPDATE jacys2024 SET Nombre = ?, Rol = ?, Prefix = ?, Tipo = ?, Actividad = ?, Fecha = ? WHERE ID = ?';

    // Ejecutar la consulta con los nuevos datos
    db.query(sqlUpdate, [Nombre, Rol,Prefix, Tipo, Actividad, Fecha, id], (err, results) => {
        if (err) {
            console.error('Error al modificar el registro:', err);
            res.status(500).send('Error en el servidor');
            return;
        }

        // Verificar si se actualizó alguna fila
        if (results.affectedRows === 0) {
            res.status(404).send('Registro no encontrado');
            return;
        }

        res.status(200).send('Registro modificado exitosamente');
    });
});



// Endpoint para eliminar inscripciones
router.delete('/borrar', (req, res) => {
    const { ids } = req.body;
    const sql = 'DELETE FROM jacys2024 WHERE ID IN (?)';

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
