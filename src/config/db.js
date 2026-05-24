require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool(process.env.MYSQL_URL);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error de conexión a MySQL:', err.message);
    } else {
        console.log('✅ Conectado correctamente a MySQL con pool');
        connection.release();
    }
});

module.exports = pool;