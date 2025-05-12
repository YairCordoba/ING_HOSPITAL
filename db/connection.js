const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'i8dug1f8ojbreopdjpv5',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_9adxPInZ9YG2XFpgmJYSewqy5IpZzoAdhbovgfksdV2',
    ssl: { rejectUnauthorized: false }
});

connect.connect((err) => {
    if (err) {
        console.error('Error en la conexión a la base de datos:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

module.exports = connect;
