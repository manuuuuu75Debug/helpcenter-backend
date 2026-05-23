const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'admin', 
  database: 'helpcenter',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la BD:', err.message);
  } else {
    console.log('¡Conectado a MySQL exitosamente!');
  }
});

module.exports = connection;