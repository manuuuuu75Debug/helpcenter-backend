const express = require('express');
const router = express.Router();
const { registerUser, getUsers } = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password, rol]
 *             properties:
 *               nombre: { type: string, example: "Juan Pérez" }
 *               email: { type: string, example: "juan@helpdesk.com" }
 *               password: { type: string, example: "123456" }
 *               rol: { type: string, enum: [admin, tecnico, usuario], example: "usuario" }
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       409:
 *         description: Email ya registrado
 */
router.get('/', authMiddleware, roleMiddleware('admin'), getUsers);

module.exports = router;