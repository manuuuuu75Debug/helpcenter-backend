// Practica 3

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const { getTickets, createTicket, updateTicket, deleteTicket } = require('../controllers/tickets.controller');

// ==================== RUTAS PROTEGIDAS ====================

// Solo Técnico y Admin pueden ver todas las solicitudes
router.get('/', authMiddleware, roleMiddleware('tecnico', 'admin'), getTickets);

// Solo Usuario y Admin pueden crear solicitudes
router.post('/', authMiddleware, roleMiddleware('usuario', 'admin'), createTicket);

// Solo Técnico y Admin pueden actualizar solicitudes
router.put('/:id', authMiddleware, roleMiddleware('tecnico', 'admin'), updateTicket);

// Solo Admin puede eliminar solicitudes
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteTicket);

module.exports = router;