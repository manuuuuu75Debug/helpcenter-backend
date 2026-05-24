require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host:     process.env.MYSQLHOST,
    user:     process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port:     process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error de conexión a MySQL:', err.message);
    } else {
        console.log('✅ Conectado correctamente a MySQL con pool');
        connection.release();
    }
});

module.exports = pool;