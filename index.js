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
app.use('/Source', express.static(path.join(__dirname, 'View/Source')));

//Declaracion de Rutas
const inscripciones = require('./Routes/inscripciones');
const pdf1 = require('./Routes/PDF')
const forprac24B = require('./Routes/Forprac24B');
const pdfF24 = require('./Routes/pdfF24B')
//Uso de rutas
app.use('/api', inscripciones);
app.use('/api', pdf1);
app.use('/api', forprac24B);
app.use('/api', pdfF24)

// Vista principal
app.get('/', (req, res) => {
    res.sendFile('View/CPC2024B.html', { root: __dirname });
});

// Rutas para las vistas
app.get('/View/ModuloP.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'View/ModuloP.html'));
});
app.get('/View/Practicas2024B.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'View/Practicas2024B.html'));
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

// Obtener una fila específica con el ID
app.get('/api/obtenerFilafp24/:id', (req, res) => {
    const { id } = req.params; // Obtener el ID de los parámetros de la ruta
    const sql = 'SELECT * FROM forprac24B WHERE ID = ?'; // Consulta para obtener una fila específica

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

