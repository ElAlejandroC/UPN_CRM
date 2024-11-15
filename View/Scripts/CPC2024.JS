document.addEventListener('DOMContentLoaded', function() {
    // Añadir event listeners a cada constancia-item
    const constanciaItems = document.querySelectorAll('.constancia-item');
    
    constanciaItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Ignorar el clic si es en el ícono de eliminar
            if (e.target.closest('.delete-icon')) {
                return;
            }
            
            // Obtener el título de la constancia
            const titulo = item.querySelector('.constancia-title h3').textContent;
            
            // Determinar la ruta basada en el título
            let ruta;
            switch (titulo) {
                case 'Jornada Académica Cultural y de Salud':
                    ruta = '/View/ModuloP.html';
                    break;
                case 'Foro de prácticas profesionales 2024-24 B':
                    ruta = '/View/Practicas2024B.html';
                    break;
                default:
                    console.error('Vista no encontrada');
                    return;
            }
            
            // Navegar a la ruta correspondiente
            window.location.href = ruta;
        });
    });

    // Manejar el botón de regreso
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '/'; // O la ruta principal que corresponda
        });
    }
});