const mysql = require('mysql2');

const connect = mysql.createConnection({
    database: 'ing_soft',
    user: 'hdmjsdplre072l8gliog',
    host: 'aws.connect.psdb.cloud',
    password: 'pscale_pw_mV9uw594CD5XEjVC0F3kJe1xjqSNntZmYYgSxnHrUu4',
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
