const API_URL = window.location.origin;
const token = localStorage.getItem('token');

if (!token) window.location.href = '/';

const payload = JSON.parse(atob(token.split('.')[1]));
document.getElementById('user-info').textContent = `Rol: ${payload.rol}`;

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});

async function fetchAPI(endpoint, options = {}) {
    const res = await fetch(API_URL + endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
}
// ==================== DASHBOARD ====================
async function cargarDashboard() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = '<p style="color:var(--text-muted)">Cargando dashboard...</p>';

    try {
        const [resTickets, resUsuarios] = await Promise.all([
            fetchAPI('/tickets?limit=100'),
            fetchAPI('/users')
        ]);

        const tickets = resTickets.data;
        const usuarios = resUsuarios.data;

        // Contar por estado
        const porEstado = { abierto: 0, en_proceso: 0, resuelto: 0, cerrado: 0 };
        tickets.forEach(t => { if (porEstado[t.estado] !== undefined) porEstado[t.estado]++; });

        // Contar por prioridad
        const porPrioridad = { alta: 0, media: 0, baja: 0 };
        tickets.forEach(t => { if (porPrioridad[t.prioridad] !== undefined) porPrioridad[t.prioridad]++; });

        contenido.innerHTML = `
        <h2>Dashboard</h2>

        <!-- STATS PRINCIPALES -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Tickets</div>
                <div class="stat-value">${tickets.length}</div>
                <div class="stat-sub">registrados en el sistema</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Abiertos</div>
                <div class="stat-value" style="color:#34d399">${porEstado.abierto}</div>
                <div class="stat-sub">pendientes de atender</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">En Proceso</div>
                <div class="stat-value" style="color:#fbbf24">${porEstado.en_proceso}</div>
                <div class="stat-sub">siendo atendidos</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Usuarios</div>
                <div class="stat-value" style="color:#60a5fa">${usuarios.length}</div>
                <div class="stat-sub">registrados en el sistema</div>
            </div>
        </div>

        <!-- FILA SECUNDARIA -->
        <div class="stats-grid" style="margin-bottom:32px">
            <div class="stat-card">
                <div class="stat-label">Resueltos</div>
                <div class="stat-value" style="color:#60a5fa">${porEstado.resuelto}</div>
                <div class="stat-sub">completados</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Cerrados</div>
                <div class="stat-value" style="color:#94a3b8">${porEstado.cerrado}</div>
                <div class="stat-sub">archivados</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Prioridad Alta</div>
                <div class="stat-value" style="color:#f87171">${porPrioridad.alta}</div>
                <div class="stat-sub">requieren atención urgente</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Prioridad Media</div>
                <div class="stat-value" style="color:#fbbf24">${porPrioridad.media}</div>
                <div class="stat-sub">atención normal</div>
            </div>
        </div>

        <!-- TABLA ÚLTIMOS TICKETS -->
        <h2>Últimos tickets registrados</h2>
        <table id="tickets-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                ${tickets.slice(0, 8).map(t => `
                <tr>
                    <td>#${t.id_ticket}</td>
                    <td>${t.titulo}</td>
                    <td>${t.categoria}</td>
                    <td><span class="prioridad ${t.prioridad}">${t.prioridad}</span></td>
                    <td><span class="estado ${t.estado}">${t.estado.replace('_',' ')}</span></td>
                    <td>${new Date(t.fecha_solicitud).toLocaleDateString('es-ES')}</td>
                </tr>`).join('')}
            </tbody>
        </table>
        `;

    } catch (err) {
        contenido.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
    }
}
// Tickets organizados por estado y prioridad
async function cargarTickets() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = '<p>Cargando tickets...</p>';

    try {
        const res = await fetchAPI('/tickets');
        const tickets = res.data;

        const grupos = { abierto: [], en_proceso: [], resuelto: [], cerrado: [] };
        tickets.forEach(t => {
            if (grupos[t.estado]) grupos[t.estado].push(t);
        });

        let html = '<h2>Tickets por estado</h2><div class="columnas">';

        for (const estado in grupos) {
            html += `<div class="columna">
                <h3 class="estado-titulo ${estado}">${estado.replace('_', ' ')}</h3>`;

            grupos[estado].forEach(ticket => {
                html += `
                <div class="card-ticket">
                    <strong>#${ticket.id_ticket} - ${ticket.titulo}</strong>
                    <p>${ticket.categoria} | <span class="prioridad ${ticket.prioridad}">${ticket.prioridad}</span></p>
                    <select onchange="cambiarEstado(${ticket.id_ticket}, this.value)">
                        <option value="abierto"    ${ticket.estado === 'abierto'    ? 'selected' : ''}>Abierto</option>
                        <option value="en_proceso" ${ticket.estado === 'en_proceso' ? 'selected' : ''}>En proceso</option>
                        <option value="resuelto"   ${ticket.estado === 'resuelto'   ? 'selected' : ''}>Resuelto</option>
                        <option value="cerrado"    ${ticket.estado === 'cerrado'    ? 'selected' : ''}>Cerrado</option>
                    </select>
                </div>`;
            });

            html += `</div>`;
        }

        html += '</div>';
        contenido.innerHTML = html;

    } catch (err) {
        contenido.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}

async function cambiarEstado(id, estado) {
    try {
        await fetchAPI(`/tickets/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
        alert(` Estado actualizado a "${estado}"`);
        cargarTickets();
    } catch (err) {
        alert('Error al cambiar estado: ' + err.message);
    }
}

async function cargarUsuarios() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = '<p>Cargando usuarios...</p>';

    try {
        const res = await fetchAPI('/users');
        const usuarios = res.data;

        let html = `<h2>Usuarios del sistema</h2>
        <table id="tickets-table">
            <thead>
                <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th></tr>
            </thead>
            <tbody>`;

        usuarios.forEach(u => {
            html += `<tr>
                <td>${u.id_usuario}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td><span class="estado ${u.rol}">${u.rol}</span></td>
            </tr>`;
        });

        html += '</tbody></table>';
        contenido.innerHTML = html;

    } catch (err) {
        contenido.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}

cargarDashboard();
