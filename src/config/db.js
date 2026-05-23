// src/config/db.js

require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'helpcenter_user',           // ← Nuevo usuario
  password: process.env.DB_PASSWORD, // node ← Debe ser 123456
  database: process.env.DB_NAME,
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
    console.log('Usuario intentando conectar:', 'helpcenter_user');
  } else {
    console.log('✅ Conectado correctamente a MySQL con usuario helpcenter_user');
  }
});

module.exports = connection;