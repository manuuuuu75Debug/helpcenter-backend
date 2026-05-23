require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host:     process.env.MYSQLHOST,
    user:     process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port:     process.env.MYSQLPORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error de conexión a MySQL:', err.message);
    } else {
        console.log('✅ Conectado correctamente a MySQL');
    }
});

module.exports = connection;