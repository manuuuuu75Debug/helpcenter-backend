const API_URL = window.location.origin;
const token = localStorage.getItem('token');

if (!token) window.location.href = '/';

const payload = JSON.parse(atob(token.split('.')[1]));

// Si no es técnico ni admin, regresar al inicio
if (payload.rol !== 'tecnico' && payload.rol !== 'admin') {
    window.location.href = '/';
}

document.getElementById('user-info').textContent = ` ${payload.rol}`;

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

// ========== MIS TICKETS (asignados al técnico logueado) ==========
async function cargarMisTickets() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = '<p>Cargando tus tickets...</p>';

    try {
        const res = await fetchAPI('/tickets');
        // Filtrar solo los asignados a este técnico
        const misTickets = res.data.filter(t => t.tecnico_id === payload.id);

        if (misTickets.length === 0) {
            contenido.innerHTML = '<p>No tienes tickets asignados aún.</p>';
            return;
        }

        let html = '<h2>Mis Tickets Asignados</h2><div class="columnas">';
        const grupos = { abierto: [], en_proceso: [], resuelto: [], cerrado: [] };
        misTickets.forEach(t => {
            if (grupos[t.estado]) grupos[t.estado].push(t);
        });

        for (const estado in grupos) {
            html += `<div class="columna">
                <h3 class="estado-titulo ${estado}">${estado.replace('_', ' ')}</h3>`;

            grupos[estado].forEach(ticket => {
                html += `
                <div class="card-ticket">
                    <strong>#${ticket.id_ticket} - ${ticket.titulo}</strong>
                    <p>${ticket.categoria} | <span class="prioridad ${ticket.prioridad}">${ticket.prioridad}</span></p>
                    <p style="font-size:12px;color:#888;">Creado: ${new Date(ticket.fecha_solicitud).toLocaleDateString('es-ES')}</p>
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

// ========== TODOS LOS TICKETS ==========
async function cargarTodosTickets() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = '<p>Cargando tickets...</p>';

    try {
        const res = await fetchAPI('/tickets');
        const tickets = res.data;

        let html = `<h2>Todos los Tickets</h2>
        <table id="tickets-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>`;

        tickets.forEach(ticket => {
            const asignado = ticket.tecnico_id === payload.id;
            html += `<tr>
                <td>${ticket.id_ticket}</td>
                <td>${ticket.titulo}</td>
                <td>${ticket.categoria}</td>
                <td><span class="prioridad ${ticket.prioridad}">${ticket.prioridad}</span></td>
                <td><span class="estado ${ticket.estado}">${ticket.estado.replace('_',' ')}</span></td>
                <td>${new Date(ticket.fecha_solicitud).toLocaleDateString('es-ES')}</td>
                <td>
                    ${asignado
                        ? `<select onchange="cambiarEstado(${ticket.id_ticket}, this.value)">
                            <option value="abierto"    ${ticket.estado==='abierto'    ?'selected':''}>Abierto</option>
                            <option value="en_proceso" ${ticket.estado==='en_proceso' ?'selected':''}>En proceso</option>
                            <option value="resuelto"   ${ticket.estado==='resuelto'   ?'selected':''}>Resuelto</option>
                            <option value="cerrado"    ${ticket.estado==='cerrado'    ?'selected':''}>Cerrado</option>
                           </select>`
                        : `<span style="color:#aaa;font-size:12px;">No asignado a ti</span>`
                    }
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        contenido.innerHTML = html;

    } catch (err) {
        contenido.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}

// ========== CAMBIAR ESTADO ==========
async function cambiarEstado(id, estado) {
    try {
        await fetchAPI(`/tickets/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
        alert(` Estado actualizado a "${estado}"`);
        cargarMisTickets();
    } catch (err) {
        alert('Error al cambiar estado: ' + err.message);
    }
}

// Cargar mis tickets al entrar
cargarMisTickets();