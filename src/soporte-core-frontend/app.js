const API_URL = window.location.origin;
let token = localStorage.getItem('token');

const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const userInfo = document.getElementById('user-info');
const btnLogout = document.getElementById('btn-logout');
const btnLogin = document.getElementById('btn-login');
const btnNuevaSolicitud = document.getElementById('btn-nueva-solicitud');
const modalCrear = document.getElementById('modal-crear');
const btnCrearSolicitud = document.getElementById('btn-crear-solicitud');
const btnCancelar = document.getElementById('btn-cancelar');

async function fetchAPI(endpoint, options = {}) {
    const response = await fetch(API_URL + endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        ...options
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error en la petición');
    }
    return response.json();
}

// ==================== CARGAR TICKETS ====================
async function cargarTickets() {
    try {
        const tickets = await fetchAPI('/tickets');
        const tbody = document.querySelector('#tickets-table tbody');
        tbody.innerHTML = '';

        if (tickets.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;">No tienes solicitudes registradas</td></tr>`;
            return;
        }

        tickets.data.forEach(ticket => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${ticket.id_ticket}</td>
                <td>${ticket.titulo}</td>
                <td>${ticket.categoria}</td>
                <td><strong>${ticket.prioridad}</strong></td>
                <td><span class="estado ${ticket.estado}">${ticket.estado.replace('_', ' ')}</span></td>
                <td>${new Date(ticket.fecha_solicitud).toLocaleDateString('es-ES')}</td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        alert('Error al cargar las solicitudes: ' + error.message);
    }
}

// ==================== LOGIN ====================
btnLogin.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Por favor ingresa email y contraseña');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);

            //  Redirigir según rol
            if (data.user.rol === 'admin') {
                window.location.href = '/admin.html';
                return;
            }
            if (data.user.rol === 'tecnico') {
                window.location.href = '/tecnico.html';
                return;
            }

            // Usuario normal se queda aquí
            loginSection.style.display = 'none';
            mainSection.style.display = 'block';
            userInfo.textContent = ` ${data.user.nombre} (${data.user.rol})`;
            btnLogout.style.display = 'inline-block';
            cargarTickets();

        } else {
            alert(data.error || 'Credenciales incorrectas');
        }
    } catch (error) {
        alert('Error de conexión con el servidor');
    }
});

// ==================== CREAR SOLICITUD ====================
btnNuevaSolicitud.addEventListener('click', () => {
    modalCrear.style.display = 'flex';
});

btnCancelar.addEventListener('click', () => {
    modalCrear.style.display = 'none';
});

btnCrearSolicitud.addEventListener('click', async () => {
    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const categoria = document.getElementById('categoria').value;
    const prioridad = document.getElementById('prioridad').value;

    if (!titulo || !descripcion || !categoria) {
        alert('Título, descripción y categoría son obligatorios');
        return;
    }

    try {
        await fetchAPI('/tickets', {
            method: 'POST',
            body: JSON.stringify({ titulo, descripcion, categoria, prioridad })
        });

        alert(' Solicitud creada correctamente');
        modalCrear.style.display = 'none';
        document.getElementById('titulo').value = '';
        document.getElementById('descripcion').value = '';
        document.getElementById('categoria').value = '';
        cargarTickets();

    } catch (error) {
        alert('Error al crear la solicitud: ' + error.message);
    }
});

// ==================== CERRAR SESIÓN ====================
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    location.reload();
});

// ==================== INICIALIZACIÓN ====================
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Si ya tiene sesión activa, redirigir según rol
    if (payload.rol === 'admin') {
        window.location.href = '/admin.html';
    } else if (payload.rol === 'tecnico') {
        window.location.href = '/tecnico.html';
    } else {
        loginSection.style.display = 'none';
        mainSection.style.display = 'block';
        btnLogout.style.display = 'inline-block'; 
        userInfo.textContent = 'Cargando...';
        cargarTickets();
    }
}