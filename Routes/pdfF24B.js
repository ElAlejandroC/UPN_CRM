const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

//Dependencias PDF
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const cors = require("cors");
const fs = require('fs');

// Configuración de la conexión MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crm_upn22a'
});

router.get('/generar-pdffp24/:id', async (req, res) => {
    const inscritoId = req.params.id;

    const sql = 'SELECT * FROM forprac24B WHERE ID = ?';

    db.query(sql, [inscritoId], async (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Inscrito no encontrado');
            return;
        }

        const inscrito = results[0];

        try {
            const existingPdfBytes = fs.readFileSync('Model/Materiales/generica.pdf');
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            pdfDoc.registerFontkit(fontkit);
            
            // Cargar fuentes
            const calibriBoldBytes = fs.readFileSync('Model/Materiales/GandhiSans-Bold.otf');
            const calibriBytes = fs.readFileSync('Model/Materiales/GandhiSans-Regular.otf');
            const calibriItalicBytes = fs.readFileSync('Model/Materiales/Arial_Italic.ttf');
            const calibriBoldItalicFontBytes = fs.readFileSync('Model/Materiales/GandhiSans-BoldItalic.otf');
            
            const calibriBoldFont = await pdfDoc.embedFont(calibriBoldBytes);
            const calibriFont = await pdfDoc.embedFont(calibriBytes);
            const calibriItalicFont = await pdfDoc.embedFont(calibriItalicBytes);
            const calibriBoldItalicFont = await pdfDoc.embedFont(calibriBoldItalicFontBytes);

            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const firmaImagen = fs.readFileSync('Model/Materiales/firma.png');
            const firmaPng = await pdfDoc.embedPng(firmaImagen);
            const { width, height } = firstPage.getSize();

            // Configuración de márgenes
            const margenIzquierdo = 100;
            const margenDerecho = 100;
            const maxWidth = width - margenIzquierdo - margenDerecho;

            // Función para dividir el texto en líneas
            function splitTextToLines(textParts, fonts, fontSize, maxLineWidth) {
                let lines = [];
                let currentLine = [];
                let currentWidth = 0;

                textParts.forEach(({ text, fontType }) => {
                    const font = fonts[fontType];
                    const words = text.split(' ');

                    words.forEach(word => {
                        const wordWidth = font.widthOfTextAtSize(word, fontSize);
                        const spaceWidth = font.widthOfTextAtSize(' ', fontSize);
                        
                        if (currentWidth + wordWidth + (currentLine.length > 0 ? spaceWidth : 0) > maxLineWidth) {
                            lines.push([...currentLine]);
                            currentLine = [];
                            currentWidth = 0;
                        }

                        currentLine.push({ text: word, fontType });
                        currentWidth += wordWidth + (currentLine.length > 0 ? spaceWidth : 0);
                    });
                });

                if (currentLine.length > 0) {
                    lines.push(currentLine);
                }

                return lines;
            }

            // Función para calcular el ancho total de una línea
            function getLineWidth(lineSegments, fonts, fontSize) {
                return lineSegments.reduce((totalWidth, segment, index) => {
                    const font = fonts[segment.fontType];
                    const wordWidth = font.widthOfTextAtSize(segment.text, fontSize);
                    const spaceWidth = index < lineSegments.length - 1 ? font.widthOfTextAtSize(' ', fontSize) : 0;
                    return totalWidth + wordWidth + spaceWidth;
                }, 0);
            }

            // Dibujar el nombre
            const nombre = inscrito.Nombre;
            const nombreSize = 28;
            const nombreWidth = calibriBoldFont.widthOfTextAtSize(nombre, nombreSize);
            const nombreX = (width - nombreWidth) / 2;
            const nombreY = height - 300;

            firstPage.drawText(nombre, {
                x: nombreX,
                y: nombreY,
                size: nombreSize,
                font: calibriBoldFont,
                color: rgb(0, 0, 0),
            });

            // Preparar el texto principal
            const temaSize = 15.5;
            const parte1 = { text: 'Por su participación', fontType: 'normal' };
            const rol = { text: inscrito.Rol, fontType: 'normal' };
            const parte2 = {text: 'Foro de Prácticas Profesionales', fontType: 'bold'}
            const prefijo = {text:'de la', fontType: 'normal'}
            const parte3 = { text:'Licenciatura en Intervención Educatica. (LIE02),', fontType: 'italic' };
            const parte4 = {text: 'durante el semestre 2024-B desarrollado en la UPN 22-A Querétaro.',fontType: 'normal'}

            const fonts = {
                normal: calibriFont,
                bold: calibriBoldFont,
                italic: calibriItalicFont,
                boldItalic: calibriBoldItalicFont
            };

            let currentY = nombreY - 70;
            const lineHeight = temaSize * 1.2;
            console.log(rol)
            // Dividir y dibujar el texto
            const textParts = [parte1,rol,parte2,prefijo, parte3, parte4];
            const lines = splitTextToLines(textParts, fonts, temaSize, maxWidth);


            lines.forEach(line => {
                // Calcular el ancho total de la línea para centrarla
                const lineWidth = getLineWidth(line, fonts, temaSize);
                let xPosition = (width - lineWidth) / 2;
                
                line.forEach((segment, index) => {
                    const font = fonts[segment.fontType];
                    
                    firstPage.drawText(segment.text, {
                        x: xPosition,
                        y: currentY,
                        size: temaSize,
                        font: font,
                        color: rgb(0, 0, 0),
                    });

                    xPosition += font.widthOfTextAtSize(segment.text, temaSize);
                    
                    // Añadir espacio entre palabras, excepto después de la última palabra
                    if (index < line.length - 1) {
                        xPosition += font.widthOfTextAtSize(' ', temaSize);
                    }
                });

                currentY -= lineHeight;
            });

            // Dibujar la fecha
            const fechaT = inscrito.Fecha;
            const fechaSize = 15.5;
            const fechaWidth = calibriFont.widthOfTextAtSize(fechaT, fechaSize);
            const fechaX = (width - fechaWidth) / 2;
            const fechaY = currentY - 40;

            firstPage.drawText(fechaT, {
                x: fechaX,
                y: fechaY,
                size: fechaSize,
                font: calibriFont,
                color: rgb(0, 0, 0),
            });

            // Posicionar la firma justo debajo de la fecha
            const firmaDims = firmaPng.scale(0.015); // Escalar la imagen si es necesario
            const firmaX = (width - firmaDims.width) / 2;
            const firmaY = fechaY - firmaDims.height - 10; // Ajustar la posición Y para que quede debajo de la fecha

            firstPage.drawImage(firmaPng, {
                x: firmaX,
                y: firmaY,
                width: firmaDims.width,
                height: firmaDims.height,
            });

            const pdfBytes = await pdfDoc.save();
            
            // Guardar y enviar el PDF
            fs.writeFileSync('constancia_completada_test.pdf', pdfBytes);
            console.log('PDF generado y guardado como constancia_completada_test.pdf');
            
            res.setHeader('Content-Disposition', `attachment; filename=Constancia_Jornada_Academica_${nombre}.pdf`);
            res.setHeader('Content-Type', 'application/pdf');
            res.send(Buffer.from(pdfBytes));
        } catch (error) {
            console.error('Error al generar el PDF:', error);
            res.status(500).send('Error al generar el PDF');
        }
    });
});

module.exports = router;
