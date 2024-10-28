const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');

const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const cors = require("cors");
const fs = require('fs');

// Configuración de Express
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/View', express.static(__dirname + '/View'));
app.use('/Styles', express.static(path.join(__dirname, 'View/Styles')));
app.use('/Scripts', express.static(path.join(__dirname, 'View/Scripts')));

//Declaracion de Rutas
const inscripciones = require('./Routes/inscripciones');
const pdf = require('./Routes/PDF')

//Uso de rutas
app.use('/api', inscripciones);
app.use('/api', pdf)

// Vistas
app.get('/', (req, res) => {
    res.sendFile('View/ModuloP.html', { root: __dirname });
});

//Enlace con la BD

// Configuración de la conexión MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crm_upn22a'
    
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

app.get('/api/inscripciones', (req, res) => {
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

// Obtener una fila específica con el ID
app.get('/api/obtenerFila/:id', (req, res) => {
    const { id } = req.params; // Obtener el ID de los parámetros de la ruta
    const sql = 'SELECT * FROM jacys2024 WHERE ID = ?'; // Consulta para obtener una fila específica

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }

        // Verificar si se encontró un resultado
        if (results.length === 0) {
            res.status(404).send('Registro no encontrado');
            return;
        }

        res.json(results[0]); // Enviar el primer (y único) resultado
    });
});


app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});

