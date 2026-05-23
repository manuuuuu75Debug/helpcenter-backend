// src/controllers/auth.controller.js

const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = (req, res) => {
    console.log("📥 Body recibido:", req.body);   // ← Para debug

    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ 
            error: 'Email y contraseña son obligatorios' 
        });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(" Error en consulta:", err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = results[0];

        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            message: 'Login exitoso', 
            token,
            user: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    });
};

module.exports = { login };