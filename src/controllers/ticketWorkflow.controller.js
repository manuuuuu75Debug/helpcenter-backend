const db = require('../config/db');
//practica 10
const estadosValidos = ['abierto', 'en_proceso', 'resuelto', 'cerrado'];

//asignar tecnico
const asignarTecnico = async (req, res) => {
    const { id } = req.params;
    const { tecnico_id } = req.body;

    if (!tecnico_id) {
        return res.status(400).json({ error: 'El tecnico_id es obligatorio' });
    }

    try {
        const [result] = await db.promise().query(
            'UPDATE tickets SET tecnico_id = ?, estado = "en_proceso" WHERE id_ticket = ?',
            [tecnico_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        res.json({ message: 'Ticket asignado correctamente al técnico' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al asignar técnico' });
    }
};

//cambiar estado
const cambiarEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ error: 'El estado es obligatorio' });
    }

    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
            error: 'Estado inválido',
            estadosValidos 
        });
    }

    try {
        const [result] = await db.promise().query(
            'UPDATE tickets SET estado = ? WHERE id_ticket = ?',
            [estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        res.json({ message: `Estado actualizado a "${estado}" correctamente` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

module.exports = { asignarTecnico, cambiarEstado };