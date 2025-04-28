document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pacienteForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = form.nombre.value;
            const edad = form.edad.value;
            const enfermedad = form.enfermedad.value;

            try {
                const response = await fetch('/pacientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, edad, enfermedad })
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    const errorText = await response.text();
                    alert(errorText);
                }
            } catch (err) {
                console.error('Error al guardar paciente:', err);
                alert('Error de conexión');
            }
        });
    }
});
