document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = form.username.value;
        const password = form.password.value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.redirected) {
                window.location.href = response.url;
            } else {
                const errorText = await response.text();
                alert(errorText);
            }
        } catch (err) {
            console.error('Error en login:', err);
            alert('Error de conexión');
        }
    });
});
