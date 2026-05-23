// Practica 3 
// Versión mejorada - Iteración 2 (Miércoles - Seguridad)

const roleMiddleware = (...rolesPermitidos) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado y tenga rol
        if (!req.user || !req.user.rol) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado o rol no definido en el token'
            });
        }

        const userRole = req.user.rol;

        // Verificar si el rol del usuario está permitido
        if (!rolesPermitidos.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado',
                message: `No tienes permiso. Roles permitidos: ${rolesPermitidos.join(', ')}`
            });
        }

        next(); // Todo correcto, continuar
    };
};

module.exports = roleMiddleware;