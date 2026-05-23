// Practica 3 

const db = require('../config/db');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    // Validaciones
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: 'Debe proporcionar un email válido' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (!['admin', 'tecnico', 'usuario'].includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido. Solo se permiten: admin, tecnico, usuario' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`;

        db.query(query, [nombre.trim(), email.trim(), hashedPassword, rol], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'El email ya está registrado' });
                }
                return res.status(500).json({ error: 'Error al registrar usuario' });
            }
            res.status(201).json({ message: 'Usuario registrado correctamente' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno al encriptar contraseña' });
    }
};

const getUsers = (req, res) => {
    db.query('SELECT id_usuario, nombre, email, rol FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
        res.json({ success: true, data: results });
    });
};

module.exports = { registerUser, getUsers };
