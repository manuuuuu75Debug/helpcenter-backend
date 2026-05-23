// Practica 3

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const { asignarTecnico, cambiarEstado } = require('../controllers/ticketWorkflow.controller');

// Solo Admin puede asignar tickets a técnicos
router.put('/:id/asignar', authMiddleware, roleMiddleware('admin'), asignarTecnico);

// Solo Técnico y Admin pueden cambiar el estado
router.put('/:id/estado', authMiddleware, roleMiddleware('tecnico', 'admin'), cambiarEstado);

module.exports = router;