// Practica 3 
// Manejo profesional de errores - Iteración 2

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Error de validación (400)
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Error de validación',
            message: err.message
        });
    }

    // Error de duplicado en base de datos (email ya existe)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            error: 'Conflicto de datos',
            message: 'El email ya está registrado'
        });
    }

    // Error genérico del servidor (500)
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Ocurrió un error inesperado. Inténtelo más tarde.'
    });
};

module.exports = errorHandler;