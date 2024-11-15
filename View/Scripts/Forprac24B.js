window.onload = function() {
    cargarDatos();
    // Asegurarse de que el modal de agregar esté cerrado si existe
    const agregarModalElement = document.getElementById('agregarModal');
    if (agregarModalElement) {
        const agregarModal = bootstrap.Modal.getInstance(agregarModalElement);
        if (agregarModal) agregarModal.hide();
    }
};

// Cargar los datos en la tabla al cargar la página
async function cargarDatos() {
    try {
        const response = await fetch('http://localhost:3000/api/inscripcionesfp24');
        const inscritos = await response.json();
        const tableBody = document.getElementById('inscritos-table-body');
        tableBody.innerHTML = '';
        inscritos.forEach(inscrito => {
            const fila = `<tr>
                            <td><input type="checkbox" class="fila-checkbox"></td>
                            <td>${inscrito.ID}</td>
                            <td>${inscrito.Nombre}</td>
                            <td>${inscrito.Rol}</td>
                            <td>${inscrito.Fecha}</td>
                            <td>
                                <button class="btn btn-primary" onclick="descargarPDF(${inscrito.ID})">Descargar</button>
                            </td>
                            <td>
                                <button class="btn btn-primary" onclick="abrirModalModificar(${inscrito.ID})">Modificar</button>
                            </td>
                            <td>
                                <button class="btn btn-danger" onclick="eliminarRegistro(${inscrito.ID})">Eliminar</button>
                            </td>
                          </tr>`;
            tableBody.innerHTML += fila;
        });
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

// Seleccionar o deseleccionar todas las filas
function seleccionarTodos(source) {
    const checkboxes = document.querySelectorAll('.fila-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = source.checked);
}
// Mostrar los checkboxes para eliminar
function activarSeleccion() {
    const checkboxes = document.querySelectorAll('.fila-checkbox');
    const eliminarBtn = document.getElementById('eliminar-btn');
    
    // Si los checkboxes están ocultos, mostrarlos y cambiar el texto del botón
    if (checkboxes[0].style.display === 'none' || checkboxes[0].style.display === '') {
        checkboxes.forEach(checkbox => checkbox.style.display = 'block');
        eliminarBtn.textContent = 'Confirmar Eliminación';
        eliminarBtn.onclick = mostrarModalConfirmacion;
    } else {
        // Si están visibles, ocultarlos y restaurar el botón
        checkboxes.forEach(checkbox => checkbox.style.display = 'none');
        eliminarBtn.textContent = 'Eliminar Registros';
        eliminarBtn.onclick = activarSeleccion;
    }
}
// Añade la función para mostrar el modal de confirmación
function mostrarModalConfirmacion() {
    const checkboxes = document.querySelectorAll('.fila-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.closest('tr').children[1].textContent);
    
    if (ids.length === 0) {
        alert('Por favor, selecciona al menos un registro para eliminar');
        return;
    }

    const listaIds = document.getElementById('lista-ids-eliminar');
    listaIds.innerHTML = `<strong>IDs seleccionados:</strong><br>${ids.join(', ')}`;

    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal'));
    modal.show();
}
// Añade la función para confirmar la eliminación
async function confirmarEliminacion() {
    const checkboxes = document.querySelectorAll('.fila-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.closest('tr').children[1].textContent);

    try {
        const response = await fetch('http://localhost:3000/api/borrarfp24', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
    
        if (response.ok) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarModal'));
            modal.hide();
            
            // Recargar los datos y restaurar el botón
            await cargarDatos();
            const eliminarBtn = document.getElementById('eliminar-btn');
            eliminarBtn.textContent = 'Eliminar Registros';
            eliminarBtn.onclick = activarSeleccion;
            
            // Ocultar checkboxes
            const checkboxes = document.querySelectorAll('.fila-checkbox');
            checkboxes.forEach(checkbox => checkbox.style.display = 'none');
            
            // Desmarcar el checkbox principal
            document.getElementById('select-all').checked = false;
            
            // Mostrar mensaje de éxito
            alert('Registros eliminados exitosamente');
        } else {
            throw new Error('Error al eliminar los registros');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar los registros');
    }
}
// Eliminar los registros seleccionados
async function eliminarRegistro(id) {    
    ids = id
    try {
        const response = await fetch('http://localhost:3000/api/borrarfp24', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ids})
        });

        if (response.ok) {
            alert("Registros eliminados exitosamente.");
            cargarDatos(); // Recargar la tabla después de eliminar
        } else {
            console.error('Error al eliminar los registros');
            alert("Hubo un error al eliminar los registros.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Hubo un error en la comunicación con el servidor.");
    }
}

// Manejar el envío del formulario para agregar participación
document.getElementById('agregar-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const Nombre = document.getElementById('nombre').value;
    // Captura el valor del día elegido
    const Rol = document.getElementById('rol').value
    const diaElegido = document.getElementById('fecha').value;
    const Fecha = `Santiago de Querétaro, Qro., a ${diaElegido}`;

    try {
        const response = await fetch('http://localhost:3000/api/agregarfp24', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Nombre, Rol,Fecha })
        });
        console.log(response);
        if (response.ok) {
            cargarDatos(); 
            document.getElementById('agregar-form').reset(); 
            const modal = bootstrap.Modal.getInstance(document.getElementById('agregarModal'));
            modal.hide(); 
        } else {
            console.error('Error al agregar participación');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Función para abrir el modal de modificación
async function abrirModalModificar(id) { // Recibe el ID
    idModificar = id;
    console.log(`ID a modificar: ${idModificar}`);
    try {
        // Obtiene los datos del registro por ID
        const response = await fetch(`http://localhost:3000/api/obtenerFilafp24/${idModificar}`);
        const data = await response.json();

        // Llena el formulario con los datos obtenidos
        document.getElementById('modificar-nombre').value = data.Nombre;
        document.getElementById('modificar-rol').value = data.Rol;
        document.getElementById('modificar-fecha').value = data.Fecha;

        const modificarModalElement = document.getElementById('modificarModal');
        if (modificarModalElement) {
            const modificarModal = new bootstrap.Modal(modificarModalElement);
            modificarModal.show();
        } else {
            console.error("El modal de modificación no está en el DOM.");
        }
    } catch (error) {
        console.error('Error al obtener los datos del registro:', error);
    }
    return idModificar
}

async function modificarRegistro(idModificar) {
    console.log(idModificar);

    // Obtener los valores actualizados del formulario
    const Nombre = document.getElementById('modificar-nombre').value;
    const Rol = document.getElementById('modificar-rol').value;
    const diaElegido = document.getElementById('modificar-fecha').value;
    
    // Obtener el elemento de fecha actual con manejo de error
    const fechaElement = document.getElementById(`fecha-${idModificar}`);
    let Fecha;

    // Función auxiliar para formatear la fecha
    const formatearFecha = (fecha) => {
        const prefijo = "Santiago de Querétaro, Qro., a ";
        // Si la fecha ya incluye el prefijo, la devolvemos tal cual
        if (fecha.startsWith(prefijo)) {
            return fecha;
        }
        // Si no tiene el prefijo, se lo agregamos
        return prefijo + fecha;
    };

    if (diaElegido) {
        // Si hay una nueva fecha seleccionada, la formateamos
        Fecha = formatearFecha(diaElegido);
    } else if (fechaElement && fechaElement.innerText) {
        // Si no hay nueva fecha pero existe una fecha actual, la mantenemos
        Fecha = formatearFecha(fechaElement.innerText);
    } else {
        // Si no hay fecha nueva ni actual, usamos la fecha de hoy
        const hoy = new Date().toISOString().split('T')[0];
        Fecha = formatearFecha(hoy);
    }

    try {
        const response = await fetch(`http://localhost:3000/api/modificarfp24/${idModificar}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Nombre, Rol, Fecha }),
        });

        if (response.ok) {
            alert("Registros modificados exitosamente.");

            // Cerrar el modal
            const modalElement = document.getElementById('modificarModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }

            cargarDatos(); // Recargar la tabla después de modificar
        } else {
            console.error('Error al modificar los registros');
            alert("Hubo un error al modificar los registros.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Hubo un error en la comunicación con el servidor.");
    }
}

function descargarPDF(id) {
    window.location.href = `http://localhost:3000/api/generar-pdffp24/${id}`;
}
