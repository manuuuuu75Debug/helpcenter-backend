// Practica 3
// Versión mejorada - Iteración 2 (Validaciones robustas)
const db = require('../config/db');

// Lista de categorías y prioridades permitidas
const categoriasValidas = ['constancia', 'vacaciones', 'permiso', 'nomina', 'baja', 'alta','quejas','reporte','cambios','prestacaja','otro'];

const prioridadesValidas = ['baja', 'media', 'alta'];

// ==================== OBTENER SOLICITUDES ====================
const getTickets = (req, res) => {
    const { page = 1, limit = 10, estado, categoria } = req.query;
    const offset = (page - 1) * limit;
    const { id, rol } = req.user;

    let query = `SELECT * FROM tickets`;
    let countQuery = `SELECT COUNT(*) as total FROM tickets`;
    let params = [];
    let countParams = [];
    const conditions = [];

    if (rol === 'usuario') {
        conditions.push('usuario_id = ?');
        params.push(id);
        countParams.push(id);
    }

    if (estado) {
        conditions.push('estado = ?');
        params.push(estado);
        countParams.push(estado);
    }

    if (categoria) {
        conditions.push('categoria = ?');
        params.push(categoria);
        countParams.push(categoria);
    }

    if (conditions.length > 0) {
        const where = ' WHERE ' + conditions.join(' AND ');
        query += where;
        countQuery += where;
    }

    query += ` ORDER BY fecha_solicitud DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener solicitudes' });

        db.query(countQuery, countParams, (err, countResult) => {
            if (err) return res.status(500).json({ error: 'Error al contar registros' });

            res.json({
                success: true,
                data: results,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(countResult[0].total / limit)
                }
            });
        });
    });
};
const createTicket = (req, res) => {
    const { titulo, descripcion, categoria, prioridad } = req.body;
    const { id: usuario_id } = req.user;

    if (!titulo || titulo.trim().length < 5) {
        return res.status(400).json({ error: 'El título debe tener al menos 5 caracteres' });
    }
    if (!descripcion || descripcion.trim().length < 10) {
        return res.status(400).json({ error: 'La descripción debe tener al menos 10 caracteres' });
    }
    if (!categoria || !categoriasValidas.includes(categoria)) {
        return res.status(400).json({ 
            error: 'Categoría inválida', 
            categoriasPermitidas: categoriasValidas 
        });
    }
    if (prioridad && !prioridadesValidas.includes(prioridad)) {
        return res.status(400).json({ error: 'Prioridad inválida' });
    }

    const query = `
        INSERT INTO tickets (titulo, descripcion, categoria, prioridad, estado, usuario_id)
        VALUES (?, ?, ?, ?, 'abierto', ?)
    `;

    db.query(query, [titulo.trim(), descripcion.trim(), categoria, prioridad || 'media', usuario_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear la solicitud' });
        res.status(201).json({ 
            success: true,
            message: 'Solicitud creada correctamente', 
            id: result.insertId 
        });
    });
};

const updateTicket = (req, res) => {
    const { id } = req.params;
    const { estado, prioridad } = req.body;

    if (!estado && !prioridad) {
        return res.status(400).json({ 
            error: 'Debe enviar al menos un campo para actualizar (estado o prioridad)' 
        });
    }

    if (prioridad && !prioridadesValidas.includes(prioridad)) {
        return res.status(400).json({ 
            error: 'Prioridad inválida. Solo se permiten: baja, media, alta'
        });
    }

    const query = `UPDATE tickets SET estado = ?, prioridad = ? WHERE id_ticket = ?`;

    db.query(query, [estado, prioridad, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar solicitud' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
        res.json({ message: 'Solicitud actualizada correctamente' });
    });
};

const deleteTicket = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tickets WHERE id_ticket = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar solicitud' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
        res.json({ message: 'Solicitud eliminada correctamente' });
    });
};

module.exports = { getTickets, createTicket, updateTicket, deleteTicket };