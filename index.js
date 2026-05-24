require('dotenv').config();

const express = require('express');
const db = require('./src/config/db'); 

const app = express();

const cors = require('cors');       

//MIDDLEWARES
app.use(express.json());
app.use(require('./src/middlewares/logger'));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

const path = require('path');
app.use(express.static(path.join(__dirname, 'src/soporte-core-frontend')));

//ruta de prueba
app.get('/', (req, res) => {
    res.send('Soporte Interno - HR HelpDesk API funcionando');
});

//rutas principales
const authRoutes = require('./src/routes/auth.routes');
app.use('/auth', authRoutes);

const usersRoutes = require('./src/routes/users.routes');
app.use('/users', usersRoutes);

const ticketsRoutes = require('./src/routes/tickets.routes');
app.use('/tickets', ticketsRoutes);

//ruta workflow (Practica 10)
const ticketWorkflowRoutes = require('./src/routes/ticketWorkflow.routes');
app.use('/tickets', ticketWorkflowRoutes);

//SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true
    }
}));

//middleware 404 
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

const errorHandler = require('./src/middlewares/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Documentación: http://localhost:${PORT}/api-docs`);
});

